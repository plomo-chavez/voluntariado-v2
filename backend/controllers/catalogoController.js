import Sequelize from "sequelize";
import db from "../models/index.js";
import functionsCustomHelper from "../controllers/helpers/functionsCustomHelper.js";
import CRUDController from "../controllers/CRUDController.js";
import functionHelper from "../controllers/db/functionHelper.js";
const { getRelaciones } = functionsCustomHelper;

const { Op } = Sequelize;

const { validateRecord, createRecord, updateRecord, processSoftDelete } =
  CRUDController;

const { handleIsAdmin, getAllFromModel } = functionHelper;

const models = db;

const CATALOGS_MAP = {
  "tipos-usuarios": {
    modelo: models.catTiposUsuarios,
    modeloString: "catTiposUsuarios",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  cargo: {
    modelo: models.catCargo,
    modeloString: "catCargo",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  areas: {
    modelo: models.catAreas,
    modeloString: "catAreas",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  delegacion: {
    modelo: models.catDelegacion,
    modeloString: "catDelegacion",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
    include: ["estado"],
  },
  dia: {
    modelo: models.catDia,
    modeloString: "catDia",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  estados: {
    modelo: models.catEstado,
    modeloString: "catEstado",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  "estado-civil": {
    modelo: models.catEstadoCivil,
    modeloString: "catEstadoCivil",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  "grado-estudios": {
    modelo: models.catGradoEstudios,
    modeloString: "catGradoEstudios",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  "tipos-sangre": {
    modelo: models.catGrupoSanguineo,
    modeloString: "catGrupoSanguineo",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  idiomas: {
    modelo: models.catIdioma,
    modeloString: "catIdioma",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  "medio-difusion": {
    modelo: models.catMedioDifusion,
    modeloString: "catMedioDifusion",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  nacionalidad: {
    modelo: models.catNacionalidad,
    modeloString: "catNacionalidad",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  parentesco: {
    modelo: models.catParentesco,
    modeloString: "catParentesco",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  "tipo-contacto": {
    modelo: models.catTipoContacto,
    modeloString: "catTipoContacto",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  "tipo-documento": {
    modelo: models.catTipoDocumento,
    modeloString: "catTipoDocumento",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
  turno: {
    modelo: models.catTurno,
    modeloString: "catTurno",
    primaryKey: "id",
    nameField: "label",
    supportsStatus: true,
    supportsSoftDelete: true,
  },
};

/**
 * ==============================
 * MODELS MAP
 * ==============================
 */

// prettier-ignore
const getModels = async (catalogo) => {
  return CATALOGS_MAP[catalogo] || null;
};

/**
 * ==============================
 * CONTROLLERS
 * ==============================
 */

const getData = async (req, res, isGetAll = false) => {
  try {
    const tabla = req.params.catalogo;
    console.log("Obteniendo datos para catálogo:", tabla);
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

    console.log("Datos recibidos para crear/actualizar:", dataModels);

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
  const includeRelations = dataModels.include
    ? await getRelaciones(dataModels.include)
    : [];

  console.log("Incluyendo relaciones:", includeRelations);
  const response = await getAllFromModel({
    model: dataModels.modelo,
    attributes: dataModels.attributes || null,
    include: includeRelations,
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
  let data = req.body || {};
  const { primaryKey, nameField } = dataModels;

  if (data?.[primaryKey] && !data.id) {
    data.id = data[primaryKey];
  }

  const modoCreacion = !data?.id;
  const valueToValidate = data?.[nameField];

  if (valueToValidate) {
    const existeRecord = await validateRecord(dataModels.modeloString, {
      [nameField]: valueToValidate,
      ...(!modoCreacion && {
        [primaryKey]: { [Op.ne]: data.id },
      }),
    });

    if (!existeRecord.result) {
      return {
        result: false,
        message: `El registro con ${nameField} '${valueToValidate}' ya existe en el catálogo '${dataModels.modeloString}'.`,
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

  const id = req.body?.id || req.body?.[dataModels.primaryKey];

  if (!id) {
    return res.json({
      result: false,
      message: "El ID del registro a eliminar es obligatorio.",
    });
  }

  if (softDelete && dataModels.supportsSoftDelete) {
    return res.json(await processSoftDelete(dataModels.modelo, id));
  }

  if (!dataModels.supportsStatus) {
    const record = await dataModels.modelo.findByPk(id);
    if (!record) {
      return res.json({
        result: false,
        message: "Registro no encontrado",
      });
    }

    await record.destroy();
    return res.json({
      result: true,
      message: "Registro eliminado con éxito",
    });
  }

  return res.json(
    await updateRecord(dataModels.modeloString, { id, estatus: 0 }),
  );
};

const processsData = (dataModels, data) => {
  // Normalizar objetos relacionados enviados desde el frontend
  if (data.estado && typeof data.estado === "object" && data.estado.id) {
    data.estado_id = data.estado.id;
    delete data.estado;
  }

  if (
    data.municipio &&
    typeof data.municipio === "object" &&
    data.municipio.id
  ) {
    data.municipio_id = data.municipio.id;
    delete data.municipio;
  }

  if (
    data.delegacion &&
    typeof data.delegacion === "object" &&
    data.delegacion.id
  ) {
    data.delegacion_id = data.delegacion.id;
    delete data.delegacion;
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
