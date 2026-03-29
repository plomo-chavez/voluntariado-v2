import db from "../models/index.js";
import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";

const { Usuarios, Logs } = db;
const { handleIsAdmin, getAllFromModel } = functionHelper;
const { createRecord } = CRUDController;

/**
 * ==============================
 * VALIDACIONES Y HELPERS
 * ==============================
 */

async function registrarLog(data) {
  const sessionMeta =
    data?.sessionMeta && typeof data.sessionMeta === "object"
      ? data.sessionMeta
      : data;

  const payload = {
    usuario_id:
      data?.usuario_id ?? data?.user_id ?? sessionMeta?.user_id ?? null,
    accion:
      data?.accion ??
      sessionMeta?.frase_inicio_sesion ??
      "Evento de sesion registrado",
    extraData:
      typeof data?.extraData === "string"
        ? data.extraData
        : JSON.stringify(sessionMeta || {}),
  };

  // Solo agrega usuario_id si existe; para intentos sin usuario identificado se guarda null.
  if (payload.usuario_id == null) {
    delete payload.usuario_id;
  }

  console.log("Registrando log:", payload);
  return await createRecord("Logs", payload);
}

const getAll = async (req, res) => {
  try {
    const paranoid = !handleIsAdmin(req);
    const filtros = req.body.filtros || {};
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;

    const attributes = null;

    const include = [
      {
        model: Usuarios,
        as: "usuario",
        attributes: ["id", "nombre"],
      },
    ];

    const response = await getAllFromModel({
      model: Logs,
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
      message: "Error al obtener logs",
      data: [],
    });
  }
};

export default {
  registrarLog,
  getAll,
};
