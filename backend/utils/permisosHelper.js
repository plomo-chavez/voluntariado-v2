import db from "../models/index.js";

const ALWAYS_VISIBLE_ROUTES = new Set(["root"]);

/**
 * Valida acceso a una página por route_name.
 * Prioridad:
 * 1) permiso por usuario_id
 * 2) permiso por tipo_usuario_id
 * 3) false si no existe ninguno
 */
export async function getPermiso({
  pagina,
  usuario_id,
  tipo_id,
  showLogs = false,
}) {
  const routeName = String(pagina || "").trim();
  const userId = Number(usuario_id);
  const tipoId = Number(tipo_id);

  if (!routeName) return false;

  if (ALWAYS_VISIBLE_ROUTES.has(routeName)) {
    if (showLogs) {
      console.log(
        `[Validacion de Pagina]     Ruta "${routeName}" siempre visible.`,
      );
    }
    return true;
  }

  const pages = await db.sequelize.query(
    `SELECT cp.id
     FROM config_pages cp
     WHERE cp.route_name = :pagina
       AND cp.estatus = 1
       AND cp.deleted_at IS NULL
     LIMIT 1`,
    {
      replacements: { pagina: routeName },
      type: db.Sequelize.QueryTypes.SELECT,
    },
  );

  if (pages.length === 0) return false;

  const pageId = pages[0].id;

  // Si existe cualquier registro por usuario para esta página, manda usuario.
  // estatus=1 -> permite, estatus=0 -> bloquea (sin fallback a tipo).
  const permisoUsuario = await db.sequelize.query(
    `SELECT cpu.estatus
     FROM config_pages_usuario cpu
     WHERE cpu.page_id = :pageId
       AND cpu.usuario_id = :userId
     ORDER BY cpu.updated_at DESC, cpu.id DESC
     LIMIT 1`,
    {
      replacements: { pageId, userId },
      type: db.Sequelize.QueryTypes.SELECT,
    },
  );

  if (permisoUsuario.length > 0) {
    const estatusUsuario = Number(permisoUsuario[0].estatus);
    if (showLogs) {
      console.log(
        `[Validacion de Pagina]     Usuario con ID ${userId} ${estatusUsuario === 1 ? "tiene" : "NO tiene"} permiso para la página "${routeName}" (estatus=${estatusUsuario}).`,
      );
    }
    return estatusUsuario === 1;
  }

  // Si no hay registro por usuario, evaluar tipo.
  // estatus=1 -> permite, estatus=0 -> bloquea.
  const permisoTipo = await db.sequelize.query(
    `SELECT cpu.estatus
     FROM config_pages_usuario cpu
     WHERE cpu.page_id = :pageId
       AND cpu.tipo_usuario_id = :tipoId
     ORDER BY cpu.updated_at DESC, cpu.id DESC
     LIMIT 1`,
    {
      replacements: { pageId, tipoId },
      type: db.Sequelize.QueryTypes.SELECT,
    },
  );

  if (permisoTipo.length > 0) {
    const estatusTipo = Number(permisoTipo[0].estatus);
    if (showLogs) {
      console.log(
        `[Validacion de Pagina]     Tipo de usuario con ID ${tipoId} ${estatusTipo === 1 ? "tiene" : "NO tiene"} permiso para la página "${routeName}" (estatus=${estatusTipo}).`,
      );
    }
    return estatusTipo === 1;
  }

  if (showLogs) {
    console.log(
      `[Validacion de Pagina]     Sin registros de permiso para la página "${routeName}".`,
    );
  }

  return false;
}

export default {
  getPermiso,
};
