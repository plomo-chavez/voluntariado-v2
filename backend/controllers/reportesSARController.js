import db from "../models/index.js";
import functionHelper from "./db/functionHelper.js";
import functionsCustomHelper from "./helpers/functionsCustomHelper.js";
const { catDelegaciones, catEstados, catMunicipios, Reportes, Usuarios } = db;

const { getAllFromModel, handleIsAdmin } = functionHelper;
const { handleElementosAndUnidades } = functionsCustomHelper;

import CRUDController from "./CRUDController.js";

const { createRecord, updateRecord } = CRUDController;

/**
 * ==============================
 * Helpers internos
 * ==============================
 */

async function processData(data) {
  try {
    const isCreate = !data.id;

    let payload = {
      tipo: "SAR",
      timeInicio: data.horaInicio,
      timeFin: data.horaFin,
      fecha: data.fecha,
      estado_id: data?.estado?.id ?? null,
      municipio_id: data?.municipio?.id ?? null,
      delegacion_id: data?.delegacion?.id ?? null,
      data: JSON.stringify(data),
      userCreate_id: data?.userCreate_id ?? null,
    };

    const response = isCreate
      ? await createRecord("Reportes", payload)
      : await updateRecord("Reportes", payload);

    if (isCreate) {
      await handleElementosAndUnidades(data, response.data.dataValues.id);
    }

    return {
      result: true,
      message: isCreate
        ? "Registro creado con éxito"
        : "Registro actualizado con éxito",
      // data: response,
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
 * Controllers
 * ==============================
 */

const getAll = async (req, res) => {
  try {
    const isAdmin = handleIsAdmin(req);
    const paranoid = !isAdmin;

    const filtros = req.body.filtros || {};
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;

    const include = [
      { model: catEstados, as: "estado", attributes: ["id", "label"] },
      { model: catMunicipios, as: "municipio", attributes: ["id", "label"] },
      { model: catDelegaciones, as: "delegacion", attributes: ["id", "label"] },
    ];

    const response = await getAllFromModel({
      model: Reportes,
      filtros,
      include,
      page,
      pageSize,
      paranoid,
    });

    return res.json(response);
  } catch (error) {
    console.error("Error en getAll:", error);
    return res.json({
      result: false,
      message: "Error al obtener registros",
      data: [],
    });
  }
};

const createOrUpdate = async (req, res) => {
  const data = req.body;
  data.userCreate_id = req?.user?.id ?? null;
  const response = await processData(data);
  delete response.data;
  res.json(response);
};

/**
 * ==============================
 * EXPORT DEFAULT (CLAVE)
 * ==============================
 */

export default {
  getAll,
  createOrUpdate,
};
