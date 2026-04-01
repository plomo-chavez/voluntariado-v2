import Sequelize from "sequelize";
import db from "../models/index.js";

import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";

const { Op } = Sequelize;
const { volInfo } = db;

const { getAllFromModel } = functionHelper;
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

  return tmp;
}

async function saveElemento(data) {
  try {
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

    const payload = transformElementoData(data);

    console.log("[payload] =>", payload);
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

    console.log("[verificar] =>", {
      curp,
      elemento,
      exists: !!elemento,
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

export default {
  getAll,
  createOrUpdate,
  delete: remove,
  softDelete,
  verificar,
};
