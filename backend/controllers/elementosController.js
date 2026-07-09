import { PDFDocument } from "pdf-lib";
import Sequelize from "sequelize";
import db from "../models/index.js";

import functionsCustomHelper from "../controllers/helpers/functionsCustomHelper.js";
import { calcularEdad } from "../utils/fechasHelper.js";
import {
  generatePdfFromTemplateHTML,
  prepareDocuments,
} from "../utils/generateFilesHelper.js";
import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";
const { Op } = Sequelize;
const { volInfo, estadoElementos } = db;

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
async function createNumberUnique(payload) {
  let estadisticaEstado = await estadoElementos.findOne({
    where: { estado_id: payload.estado_id },
  });

  let numero = 1;

  if (!estadisticaEstado) {
    estadisticaEstado = await estadoElementos.create({
      estado_id: payload.estado_id,
      numero,
    });
  } else {
    await estadisticaEstado.increment("numero");
    numero = estadisticaEstado.numero + 1;
  }

  const anio = new Date().getFullYear().toString().slice(-2);

  payload.numero_interno = `${payload.estado_id}${anio}${String(numero).padStart(4, "0")}`;
  return payload;
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

      if (isCreate) {
        payload = await createNumberUnique(payload);
      }

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

async function mergePdfBuffers(buffers = []) {
  if (!Array.isArray(buffers) || buffers.length === 0) return null;

  const mergedPdf = await PDFDocument.create();

  for (const buf of buffers) {
    const pdf = await PDFDocument.load(buf);
    const copied = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copied.forEach((p) => mergedPdf.addPage(p));
  }

  const merged = await mergedPdf.save();
  return Buffer.from(merged);
}

const descargarDocumentos = async (req, res) => {
  try {
    let { id_voluntario, documentos = [], all } = req.body;

    if (all) {
      documentos = ["caratula"];
    }
    const include = [];
    let data = {};

    if (!id_voluntario) {
      return res.json({
        result: false,
        message: "ID de voluntario es requerido",
        data: null,
      });
    }

    const voluntario = await volInfo.findOne({
      where: { id: id_voluntario },
      include,
      paranoid: false,
    });

    if (documentos.includes("caratula")) {
      data = {
        ...data,
        interno: voluntario.numero_interno || "-",
        asociacion: voluntario.numero_asociado || "-",
        fechaCR: voluntario.fecha_cr,
        fechaArea: voluntario.fecha_area,
        antiguedad: calcularEdad(voluntario.fecha_cr) + " años",
        nombre:
          voluntario.nombre +
          (voluntario.segundo_nombre ? " " + voluntario.segundo_nombre : "-"),
        paterno: voluntario.primer_apellido,
        materno: voluntario.segundo_apellido,
        curp: voluntario.curp,
        correo: voluntario.correo,
        cargo: voluntario.cargo || "-",
        delegacion: voluntario.delegacion || "-",
        area: voluntario.area || "-",
        telefono: voluntario.telefono,
      };
    }

    if (!Array.isArray(documentos) || documentos.length === 0) {
      return res.status(400).json({
        result: false,
        message: "Se requiere un array 'documentos' con al menos un elemento",
        data: null,
      });
    }

    const filesGenerated = [];

    try {
      // Procesar cada documento: validar y generar PDF temporal
      for (let i = 0; i < documentos.length; i++) {
        const doc = documentos[i];
        const result = await generatePdfFromTemplateHTML({
          outDir: "backend/assets/tmp",
          template: doc,
          data,
        });

        const buf = result.buffer;
        filesGenerated.push(result);
      }
      const response = await prepareDocuments({
        documents: filesGenerated,
      });

      return res.json(response);
    } catch (error) {
      return res.status(500).json({
        result: false,
        message: "Error al generar documentos: " + error.message,
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: "Error al descargar documentos: " + error.message,
      data: { errorCode: error.code, errorMessage: error.message },
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
