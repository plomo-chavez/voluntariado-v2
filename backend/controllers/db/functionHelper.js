/**
 * ==============================
 * Helpers
 * ==============================
 */

function normalizeNullRelations(rows) {
  if (!Array.isArray(rows)) return rows;

  return rows.map((row) => {
    const normalized = { ...row };

    for (const key of Object.keys(normalized)) {
      const value = normalized[key];

      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        "id" in value &&
        value.id === null
      ) {
        normalized[key] = null;
      }
    }

    return normalized;
  });
}

const handleIsAdmin = (req) => {
  try {
    const userRole = req?.user ?? null;

    if (!userRole) {
      console.log(
        "handleIsAdmin: El objeto 'user' no está definido en la solicitud.",
      );
    }

    if (typeof userRole.tipo_id === "undefined") {
      console.log(
        "handleIsAdmin: El atributo 'tipo_id' no está definido en el usuario.",
      );
    }

    return userRole.tipo_id === 2 || userRole.tipo_id === 1;
  } catch (error) {
    console.log("Error en handleIsAdmin:", error.message);
    return false;
  }
};

const handleTypeUser = (req) => {
  try {
    const userRole = req?.user ?? null;

    if (!userRole) {
      console.log(
        "handleTypeUser: El objeto 'user' no está definido en la solicitud.",
      );
    }

    if (typeof userRole.tipo_id === "undefined") {
      console.log(
        "handleTypeUser: El atributo 'tipo_id' no está definido en el usuario.",
      );
    }

    // prettier-ignore
    switch(userRole.tipo_id){
      case 1:  return 'dev'; break;
      case 2:  return 'admin'; break;
      case 3:  return 'nacional'; break;
      case 4:  return 'nacional'; break;
      case 5:  return 'estatal'; break;
      case 6:  return 'estatal'; break;
      case 7:  return 'local'; break;
      case 8:  return 'local'; break;
    }
  } catch (error) {
    console.log("Error en handleIsAdmin:", error.message);
    return false;
  }
};

async function getAllFromModel({
  model,
  filtros = {},
  attributes = [],
  include = [],
  page = 1,
  pageSize = 10,
  pagination = true,
  paranoid = false,
  order = [],
}) {
  try {
    const isAll = pageSize === -1 || !pagination;
    const offset = isAll ? null : (page - 1) * pageSize;
    const limit = isAll ? null : pageSize;

    const payload = {
      where: filtros,
      attributes,
      include,
      limit,
      offset,
      raw: true,
      nest: true,
      paranoid,
      order,
    };

    let { count, rows } = await model.findAndCountAll(payload);

    rows = normalizeNullRelations(rows);

    return {
      result: true,
      message: "Registros obtenidos con éxito",
      data: rows,
      pagination: {
        total: count,
        page,
        pageSize: isAll ? count : pageSize,
        totalPages: isAll ? 1 : Math.ceil(count / pageSize),
      },
    };
  } catch (error) {
    console.error("Error al obtener registros:", error);
    return {
      result: false,
      message: "Error al obtener registros: " + error.message,
      data: [],
      pagination: null,
    };
  }
}

/**
 * ==============================
 * EXPORT DEFAULT (CLAVE)
 * ==============================
 */

export default {
  handleIsAdmin,
  handleTypeUser,
  getAllFromModel,
};
