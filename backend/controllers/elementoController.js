import bcrypt from "bcryptjs";
import Sequelize from "sequelize";
import db from "../models/index.js";

import encryptHelper from "../utils/encryptHelper.js";
import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";

const { Elementos, catEstados, catMunicipios, catDelegaciones } = db;
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

async function transformUserData(data) {
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

async function saveUser(data) {
  try {
    const isCreate = !data.id;
    const payloadExisteRecord = isCreate
      ? {
          numeroAsociado: data.numeroAsociado,
        }
      : {
          numeroAsociado: data.numeroAsociado,
          curp: data.curp,
          id: { [Op.ne]: data.id },
        };

    const existeRecord = await validateRecord("Elementos", payloadExisteRecord);

    if (!existeRecord.result) {
      return {
        result: false,
        message: isCreate
          ? "El número de asociado ya está en uso"
          : "El número de asociado y/o la curp ya está en uso",
        data: [],
      };
    }

    data = await transformUserData(data);

    const usuario = isCreate
      ? await createRecord("Elementos", data)
      : await updateRecord("Elementos", data);

    return {
      result: true,
      message: isCreate
        ? "Registro creado con éxito"
        : "Registro actualizado con éxito",
      data: usuario,
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
      "nombre",
      "segundoNombre",
      "primerApellido",
      "segundoApellido",
      "numeroAsociado",
      "curp",
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
      model: Elementos,
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
      message: "Error al obtener Elementos",
      data: [],
    });
  }
};

const createOrUpdate = async (req, res) => {
  const response = await saveUser(req.body);
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

  const response = await updateRecord("Elementos", { id, estatus: 0 });
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

  const response = await processSoftDelete(Elementos, id);
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
