import db from "../models/index.js";
import functionHelper from "./db/functionHelper.js";

const { handleTypeUser } = functionHelper;

const models = db;

const tablaMap = {
  "tipos-usuarios": {
    tabla: "catTiposUsuarios",
    filtros: { estatus: 1, id: { [db.Sequelize.Op.notIn]: [1, 2, 3] } },
    filtrosDev: { estatus: 1 },
    filtrosAdmin: { id: { [db.Sequelize.Op.notIn]: [1] } },
    // filtrosAdmin: { id: { [db.Sequelize.Op.notIn]: [1] } },
  },
  estados: {
    tabla: "catEstado",
    filtros: { estatus: 1 },
  },
  municipios: {
    tabla: "catMunicipios",
    filtros: { estatus: 1 },
  },
  delegaciones: {
    tabla: "catDelegacion",
    filtros: { estatus: 1 },
  },
  areas: {
    tabla: "catAreas",
    filtros: { estatus: 1 },
  },
  cargos: {
    tabla: "catCargo",
    filtros: { estatus: 1 },
  },
  "estado-civil": {
    tabla: "catEstadoCivil",
    filtros: { estatus: 1 },
  },
  "grupos-sanguineos": {
    tabla: "catGrupoSanguineo",
    filtros: { estatus: 1 },
  },
  nacionalidad: {
    tabla: "catNacionalidad",
    filtros: { estatus: 1 },
  },
  parentesco: {
    tabla: "catParentesco",
    filtros: { estatus: 1 },
  },
  "grados-estudios": {
    tabla: "catGradoEstudios",
    filtros: { estatus: 1 },
  },
  "medio-difusion": {
    tabla: "catMedioDifusion",
    filtros: { estatus: 1 },
  },
  idiomas: {
    tabla: "catIdioma",
    filtros: { estatus: 1 },
  },
};

const getCatalogo = async (req, res, tabla) => {
  try {
    const filtrosEntrada =
      req.body && Object.keys(req.body).length > 0 ? req.body : req.query || {};
    let filtros = filtrosEntrada || {};
    const tablaReal = tablaMap[tabla];

    if (!tablaReal) {
      return res.json({
        result: false,
        message: "[CatalogosController] Tabla no válida",
        data: [],
      });
    }

    filtros = { ...tablaReal.filtros, ...filtros };

    const typeUser = handleTypeUser(req);

    if (typeUser == "dev" && tablaMap[tabla]?.filtrosDev) {
      filtros = { ...filtrosEntrada, ...tablaMap[tabla].filtrosDev };
    }
    if (typeUser == "admin" && tablaMap[tabla]?.filtrosAdmin) {
      filtros = { ...filtrosEntrada, ...tablaMap[tabla].filtrosAdmin };
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
    let message = e.message || "Error al obtener los registros";
    if (e.original && e.original.sqlMessage) {
      message = e.original.sqlMessage;
    }
    return res.json({
      result: false,
      message: `[CatalogosController] ${message}`,
      data: [],
    });
  }
};

export default {
  getCatalogo,
};
