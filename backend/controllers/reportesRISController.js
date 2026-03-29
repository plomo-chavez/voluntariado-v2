import Sequelize from "sequelize";
import db from "../models/index.js";

import encryptHelper from "../utils/encryptHelper.js";
import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";

const {
  Reportes,
  catEstados,
  catMunicipios,
  catDelegaciones,
  catHorarios,
  Usuarios,
} = db;

const { Op } = Sequelize;
const { handleIsAdmin, getAllFromModel } = functionHelper;
const { createRecord, updateRecord, processSoftDelete } = CRUDController;
const { createShortToken, verifyShortToken } = encryptHelper;

/**
 * ==============================
 * HELPERS
 * ==============================
 */

async function getHorarios() {
  try {
    return await catHorarios.findAll({ raw: true });
  } catch (error) {
    console.error("Error al obtener los horarios:", error);
    throw new Error("No se pudieron obtener los horarios");
  }
}

async function getHorario(tipo, data) {
  let horaInicio = null;

  if (tipo === "RIS") {
    horaInicio = data.hora;
  }

  const horariosBD = await getHorarios();

  if (!horaInicio) return null;

  const [hora, minuto] = horaInicio.split(":").map(Number);
  const minutosInicio = hora * 60 + minuto;

  return horariosBD.find((h) => {
    const [hInicio, mInicio] = h.horaInicio.split(":").map(Number);
    const [hFin, mFin] = h.horaFin.split(":").map(Number);

    const inicio = hInicio * 60 + mInicio;
    const fin = hFin * 60 + mFin;

    if (fin < inicio) {
      return (
        (minutosInicio >= inicio && minutosInicio < 1440) ||
        (minutosInicio >= 0 && minutosInicio < fin)
      );
    }

    return minutosInicio >= inicio && minutosInicio < fin;
  });
}

async function processData(data) {
  try {
    const isCreate = !data.id;
    let payload = {};

    if (isCreate) {
      const horario = await getHorario("RIS", data);

      payload = {
        tipo: "RIS",
        timeInicio: data.hora,
        timeFin: data?.horaFin ?? null,
        fecha: data.fecha,
        estado_id: data?.estado?.id ?? null,
        area_id: data?.area?.id ?? null,
        horario_id: horario?.id ?? null,
        municipio_id: data?.municipio?.id ?? null,
        delegacion_id: data?.delegacion?.id ?? null,
        data: JSON.stringify(data),
        data: JSON.stringify(data),
        userCreate_id: data?.userCreate_id ?? null,
      };
    }

    const result = isCreate
      ? await createRecord("Reportes", payload)
      : await updateRecord("Reportes", payload);

    return {
      result: true,
      message: isCreate
        ? "Registro creado con éxito"
        : "Registro actualizado con éxito",
      data: result,
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
    console.log("Error en getAll:", error);
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
  console.log("Data recibida en createOrUpdate:", data);
  const response = await processData(data);
  if (response.data) delete response.data;
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
};
