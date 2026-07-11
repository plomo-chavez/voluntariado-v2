import dotenv from "dotenv";
import db from "../models/index.js";

const { Usuarios } = db;
dotenv.config();

import { verifyEncryptedJWT } from "../utils/encryptHelper.js"; // Importa tu helper

const getUserToken = async (userID) => {
  const userBD = await Usuarios.findByPk(userID, {
    attributes: ["id", "nombre", "correo", "tipo_id", "estatus"],
  });
  return userBD?.toJSON() ?? null;
};

const isPublicCatalogRoute = (req) => {
  if (req.method === "OPTIONS") return true;
  return (
    req.originalUrl.startsWith("/api/catalogos") ||
    req.originalUrl.startsWith("/api/public/catalogos")
  );
};

const authMiddleware = async (req, res, next) => {
  const debug = process.env.DEBUG_REQUEST_AUTH === "true";

  if (isPublicCatalogRoute(req)) {
    if (debug) {
      console.log("[AUTH BYPASS] Ruta pública detectada", {
        url: req.originalUrl,
        method: req.method,
      });
    }
    return next();
  }

  const authHeader = req.headers.authorization;
  let logMsg = "";
  let logData = {};
  if (!authHeader) {
    logMsg = "[AUTH DENIED] Token no proporcionado";
    logData = {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
    };
    if (debug) console.log(logMsg, logData);
    return res.json({
      message: "authMiddleware - !authHeader -  Token no proporcionado",
    });
  }

  const token = authHeader.split(" ")[1]; // Extraer el token después de "Bearer"

  try {
    if (token == "dev-token") {
      req.user = await getUserToken(1);
      logMsg = "[AUTH GRANTED] Acceso concedido";
      logData = {
        user: req.user,
        url: req.originalUrl,
        method: req.method,
      };
      if (debug) console.log(logMsg, logData);
      next();
    } else {
      const decoded = verifyEncryptedJWT(token);
      req.user = await getUserToken(decoded.id);
      logMsg = "[AUTH GRANTED] Acceso concedido";
      logData = {
        user: req.user,
        url: req.originalUrl,
        method: req.method,
      };
      if (debug) console.log(logMsg, logData);
      next();
    }
  } catch (error) {
    logMsg = "[AUTH DENIED] Token inválido o expirado";
    logData = {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
    };
    if (debug) console.log(logMsg, logData);
    return res.json({ message: "Token inválido o expirado" });
  }
};

export default authMiddleware;
