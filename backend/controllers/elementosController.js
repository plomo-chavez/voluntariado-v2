import Sequelize from "sequelize";
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

      console.log("[payload] =>", payload);
      break;
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
      // "idiomas",
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

export default {
  getAll,
  getById,
  createOrUpdate,
  delete: remove,
  softDelete,
  verificar,
};
