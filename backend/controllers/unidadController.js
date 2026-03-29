import bcrypt from "bcryptjs";
import Sequelize from "sequelize";
import db from "../models/index.js";

import encryptHelper from "../utils/encryptHelper.js";
import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";

const { Unidades, catEstados, catMunicipios, catDelegaciones } = db;
const { Op } = Sequelize;

const { handleIsAdmin, getAllFromModel } = functionHelper;
const { validateRecord, createRecord, updateRecord, processSoftDelete } =
  CRUDController;
const { createShortToken, verifyShortToken } = encryptHelper;

/**
 * ==============================
 * VALIDACIONES Y HELPERS
 * ==============================
 */

async function transformData(data) {
  if (data.estatus) {
    data.estatus =
      data.estatus === "Activo" ||
      data.estatus === true ||
      data.estatus === "true"
        ? 1
        : 0;
  }
  if (data.estado) {
    data.estado_id = data.estado.id;
    delete data.estado;
  }
  if (data.municipio) {
    data.municipio_id = data.municipio.id;
    delete data.municipio;
  }
  if (data.delegacion) {
    data.delegacion_id = data.delegacion.id;
    delete data.delegacion;
  }

  return data;
}

async function handleSaveOrCreate(data) {
  try {
    const isCreate = !data.id;
    const payloadExisteRecord = isCreate
      ? {
          numero: data.numero,
        }
      : {
          numero: data.numero,
          serie: data.serie,
          id: { [Op.ne]: data.id },
        };

    const existeRecord = await validateRecord("Unidades", payloadExisteRecord);

    if (!existeRecord.result) {
      return {
        result: false,
        message: isCreate
          ? "El número de unidad ya está en uso"
          : "El número de unidad y/o la serie ya está en uso",
        data: [],
      };
    }

    data = await transformData(data);

    const registro = isCreate
      ? await createRecord("Unidades", data)
      : await updateRecord("Unidades", data);

    return {
      result: true,
      message: isCreate
        ? "Registro creado con éxito"
        : "Registro actualizado con éxito",
      data: registro,
    };
  } catch (e) {
    return {
      result: false,
      message: "Error al guardar el registro: " + e.message,
      data: [],
    };
  }
}

/**
 * ==============================
 * CONTROLLERS
 * ==============================
 */

const getAll = async (req, res) => {
  try {
    const paranoid = !handleIsAdmin(req);
    const filtros = req.body.filtros || {};
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;

    const attributes = [
      "id",
      "numero",
      "marca",
      "modelo",
      "serie",
      "estatus",
      "created_at",
      "updated_at",
      "deleted_at",
    ];

    const include = [
      { model: catEstados, as: "estado", attributes: ["id", "label"] },
      { model: catMunicipios, as: "municipio", attributes: ["id", "label"] },
      { model: catDelegaciones, as: "delegacion", attributes: ["id", "label"] },
    ];

    const response = await getAllFromModel({
      model: Unidades,
      filtros,
      attributes,
      include,
      page,
      pageSize,
      paranoid,
    });

    return res.json(response);
  } catch (error) {
    console.log("Error en getAll:", error);
    return res.json({
      result: false,
      message: "Error al obtener Unidades",
      data: [],
    });
  }
};

const createOrUpdate = async (req, res) => {
  const response = await handleSaveOrCreate(req.body);
  if (response.data) delete response.data;
  res.json(response);
};

const remove = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({
      result: false,
      message: "ID del registro es requerido",
    });
  }

  const response = await updateRecord("Unidades", { id, estatus: 0 });
  res.json(response);
};

const softDelete = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({
      result: false,
      message: "ID del registro es requerido",
    });
  }

  const response = await processSoftDelete(Unidades, id);
  res.json(response);
};

/**
 * ==============================
 * EXPORT DEFAULT
 * ==============================
 */

export default {
  getAll,
  createOrUpdate,
  delete: remove,
  softDelete,
};
