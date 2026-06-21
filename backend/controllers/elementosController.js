import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import Sequelize from "sequelize";
import { fileURLToPath } from "url";
import db from "../models/index.js";

import functionsCustomHelper from "../controllers/helpers/functionsCustomHelper.js";
import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";
const { Op } = Sequelize;
const { volInfo } = db;

const { getAllFromModel } = functionHelper;
const { getRelaciones } = functionsCustomHelper;
const { validateRecord, createRecord, updateRecord, processSoftDelete } =
  CRUDController;

function validateElementoData(data) {
  if (!data.curp || !data.nombre || !data.primer_apellido) {
    return {
      result: false,
      message: "Faltan campos requeridos (curp, nombre, primer_apellido)",
      data: [],
    };
  }

  return { result: true };
}

function transformElementoData(data) {
  const tmp = { ...data };

  tmp.curp = (tmp.curp || "").toUpperCase().trim();

  if (tmp.estado?.id) {
    tmp.estado_id = tmp.estado.id;
    delete tmp.estado;
  }

  if (tmp.delegacion?.id) {
    tmp.delegacion_id = tmp.delegacion.id;
    delete tmp.delegacion;
  }

  if (tmp.area?.id) {
    tmp.area_id = tmp.area.id;
    delete tmp.area;
  }

  if (tmp.cargo?.id) {
    tmp.cargo_id = tmp.cargo.id;
    delete tmp.cargo;
  }

  if (tmp.nacionalidad?.id) {
    tmp.nacionalidad_id = tmp.nacionalidad.id;
    delete tmp.nacionalidad;
  }

  if (tmp.estado_civil?.id) {
    tmp.estado_civil_id = tmp.estado_civil.id;
    delete tmp.estado_civil;
  }

  if (tmp.grupo_sanguineo?.id) {
    tmp.grupo_sanguineo_id = tmp.grupo_sanguineo.id;
    delete tmp.grupo_sanguineo;
  }
  return tmp;
}

async function saveVolIdiomas(id_voluntario, idiomas = []) {
  if (!id_voluntario) {
    return {
      result: false,
      message: "El id_voluntario es requerido para guardar idiomas",
      data: [],
    };
  }

  try {
    return await db.sequelize.transaction(async (transaction) => {
      await db.volIdioma.destroy({
        where: { id_voluntario },
        transaction,
      });

      const idiomasArray = Array.isArray(idiomas) ? idiomas : [];

      for (const item of idiomasArray) {
        await db.volIdioma.create(
          {
            id_voluntario,
            id_idioma: item.idioma.id,
            escrito: item.escrito || "",
            hablado: item.hablado || "",
          },
          { transaction },
        );
      }

      return {
        result: true,
        message: "Idiomas actualizados con éxito",
      };
    });
  } catch (error) {
    console.error("Error guardando idiomas:", error);
    return {
      result: false,
      message: "Error al guardar idiomas: " + error.message,
      data: [],
    };
  }
}

async function transformFormSectionsToPayload(data) {
  const sections = ["contacto", "salud"];
  let isCreate = false;
  let tableModel = "";
  let payload = {};
  let existeRecord;

  switch (data.section) {
    case "contacto":
      tableModel = "volDireccion";

      existeRecord = await validateRecord(
        tableModel,
        {
          id_voluntario: data.id_voluntario,
        },
        true,
      );

      isCreate = existeRecord.result;

      payload = {
        id_voluntario: data.id,
        direccion: data.direccion || "",
        colonia: data.colonia || "",
        numero_exterior: data.numero_exterior || "",
        numero_interior: data.numero_interior || "",
        ciudad: data.ciudad || "",
        cp: data.cp || "",
        id_estado: data.estado?.id || null,
      };

      break;
    case "emergencia":
      tableModel = "volContactoEmergencia";

      existeRecord = await validateRecord(
        tableModel,
        {
          id_voluntario: data.id_voluntario,
        },
        true,
      );

      isCreate = existeRecord.result;

      payload = {
        id_voluntario: data.id_voluntario,
        nombre: data.nombre || "",
        telefono: data.telefono || "",
        celular: data.celular || "",
        id_parentesco: data.parentesco?.id || "",
      };
      break;
    case "profesionales":
      tableModel = "volDatosProfesionales";

      existeRecord = await validateRecord(
        tableModel,
        {
          id_voluntario: data.id_voluntario,
        },
        true,
      );

      isCreate = existeRecord.result;

      payload = {
        id_voluntario: data.id_voluntario,
        id_grado_estudios: data.grado_estudios?.id || null,
        profesion: data.profesion || "",
        ocupacion_actual: data.ocupacion_actual || "",
        empresa: data.empresa || "",
        pasaporte: data.pasaporte || "",
        pasaporteVencimiento: data.pasaporteVencimiento || "",
        licencia: data.licencia || "",
        licenciaVencimiento: data.licenciaVencimiento || "",
      };
      break;
    case "interes":
      tableModel = "volInfoExtra";

      existeRecord = await validateRecord(
        tableModel,
        {
          id_voluntario: data.id_voluntario,
        },
        true,
      );

      isCreate = existeRecord.result;

      payload = {
        id_voluntario: data.id_voluntario,
        id_medio: data.medioDifusion?.id || null,
        motivo: data.motivo || "",
        expectativas: data.expectativas || "",
        otraInstitucion: data.otraInstitucion || 0,
      };

      break;
    case "idiomas":
      return saveVolIdiomas(data.id_voluntario, data.idiomas);
  }

  if (!isCreate) {
    payload.id = existeRecord.data.id;
  }

  const elemento = isCreate
    ? await createRecord(tableModel, payload)
    : await updateRecord(tableModel, payload);

  return {
    result: true,
    message: isCreate
      ? "Elemento creado con éxito"
      : "Elemento actualizado con éxito",
    data: elemento,
  };
}

async function saveElemento(data) {
  try {
    if (data.section) {
      return transformFormSectionsToPayload(data);
    } else {
      const isCreate = !data.id && !data.id;
      const validation = validateElementoData(data);
      if (!validation.result) return validation;

      const existeCurp = await validateRecord("volInfo", {
        curp: data.curp,
        ...(!isCreate && {
          id: {
            [Op.ne]: data.id || data.id,
          },
        }),
      });

      if (!existeCurp.result) {
        return {
          result: false,
          message: "La CURP ya está registrada",
          data: [],
        };
      }

      let payload = transformElementoData(data);

      const elemento = isCreate
        ? await createRecord("volInfo", payload)
        : await updateRecord("volInfo", payload);

      return {
        result: true,
        message: isCreate
          ? "Elemento creado con éxito"
          : "Elemento actualizado con éxito",
        data: elemento,
      };
    }
  } catch (e) {
    let errorMessage = {
      result: false,
      message: "Error al guardar el elemento: " + e.message,
      data: [],
    };
    console.log("[errorMessage] =>", errorMessage);
    return errorMessage;
  }
}

const getAll = async (req, res) => {
  try {
    const filtros = req.body.filtros || {};
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;

    const attributes = [
      "id",
      "curp",
      "nombre",
      "segundo_nombre",
      "primer_apellido",
      "segundo_apellido",
      "correo",
      "estado_id",
      "delegacion_id",
      "estatus",
      "created_at",
      "updated_at",
      "deleted_at",
    ];

    const response = await getAllFromModel({
      model: volInfo,
      filtros,
      attributes,
      include: [],
      page,
      pageSize,
      paranoid: false,
    });

    return res.json(response);
  } catch (error) {
    return res.json({
      result: false,
      message: "Error al obtener elementos: " + error.message,
      data: [],
    });
  }
};

const createOrUpdate = async (req, res) => {
  const response = await saveElemento(req.body || {});
  if (response.data) delete response.data;
  return res.json(response);
};

const remove = async (req, res) => {
  const id = req.body?.id || req.body?.id_voluntario;

  if (!id) {
    return res.json({
      result: false,
      message: "ID de elemento es requerido",
    });
  }

  if (!volInfo.rawAttributes?.estatus) {
    return res.json({
      result: false,
      message:
        "El modelo volInfo no tiene columna 'estatus'. Usa softDelete para eliminar.",
    });
  }

  const response = await updateRecord("volInfo", { id, estatus: 0 });
  return res.json(response);
};

const softDelete = async (req, res) => {
  const id = req.body?.id || req.body?.id_voluntario;

  if (!id) {
    return res.json({
      result: false,
      message: "ID de elemento es requerido",
    });
  }

  const response = await processSoftDelete(volInfo, id);
  return res.json(response);
};

const verificar = async (req, res) => {
  try {
    const curp = (req.body?.curp || "").trim().toUpperCase();

    if (!curp) {
      return res.json({
        result: false,
        exists: false,
        message: "La CURP es requerida",
      });
    }

    const elemento = await volInfo.findOne({
      where: { curp },
      attributes: ["id", "curp", "nombre", "primer_apellido"],
      paranoid: false,
    });

    return res.json({
      result: true,
      message: elemento
        ? "La CURP ya está registrada"
        : "La CURP está disponible",
      data: !!elemento,
    });
  } catch (error) {
    return res.json({
      result: false,
      message: "Error al verificar CURP: " + error.message,
      data: false,
    });
  }
};

const getById = async (req, res) => {
  try {
    const id = req.params?.id;

    if (!id) {
      return res.json({
        result: false,
        message: "ID de elemento es requerido",
        data: null,
      });
    }

    const relaciones = await getRelaciones([
      "area",
      "cargo",
      "delegacion",
      "direccion",
      "contactoEmergencia",
      "estado",
      "estado_civil",
      "grupo_sanguineo",
      "nacionalidad",
      "idiomas",
      "profesionales",
      "intereses",
      // "disponibilidad",
    ]);

    const query = {
      where: { id },
      paranoid: false,
      include: [...relaciones],
    };

    const elemento = await volInfo.findOne(query);

    if (!elemento) {
      return res.json({
        result: false,
        message: "Elemento no encontrado",
        data: null,
      });
    }

    return res.json({
      result: true,
      message: "Elemento encontrado",
      data: elemento,
    });
  } catch (error) {
    return res.json({
      result: false,
      message: "Error al obtener elemento: " + error.message,
      data: null,
    });
  }
};

const descargarDocumentos = async (req, res) => {
  try {
    const {
      id_voluntario,
      documentos = [],
      all = false,
      placeholders = {},
    } = req.body;

    if (!id_voluntario) {
      return res.json({
        result: false,
        message: "ID de voluntario es requerido",
        data: null,
      });
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.join(
      __dirname,
      "../assets/caratula-template.html",
    );
    const outputDir = path.join(__dirname, "../assets/pruebas");
    const outputPath = path.join(outputDir, `caratula-${id_voluntario}.pdf`);

    let htmlTemplate = fs.readFileSync(templatePath, "utf8");

    const mergedPlaceholders = {
      ...(req.body.data || {}),
      ...(placeholders || {}),
      id_voluntario,
    };

    htmlTemplate = htmlTemplate.replace(/{{\s*([\w_-]+)\s*}}/g, (_, key) => {
      const value = mergedPlaceholders[key];
      return typeof value === "undefined" || value === null
        ? ""
        : String(value);
    });

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();

    // Logging adicional para depuración
    console.log("🔧 Debug PDF generation:");
    console.log(
      "   templatePath:",
      templatePath,
      "exists:",
      fs.existsSync(templatePath),
    );
    try {
      const tplStat = fs.statSync(templatePath);
      console.log("   template size:", tplStat.size, "bytes");
    } catch (e) {
      console.log("   no se pudo leer el template stat:", e.message);
    }
    console.log("   html length:", htmlTemplate ? htmlTemplate.length : 0);
    console.log("   pdfBuffer length:", pdfBuffer ? pdfBuffer.length : 0);

    fs.mkdirSync(outputDir, { recursive: true });
    try {
      fs.writeFileSync(outputPath, pdfBuffer);
      console.log("   fs.writeFileSync OK ->", outputPath);
    } catch (errWrite) {
      console.error("❌ Error escribiendo PDF en disco:", errWrite);
      return res.status(500).json({
        result: false,
        message: "Error guardando PDF en servidor: " + errWrite.message,
        data: { error: errWrite.code || null, path: outputPath },
      });
    }

    // Verificar que el archivo se creó correctamente
    const fileExists = fs.existsSync(outputPath);
    const fileStats = fileExists ? fs.statSync(outputPath) : null;

    console.log("📄 Info del PDF generado:");
    console.log("   Ruta:", outputPath);
    console.log("   Existe:", fileExists);
    console.log(
      "   Tamaño:",
      fileStats ? `${(fileStats.size / 1024).toFixed(2)} KB` : "N/A",
    );

    if (!fileExists) {
      return res.status(500).json({
        result: false,
        message: "Error: El archivo PDF no se creó correctamente",
        data: null,
      });
    }

    // Si la petición viene desde AJAX / front-end (Accept: application/json
    // o X-Requested-With) devolvemos el archivo en base64 para que el cliente
    // pueda iniciarle la descarga. Si se llama con ?download=true, usamos
    // res.download() para forzar descarga directa.
    const wantsDownload =
      String(req.query?.download || "").toLowerCase() === "true";
    const acceptHeader = (req.headers?.accept || "").toLowerCase();
    const isAjax = acceptHeader.includes("application/json") || req.xhr;

    // Responder con base64 para que el frontend lo convierta a Blob y lo descargue
    try {
      const fileBuffer = fs.readFileSync(outputPath);
      const fileBase64 = fileBuffer.toString("base64");
      return res.json({
        result: true,
        filename: `caratula-${id_voluntario}.pdf`,
        fileBase64,
        sizeKB: fileStats ? Math.round(fileStats.size / 1024) : null,
      });
    } catch (err) {
      console.error("❌ Error leyendo archivo para base64:", err);
      return res.status(500).json({
        result: false,
        message: "Error leyendo archivo para envío: " + err.message,
        data: null,
      });
    }
  } catch (error) {
    console.error("❌ Error en descargarDocumentos:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return res.status(500).json({
      result: false,
      message: "Error al descargar documentos: " + error.message,
      data: {
        errorCode: error.code,
        errorMessage: error.message,
      },
    });
  }
};

export default {
  getAll,
  getById,
  createOrUpdate,
  delete: remove,
  softDelete,
  verificar,
  descargarDocumentos,
};
