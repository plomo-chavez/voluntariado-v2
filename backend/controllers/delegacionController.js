import Sequelize from "sequelize";
import db from "../models/index.js";

import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";

const { catDelegaciones, catEstados, catMunicipios } = db;
const { Op } = Sequelize;

const { handleIsAdmin, getAllFromModel } = functionHelper;
const { createRecord, updateRecord, processSoftDelete } = CRUDController;

/**
 * ==============================
 * VALIDACIONES Y HELPERS
 * ==============================
 */

async function transformData(data) {
  data.estatus =
    data.estatus === "Activo" ||
    data.estatus === true ||
    data.estatus === "true"
      ? 1
      : 0;

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

    data = await transformData(data);

    const record = isCreate
      ? await createRecord("catDelegaciones", data)
      : await updateRecord("catDelegaciones", data);

    return {
      result: true,
      message: isCreate
        ? "Registro creado con éxito"
        : "Registro actualizado con éxito",
      data: record,
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

    const include = [
      { model: catEstados, as: "estado", attributes: ["id", "label"] },
      { model: catMunicipios, as: "municipio", attributes: ["id", "label"] },
    ];

    const response = await getAllFromModel({
      model: catDelegaciones,
      filtros,
      attributes: null,
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
      message: "Error al obtener registros",
      data: [],
    });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuarios.findOne({
      where: { id },
      attributes: ["id", "nombre", "correo", "tipo_id", "estatus"],
      include: [
        {
          model: catTiposUsuarios,
          as: "tipo",
          attributes: ["id", "label"],
        },
      ],
    });

    if (!usuario) {
      return res.json({
        result: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      result: true,
      message: "Usuario obtenido con éxito",
      data: usuario,
    });
  } catch (error) {
    console.log("Error al obtener usuario:", error);
    return res.json({
      result: false,
      message: "Error al obtener usuario",
    });
  }
};

const createOrUpdate = async (req, res) => {
  const response = await saveUser(req.body);
  if (response.data) delete response.data;
  res.json(response);
};

const deleteRecord = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({
      result: false,
      message: "ID de delegación es requerido",
    });
  }

  const response = await updateRecord("catDelegaciones", { id, estatus: 0 });
  res.json(response);
};

const softDelete = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({
      result: false,
      message: "ID de usuario es requerido",
    });
  }

  const response = await processSoftDelete(catDelegaciones, id);
  res.json(response);
};

/**
 * ==============================
 * EXPORT DEFAULT
 * ==============================
 */

export default {
  getAll,
  getUser,
  createOrUpdate,
  delete: deleteRecord,
  softDelete,
};
