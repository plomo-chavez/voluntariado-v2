import { PDFDocument } from "pdf-lib";
import Sequelize from "sequelize";
import db from "../models/index.js";

import functionsCustomHelper from "../controllers/helpers/functionsCustomHelper.js";
import { getDataNewFileExpediente } from "../utils/adminFilesHelper.js";
import { calcularEdad } from "../utils/fechasHelper.js";
import {
  generatePdfFromTemplateHTML,
  prepareDocuments,
} from "../utils/generateFilesHelper.js";
import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";
const { Op } = Sequelize;
const { volInfo, estadoElementos, catTipoDocumento } = db;

const { getAllFromModel, handleTypeUser } = functionHelper;
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
    case "salud":
      tableModel = "volInfo";

      existeRecord = await validateRecord(
        tableModel,
        {
          id: data.id_voluntario,
        },
        true,
      );

      isCreate = existeRecord.result;

      payload = {
        id: data.id_voluntario,
        seguro_personal: data.seguro_personal || "",
        seguro_institucional: data.seguro_institucional || "",
        capacidades_diferentes: data.capacidades_diferentes || "",
        enfermedades: data.enfermedades || "",
        alergias: data.alergias || "",
      };

      break;
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
        id_voluntario: data.id_voluntario,
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
    let filtros = req.body.filtros || {};
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;

    const relaciones = await getRelaciones([
      "area",
      "cargo",
      "delegacion",
      "estado",
    ]);

    const attributes = [
      "id",
      "curp",
      "nombre",
      "numero_asociado",
      "segundo_nombre",
      "primer_apellido",
      "segundo_apellido",
      "correo",
      "estatus",
      "created_at",
      "updated_at",
      "deleted_at",
    ];

    const userRole = req?.user ?? null;

    const typeUser = handleTypeUser(req);

    if (typeUser == "estatal") {
      filtros = { ...filtros, estado_id: userRole.estado_id };
    }

    if (typeUser == "local") {
      filtros = {
        ...filtros,
        estado_id: userRole.estado_id,
        delegacion_id: userRole.delegacion_id,
      };
    }

    const response = await getAllFromModel({
      model: volInfo,
      filtros,
      attributes,
      include: relaciones,
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
      return res.json({
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

// prettier-ignore
const transformarDocumentos = (documentos = [], documentosExpediente = []) => {
  // Obtener tipos únicos desde el catálogo
  const tipos = [
    ...new Set(
      documentosExpediente.map((doc) => doc.type).filter(Boolean)
    ),
  ];

  // IDs de documentos que pertenecen al catálogo
  const idsCatalogo = new Set(documentosExpediente.map((doc) => doc.id));

  const resultado = tipos.map((tipo) => {
    const catalogo = documentosExpediente.filter((doc) => doc.type === tipo);

    const documentosTipo = catalogo.map((tipoDocumento) => {
      const documento = documentos.find((doc) => doc.tipoDocumento?.id === tipoDocumento.id);

      return {
        numero: Number(tipoDocumento.orden),
        tipo_id: tipoDocumento.id,
        tipo_label: tipoDocumento.label,
        tipo_key: tipoDocumento.key,
        ruta_archivo: documento?.ruta_archivo ?? null,
        fecha_registro: documento?.fecha_registro ?? null,
        vigencia: documento?.vigencia ?? null,
      };
    });

    // Ordenar por número, dejando 0 al final
    documentosTipo.sort((a, b) => {
      if (a.numero === 0 && b.numero !== 0) return 1;
      if (b.numero === 0 && a.numero !== 0) return -1;

      return a.numero - b.numero;
    });

    return {
      tipo,
      documentos: documentosTipo,
    };
  });

  // Documentos que NO pertenecen al catálogo
  const otrosDocumentos = documentos
    .filter((documento) => !idsCatalogo.has(documento.tipoDocumento?.id))
    .map((documento) => ({
      numero: documento.numero != null
        ? Number(documento.numero)
        : 0,
      tipo_id: documento.tipoDocumento?.id ?? null,
      tipo_label: documento.tipoDocumento?.label ?? null,
      tipo_key: documento.tipoDocumento?.key ?? null,
      ruta_archivo: documento.ruta_archivo ?? null,
      fecha_registro: documento.fecha_registro ?? null,
      vigencia: documento.vigencia ?? null,
    }));

  // Ordenar también los "otros", dejando 0 al final
  otrosDocumentos.sort((a, b) => {
    if (a.numero === 0 && b.numero !== 0) return 1;
    if (b.numero === 0 && a.numero !== 0) return -1;

    return a.numero - b.numero;
  });

  // Agregar "otros" al final
  resultado.push({
    tipo: "otros",
    documentos: otrosDocumentos,
  });

  return resultado;
};

const getDocumentos = async (req, res) => {
  try {
    const { id_voluntario } = req.body;

    const documentosExpediente = await db.catTipoDocumento.findAll({
      where: { type: { [Op.or]: ["expediente", "formacion"], estatus: true } },
    });

    const documentosExpedienteJson = documentosExpediente.map((doc) =>
      doc.toJSON(),
    );

    if (!id_voluntario) {
      return res.json({
        result: false,
        message: "ID de voluntario es requerido",
        data: null,
      });
    }

    const documentos = await db.volDocumento.findAll({
      where: { id_voluntario },
      include: [
        {
          model: db.catTipoDocumento,
          as: "tipoDocumento",
        },
      ],
      paranoid: false,
    });

    // Transformamos los documentos antes de enviarlos como respuesta
    const documentosOrdenados = transformarDocumentos(
      documentos,
      documentosExpedienteJson,
    );

    return res.json({
      result: true,
      message: "Documentos obtenidos correctamente",
      data: documentosOrdenados,
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: "Error al obtener documentos: " + error.message,
      data: null,
    });
  }
};

async function cargarDocumento(req, res) {
  try {
    const { id_elemento, id, id_voluntario, documentoType } = req.body || {};
    const elementoId = id_elemento || id || id_voluntario;
    const file = req.file;

    if (!elementoId) {
      return res.json({
        result: false,
        message: "El id del elemento es requerido.",
      });
    }

    if (!documentoType) {
      return res.json({
        result: false,
        message: "El tipo de documento es requerido.",
      });
    }

    if (!file) {
      return res.json({
        result: false,
        message: "El documento es requerido.",
      });
    }

    const elemento = await db.volInfo.findByPk(elementoId, {
      attributes: ["id", "numero_interno"],
    });

    if (!elemento) {
      return res.json({
        result: false,
        message: "No se encontró el elemento indicado.",
      });
    }

    const documentoTypeBD = await catTipoDocumento.findOne({
      where: { key: documentoType },
    });

    if (!documentoTypeBD) {
      return res.json({
        result: false,
        message: "No se encontró el tipo de documento indicado.",
      });
    }
    const numeroInterno = String(elemento.numero_interno || "").trim();
    const estadoId = numeroInterno.slice(0, 2);

    if (!/^\d{2}/.test(numeroInterno)) {
      return res.json({
        result: false,
        message:
          "El elemento no tiene un número interno válido para determinar su estado.",
      });
    }

    const { relativePath } = getDataNewFileExpediente({
      file,
      documentType: documentoTypeBD,
      numeroInterno,
      estadoId,
    });

    const payloadDocument = {
      id_voluntario: elemento.id,
      id_tipo_documento: documentoTypeBD.id,
      tipoDocumento: documentoTypeBD.type,
      numero: documentoTypeBD?.orden ?? null,
      vigencia: null,
      ruta_archivo: relativePath,
      fecha_registro: new Date(),
    };

    if (documentoTypeBD.isUnique) {
      const existingDocument = await db.volDocumento.findOne({
        where: {
          id_voluntario: elemento.id,
          id_tipo_documento: documentoTypeBD.id,
        },
      });

      if (existingDocument) {
        await existingDocument.destroy({ force: true });
      }
    }
    const savedDocument = await db.volDocumento.create(payloadDocument);

    return res.status(200).json({
      result: true,
      message: "Documento cargado correctamente.",
      data: {
        documento: savedDocument,
        ruta: relativePath,
      },
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: "Error al cargar el documento: " + error.message,
    });
  }
}
export default {
  getAll,
  getById,
  createOrUpdate,
  delete: remove,
  softDelete,
  verificar,
  descargarDocumentos,
  cargarDocumento,
  getDocumentos,
};
