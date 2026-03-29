import db from "../models/index.js";
import functionHelper from "./db/functionHelper.js";

const { handleIsAdmin } = functionHelper;

const models = db;

const tablaMap = {
  "tipos-usuarios": {
    tabla: "catTiposUsuarios",
    filtros: { estatus: 1, id: { [db.Sequelize.Op.notIn]: [1, 2, 3] } },
    filtrosAdmin: { id: { [db.Sequelize.Op.notIn]: [1] } },
  },
  estados: {
    tabla: "catEstados",
    filtros: { estatus: 1 },
  },
  municipios: {
    tabla: "catMunicipios",
    filtros: { estatus: 1 },
  },
  delegaciones: {
    tabla: "catDelegaciones",
    filtros: { estatus: 1 },
  },
  "tipos-servicio": {
    tabla: "catTiposServicios",
    filtros: { estatus: 1 },
  },
  "tipos-agresion": {
    tabla: "catTiposAgresion",
    filtros: { estatus: 1 },
  },
  "tipos-incidente": {
    tabla: "catTiposIncidente",
    filtros: { estatus: 1 },
  },
  "tipos-solicitante": {
    tabla: "catTiposSolicitante",
    filtros: { estatus: 1 },
  },
  areas: {
    tabla: "catAreas",
    filtros: { estatus: 1 },
  },
  agresores: {
    tabla: "catAgresores",
    filtros: { estatus: 1 },
  },
  "sitios-incidente": {
    tabla: "catSitiosIncidente",
    filtros: { estatus: 1 },
  },
  horarios: {
    tabla: "catHorarios",
    filtros: {},
  },
};

const getCatalogo = async (req, res, tabla) => {
  try {
    let filtros = req.body || {};
    const tablaReal = tablaMap[tabla];

    if (!tablaReal) {
      return res.json({
        result: false,
        message: "Tabla no válida",
        data: [],
      });
    }

    filtros = { ...tablaReal.filtros, ...filtros };

    const isAdmin = handleIsAdmin(req);

    if (isAdmin && tablaMap[tabla]?.filtrosAdmin) {
      filtros = { ...filtros, ...tablaMap[tabla].filtrosAdmin };
    }

    const resultado = await models[tablaReal.tabla].findAll({
      where: filtros,
    });

    return res.json({
      result: true,
      message: "Registros obtenidos con éxito",
      data: resultado,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al obtener los registros: " + e.message,
      data: [],
    });
  }
};

export default {
  getCatalogo,
};
