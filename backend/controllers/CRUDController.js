import db from "../models/index.js";

const { sequelize } = db;

/**
 * ==============================
 * CREATE OR UPDATE
 * ==============================
 */

const createOrUpdatedRecord = async (tabla, data) => {
  try {
    const isCreate = !data.id;
    return isCreate
      ? await createRecord(tabla, data)
      : await updateRecord(tabla, data);
  } catch (error) {
    console.error("Error en createOrUpdatedRecord:", error);
    return {
      result: false,
      message: "Error en createOrUpdatedRecord: " + error.message,
    };
  }
};

const createRecord = async (tabla, data) => {
  try {
    const nuevoRegistro = await sequelize.models[tabla].create(data);

    return {
      result: true,
      message: "Registro creado con éxito",
      data: nuevoRegistro,
    };
  } catch (error) {
    console.error("Error al crear registro:", error);
    return {
      result: false,
      message: "Error al crear registro: " + error.message,
    };
  }
};

const updateRecord = async (tabla, data) => {
  try {
    const id = data.id ?? null;

    if (!id) {
      return {
        result: false,
        message: "ID requerido para actualizar",
      };
    }

    const registro = await sequelize.models[tabla].findByPk(id);

    if (!registro) {
      return {
        result: false,
        message: "Registro no encontrado",
      };
    }

    await registro.update(data);

    return {
      result: true,
      message: "Registro actualizado con éxito",
      data: registro,
    };
  } catch (error) {
    console.error("Error al actualizar registro:", error);
    return {
      result: false,
      message: "Error al actualizar registro: " + error.message,
    };
  }
};

const validateRecord = async (tabla, filters) => {
  try {
    const registro = await sequelize.models[tabla].findOne({ where: filters });

    return registro
      ? { result: false, message: "El registro ya existe" }
      : { result: true, message: "Validación exitosa" };
  } catch (error) {
    console.error("Error al validar registro:", error);
    return {
      result: false,
      message: "Error al validar registro: " + error.message,
    };
  }
};

const deleteRecord = async (tabla, id) => {
  try {
    const registro = await sequelize.models[tabla].findByPk(id);

    if (!registro) {
      return {
        result: false,
        message: "Registro no encontrado",
      };
    }

    await registro.destroy();

    return {
      result: true,
      message: "Registro eliminado con éxito",
    };
  } catch (error) {
    console.error("Error al eliminar registro:", error);
    return {
      result: false,
      message: "Error al eliminar registro: " + error.message,
    };
  }
};

/**
 * ==============================
 * RETURN DATA HELPERS
 * ==============================
 */

const isReturnDataValid = (data) => {
  const dataTMP = { ...data };
  let returnData = data.returnData || false;

  if (returnData !== false) {
    returnData =
      Array.isArray(returnData) || returnData === true ? returnData : false;
    delete dataTMP.returnData;
  }

  return { data: dataTMP, returnData };
};

const processReturnData = (returnData, data, response) => {
  if (returnData === false) {
    delete response.data;
    return response;
  }

  if (Array.isArray(data.returnData)) {
    const dataBD = response.data?.toJSON
      ? response.data.toJSON()
      : response.data;

    const filteredItem = {};
    data.returnData.forEach((field) => {
      filteredItem[field] = dataBD[field] !== undefined ? dataBD[field] : null;
    });

    delete response.data;
    return { ...response, data: filteredItem };
  }

  return response;
};

const processSoftDelete = async (model, id) => {
  try {
    const record = await model.findByPk(id, { paranoid: false });

    if (!record) {
      return {
        result: false,
        message: "Registro no encontrado",
      };
    }

    const isDestroyOrRestore = record?.deleted_at != null;

    if (isDestroyOrRestore) {
      await record.restore();
      return {
        result: true,
        message: "Registro restaurado con éxito",
      };
    }

    await record.destroy();

    return {
      result: true,
      message: "Registro eliminado con éxito",
    };
  } catch (error) {
    console.log("Error al procesar eliminación suave:", error);
    return {
      result: false,
      message: "Error al procesar eliminación suave: " + error.message,
    };
  }
};

/**
 * ==============================
 * EXPORT DEFAULT (CLAVE)
 * ==============================
 */

export default {
  createOrUpdatedRecord,
  createRecord,
  updateRecord,
  validateRecord,
  deleteRecord,
  isReturnDataValid,
  processReturnData,
  processSoftDelete,
};
