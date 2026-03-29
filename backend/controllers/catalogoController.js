import Sequelize from "sequelize";
import db from "../models/index.js";

import CRUDController from "../controllers/CRUDController.js";
import functionHelper from "../controllers/db/functionHelper.js";

const { Op } = Sequelize;

const { validateRecord, createRecord, updateRecord, processSoftDelete } =
  CRUDController;

const { handleIsAdmin, getAllFromModel } = functionHelper;

const models = db;

/**
 * ==============================
 * MODELS MAP
 * ==============================
 */

// prettier-ignore
const getModels = async (catalogo) => {
  switch (catalogo) {
    case "tipos-usuarios":
      return {
        modelo: models.catTiposUsuarios,
        modeloString: "catTiposUsuarios",
        tabla: "catTiposUsuarios",
        isGetAll: catalogo === "tipos-usuarios",
      };
    default:
      return null;
  }
};

/**
 * ==============================
 * CONTROLLERS
 * ==============================
 */

const getData = async (req, res, isGetAll = false) => {
  try {
    const tabla = req.params.catalogo;
    const dataModels = await getModels(tabla);

    if (!dataModels) {
      return res.json({
        result: false,
        message: `El catálogo '${tabla}' no existe.`,
      });
    }

    if (isGetAll) {
      const response = await handleGetAll(req, dataModels);
      return res.json(response);
    }

    const response = await handleCreateOrUpdate(req, dataModels);
    return res.json(response);
  } catch (error) {
    console.log("Error al obtener datos:", error);
    return res.json({
      result: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

const handleGetAll = async (req, dataModels) => {
  const response = await getAllFromModel({
    model: dataModels.modelo,
    attributes: dataModels.attributes || null,
    include: dataModels.include || null,
    pagination: false,
    paranoid: false,
  });

  return {
    result: true,
    message: "Datos obtenidos con éxito",
    data: response.data,
    pagination: response.pagination,
  };
};

const handleCreateOrUpdate = async (req, dataModels) => {
  let data = req.body;
  const modoCreacion = !data?.id;

  if (data.label) {
    const existeRecord = await validateRecord(dataModels.modeloString, {
      label: data.label,
      ...(!modoCreacion && { id: { [Op.ne]: data.id } }),
    });

    if (!existeRecord.result) {
      return {
        result: false,
        message: `El registro con label '${data.label}' ya existe en el catálogo '${dataModels.modeloString}'.`,
      };
    }
  }

  data = processsData(dataModels, data);

  if (modoCreacion) {
    await createRecord(dataModels.modeloString, data);
  } else {
    await updateRecord(dataModels.modeloString, data);
  }

  return {
    result: true,
    message: modoCreacion
      ? "Registro creado con éxito"
      : "Registro actualizado con éxito",
  };
};

const deleteData = async (req, res) => handleDelete(req, res);
const deleteSoftData = async (req, res) => handleDelete(req, res, true);

const handleDelete = async (req, res, softDelete = false) => {
  const tabla = req.params.catalogo;
  const dataModels = await getModels(tabla);

  if (!dataModels) {
    return res.json({
      result: false,
      message: `El catálogo '${tabla}' no existe.`,
    });
  }

  const { id } = req.body;

  if (!id) {
    return res.json({
      result: false,
      message: "El ID del registro a eliminar es obligatorio.",
    });
  }

  if (softDelete) {
    return res.json(await processSoftDelete(dataModels.modelo, id));
  }

  return res.json(
    await updateRecord(dataModels.modeloString, { id, estatus: 0 }),
  );
};

const processsData = (dataModels, data) => {
  switch (dataModels.modeloString) {
    case "catMunicipios":
      if (data.estado?.id) {
        data.estado_id = data.estado.id;
        delete data.estado;
      }
      break;
    case "catDelegaciones":
      if (data.estado?.id) {
        data.estado_id = data.estado.id;
        delete data.estado;
      }
      if (data.municipio?.id) {
        data.municipio_id = data.municipio.id;
        delete data.municipio;
      }
      break;
    default:
      break;
  }
  return data;
};

/**
 * ==============================
 * EXPORT DEFAULT
 * ==============================
 */

export default {
  getData,
  delete: deleteData,
  deleteSoftData,
};
