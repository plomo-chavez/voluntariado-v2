import bcrypt from "bcryptjs";
import db from "../models/index.js";
import encryptHelper, { verifyEncryptedJWT } from "../utils/encryptHelper.js";
import logsController from "./logsController.js";
import permisosHelper from "../utils/permisosHelper.js";

const { Usuarios, catTiposUsuarios } = db;
const { createTokenJWT } = encryptHelper;
const { registrarLog } = logsController;
const { getPermiso } = permisosHelper;

const GEOIP_TIMEOUT_MS = 2500;

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim() !== "") {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    req.ip ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    null
  );
}

function normalizePublicIp(ip = "") {
  const value = String(ip || "").trim();
  if (!value) return null;

  if (value.startsWith("::ffff:")) {
    return value.replace("::ffff:", "");
  }

  return value;
}

function isPrivateOrLocalIp(ip = "") {
  if (!ip) return true;

  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;

  if (ip.startsWith("172.")) {
    const secondOctet = Number(ip.split(".")[1]);
    return (
      Number.isFinite(secondOctet) && secondOctet >= 16 && secondOctet <= 31
    );
  }

  return false;
}

function detectDeviceType(userAgent = "") {
  const ua = String(userAgent).toLowerCase();

  if (!ua) return "desconocido";
  if (/(tablet|ipad)/i.test(ua)) return "tablet";
  if (/(mobi|android|iphone|ipod)/i.test(ua)) return "movil";
  return "desktop";
}

function parseUserAgent(userAgent = "") {
  const ua = String(userAgent).toLowerCase();

  let so = "Desconocido";
  if (ua.includes("windows")) so = "Windows";
  else if (ua.includes("mac os") || ua.includes("macintosh")) so = "macOS";
  else if (ua.includes("android")) so = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios"))
    so = "iOS";
  else if (ua.includes("linux")) so = "Linux";

  let browser = "Desconocido";
  if (ua.includes("edg/")) browser = "Edge";
  else if (ua.includes("opr/") || ua.includes("opera")) browser = "Opera";
  else if (ua.includes("chrome/")) browser = "Chrome";
  else if (ua.includes("firefox/")) browser = "Firefox";
  else if (ua.includes("safari/") && !ua.includes("chrome/"))
    browser = "Safari";

  return { so, browser };
}

function normalizeTextValue(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed !== "" ? trimmed : null;
}

function normalizeLocation(location) {
  if (!location || typeof location !== "object") return null;

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const accuracy = Number(location.accuracy);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
  };
}

async function fetchGeoIpMetadata(ip) {
  const normalizedIp = normalizePublicIp(ip);

  if (!normalizedIp || isPrivateOrLocalIp(normalizedIp)) {
    return {
      pais: null,
      region: null,
      ciudad: null,
      asn: null,
      isp: null,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEOIP_TIMEOUT_MS);

  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(normalizedIp)}?fields=status,country,regionName,city,as,isp`;
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();

    if (data?.status !== "success") {
      return {
        pais: null,
        region: null,
        ciudad: null,
        asn: null,
        isp: null,
      };
    }

    const asn =
      typeof data.as === "string" && data.as.trim() !== ""
        ? data.as.split(" ")[0]
        : null;

    return {
      pais: data.country || null,
      region: data.regionName || null,
      ciudad: data.city || null,
      asn,
      isp: data.isp || null,
    };
  } catch (_error) {
    return {
      pais: null,
      region: null,
      ciudad: null,
      asn: null,
      isp: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildLoginPhrase(sessionMeta) {
  const locationText = [
    sessionMeta.ciudad,
    sessionMeta.region,
    sessionMeta.pais,
  ]
    .filter(Boolean)
    .join(", ");

  const safeLocation = locationText || "ubicacion no disponible";
  const safeUserName = sessionMeta.user_name || "desconocido";

  if (sessionMeta.resultado_login === "success") {
    return `Inicio de sesion exitoso para el usuario ${safeUserName} desde ${safeLocation}.`;
  }

  return `Intento de inicio de sesion fallido para el usuario ${safeUserName} desde ${safeLocation}. Motivo: ${sessionMeta.motivo_fallo || "No especificado"}.`;
}

function buildBaseSessionMeta(req, clientInfoFromBody) {
  const ipPublica = normalizePublicIp(getClientIp(req));
  const requestUserAgent = normalizeTextValue(req.headers["user-agent"]);
  const clientUserAgent = normalizeTextValue(clientInfoFromBody?.user_agent);
  const userAgent = clientUserAgent || requestUserAgent || "Desconocido";
  const { so, browser } = parseUserAgent(userAgent);

  return {
    timestamp_utc: new Date().toISOString(),
    user_id: null,
    user_name: null,
    ip_publica: ipPublica,
    pais: null,
    region: null,
    ciudad: null,
    asn: null,
    isp: null,
    user_agent: userAgent,
    device_type:
      normalizeTextValue(clientInfoFromBody?.device_type) ||
      detectDeviceType(userAgent),
    so,
    browser,
    device_id: normalizeTextValue(clientInfoFromBody?.device_id),
    idioma: normalizeTextValue(clientInfoFromBody?.idioma),
    timezone: normalizeTextValue(clientInfoFromBody?.timezone),
    location: normalizeLocation(clientInfoFromBody?.location),
    resultado_login: "failed",
    motivo_fallo: null,
    frase_inicio_sesion: null,
  };
}

function finalizeSessionMeta(
  baseMeta,
  { userId = null, userName = null, geoIp, resultado, motivoFallo = null },
) {
  const sessionMeta = {
    ...baseMeta,
    user_id: userId,
    user_name: userName,
    pais: geoIp?.pais || null,
    region: geoIp?.region || null,
    ciudad: geoIp?.ciudad || null,
    asn: geoIp?.asn || null,
    isp: geoIp?.isp || null,
    resultado_login: resultado,
    motivo_fallo: motivoFallo,
  };

  sessionMeta.frase_inicio_sesion = buildLoginPhrase(sessionMeta);
  return sessionMeta;
}

async function persistLoginLog(sessionMeta) {
  if (!sessionMeta) return;

  try {
    await registrarLog(sessionMeta);
  } catch (error) {
    console.error("Error al registrar log de login:", error);
  }
}

/**
 * LOGIN
 */
const login = async (req, res) => {
  try {
    const params = req.body || {};
    const clientInfoFromBody = params.clientInfo || {};
    const baseSessionMeta = buildBaseSessionMeta(req, clientInfoFromBody);
    const geoIp = await fetchGeoIpMetadata(baseSessionMeta.ip_publica);

    if (!params.email || !params.password) {
      const sessionMeta = finalizeSessionMeta(baseSessionMeta, {
        userName: normalizeTextValue(params.email),
        geoIp,
        resultado: "failed",
        motivoFallo: "Correo y contraseña son requeridos",
      });

      await persistLoginLog(sessionMeta);

      return res.json({
        result: false,
        message: "Correo y contraseña son requeridos",
        sessionMeta,
      });
    }

    const user = await Usuarios.findOne({
      where: {
        correo: params.email,
        estatus: 1,
      },
      include: [
        {
          model: catTiposUsuarios,
          as: "tipo",
          attributes: ["id", "label"],
        },
      ],
      raw: true,
      nest: true,
    });

    if (!user) {
      const sessionMeta = finalizeSessionMeta(baseSessionMeta, {
        userName: normalizeTextValue(params.email),
        geoIp,
        resultado: "failed",
        motivoFallo: "Usuario no encontrado o inactivo",
      });

      await persistLoginLog(sessionMeta);

      return res.json({
        result: false,
        message: "Usuario no encontrado o inactivo",
        sessionMeta,
      });
    }

    const passwordValida = await bcrypt.compare(params.password, user.password);

    if (!passwordValida) {
      const sessionMeta = finalizeSessionMeta(baseSessionMeta, {
        userId: user.id,
        userName: user.nombre,
        geoIp,
        resultado: "failed",
        motivoFallo: "Usuario o contraseña incorrectos",
      });

      await persistLoginLog(sessionMeta);

      return res.json({
        result: false,
        message: "Usuario o contraseña incorrectos",
        sessionMeta,
      });
    }
    const userData = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      tipo: user.tipo.label,
      tipo_id: user.tipo.id,
    };

    const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

    const encryptedToken = createTokenJWT(userData, expiresIn);
    const sessionMeta = finalizeSessionMeta(baseSessionMeta, {
      userId: user.id,
      userName: user.nombre,
      geoIp,
      resultado: "success",
      motivoFallo: null,
    });

    await persistLoginLog(sessionMeta);

    return res.json({
      result: true,
      message: "Usuario encontrado",
      data: {
        userData,
        token: encryptedToken,
        sessionMeta,
      },
    });
  } catch (error) {
    console.log("Error en login:", error);

    const sessionMeta = {
      timestamp_utc: new Date().toISOString(),
      user_id: null,
      user_name: normalizeTextValue(req.body?.email) || "desconocido",
      ip_publica: normalizePublicIp(getClientIp(req)),
      resultado_login: "failed",
      motivo_fallo: "Error interno al procesar login",
      frase_inicio_sesion:
        "Intento de inicio de sesion fallido por error interno.",
    };

    await persistLoginLog(sessionMeta);

    return res.json({
      result: false,
      message: "Error en login:" + error,
      sessionMeta,
    });
  }
};

const verificarToken = async (req, res) => {
  let params = req.body || {};
  let token = params.token || req.headers.authorization;
  if (!token) {
    return res.json({
      result: false,
      message: "verificarToken - Token no proporcionado",
    });
  }
  try {
    // Verifica y decodifica el token JWT
    const decoded = verifyEncryptedJWT(token);

    if (!decoded) {
      return res.json({
        result: false,
        message: "Token inválido",
      });
    }

    // Busca al usuario por ID
    let user = await Usuarios.findOne({
      where: { id: decoded.id },
      include: [
        {
          model: catTiposUsuarios,
          as: "tipo",
          attributes: ["id", "label"],
        },
      ],
    });

    if (!user) {
      return res.json({
        result: false,
        message: "Usuario no encontrado",
      });
    }
    const pagina = req.params.pagina || null;
    if (pagina) {
      const tienePermiso = await getPermiso({
        pagina,
        usuario_id: user.id,
        tipo_id: user.tipo_id,
      });

      if (!tienePermiso) {
        return res.json({
          result: false,
          message: "No tienes permisos para acceder a esta página",
        });
      }
    }

    const userData = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      tipo: user.tipo.label,
      tipo_id: user.tipo.id,
    };

    return res.json({
      result: true,
      data: userData,
      message: "Usuario verificado",
    });
  } catch (error) {
    console.log("Error al verificar el token:", error.message);
    return res.json({
      result: false,
      message: "Error al verificar el token",
    });
  }
};

export default {
  login,
  verificarToken,
};
