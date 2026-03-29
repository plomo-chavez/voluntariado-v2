import db from "../models/index.js";

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildTree(rows) {
  const map = {};
  const roots = [];

  for (const row of rows) {
    map[row.id] = {
      title: row.title,
      icon: row.icon ? { icon: row.icon } : undefined,
      to: row.route_name ? { name: row.route_name } : undefined,
      _id: row.id,
      _parent_id: row.parent_id,
      children: [],
    };
    if (!map[row.id].icon) delete map[row.id].icon;
    if (!map[row.id].to) delete map[row.id].to;
  }

  for (const row of rows) {
    const node = map[row.id];
    if (row.parent_id && map[row.parent_id]) {
      map[row.parent_id].children.push(node);
    } else {
      roots.push(node);
    }
  }

  function clean(node) {
    delete node._id;
    delete node._parent_id;
    if (node.children.length === 0) delete node.children;
    else node.children.forEach(clean);
    return node;
  }

  return roots.map(clean);
}

// ─── GET /api/menu ────────────────────────────────────────────────────────────

const getMenu = async (req, res) => {
  try {
    const tipoId = req.user?.tipo_id;
    const userId = req.user?.id;

    const rows = await db.sequelize.query(
      `SELECT cp.id, cp.title, cp.route_name, cp.icon, cp.parent_id, cp.orden
       FROM config_pages cp
       WHERE cp.estatus = 1
         AND cp.deleted_at IS NULL
         AND (
           -- SISTEMA: Inicio siempre visible para todos
           cp.route_name = 'root'

           OR

           -- CASO 1 (estricto): si hay permisos por usuario, usar SOLO usuario_id
           (
             EXISTS (
               SELECT 1 FROM config_pages_usuario cpu_user_any
               WHERE cpu_user_any.usuario_id = :userId
                 AND cpu_user_any.estatus = 1
             )
             AND EXISTS (
             SELECT 1 FROM config_pages_usuario cpu_user_page
             WHERE cpu_user_page.page_id = cp.id
               AND cpu_user_page.usuario_id = :userId
               AND cpu_user_page.estatus = 1
             )
           )

           -- CASO 2 (estricto): si no hay usuario pero sí tipo, usar SOLO tipo
           OR (
             NOT EXISTS (
               SELECT 1 FROM config_pages_usuario cpu_user_any
               WHERE cpu_user_any.usuario_id = :userId
                 AND cpu_user_any.estatus = 1
             )
             AND EXISTS (
               SELECT 1 FROM config_pages_usuario cpu_tipo_any
               WHERE cpu_tipo_any.tipo_usuario_id = :tipoId
                 AND cpu_tipo_any.estatus = 1
             )
             AND EXISTS (
               SELECT 1 FROM config_pages_usuario cpu_tipo_page
               WHERE cpu_tipo_page.page_id = cp.id
                 AND cpu_tipo_page.tipo_usuario_id = :tipoId
                 AND cpu_tipo_page.estatus = 1
             )
           )

           -- CASO 3: sin permisos de usuario ni tipo, mostrar páginas públicas
           OR (
             NOT EXISTS (
               SELECT 1 FROM config_pages_usuario cpu_user_any
               WHERE cpu_user_any.usuario_id = :userId
                 AND cpu_user_any.estatus = 1
             )
             AND NOT EXISTS (
               SELECT 1 FROM config_pages_usuario cpu_tipo_any
               WHERE cpu_tipo_any.tipo_usuario_id = :tipoId
                 AND cpu_tipo_any.estatus = 1
             )
             AND NOT EXISTS (
               SELECT 1 FROM config_pages_usuario cpu
               WHERE cpu.page_id = cp.id AND cpu.estatus = 1
             )
           )
         )
       ORDER BY cp.parent_id IS NOT NULL, cp.parent_id, cp.orden`,
      {
        replacements: { tipoId, userId },
        type: db.Sequelize.QueryTypes.SELECT,
      },
    );

    return res.json({ result: true, data: buildTree(rows) });
  } catch (error) {
    console.error("Error al obtener menú:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

// ─── GET /api/config-pages/list ───────────────────────────────────────────────

const getAll = async (req, res) => {
  try {
    const rows = await db.sequelize.query(
      `SELECT id, title, route_name, icon, parent_id, orden, estatus, created_at, updated_at
       FROM config_pages
       WHERE deleted_at IS NULL
       ORDER BY parent_id IS NOT NULL, parent_id, orden`,
      { type: db.Sequelize.QueryTypes.SELECT },
    );
    return res.json({ result: true, data: rows });
  } catch (error) {
    console.error("Error al obtener páginas:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

// ─── POST /api/config-pages/guardar ──────────────────────────────────────────

const guardar = async (req, res) => {
  try {
    const { id, title, route_name, icon, parent_id, orden, estatus } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ result: false, message: "El título es requerido" });
    }

    if (id) {
      await db.sequelize.query(
        `UPDATE config_pages
         SET title=:title, route_name=:route_name, icon=:icon,
             parent_id=:parent_id, orden=:orden, estatus=:estatus, updated_at=NOW()
         WHERE id=:id`,
        {
          replacements: {
            id,
            title,
            route_name: route_name || null,
            icon: icon || null,
            parent_id: parent_id || null,
            orden: orden ?? 0,
            estatus: estatus ?? 1,
          },
        },
      );
    } else {
      await db.sequelize.query(
        `INSERT INTO config_pages (title, route_name, icon, parent_id, orden, estatus, created_at, updated_at)
         VALUES (:title, :route_name, :icon, :parent_id, :orden, :estatus, NOW(), NOW())`,
        {
          replacements: {
            title,
            route_name: route_name || null,
            icon: icon || null,
            parent_id: parent_id || null,
            orden: orden ?? 0,
            estatus: estatus ?? 1,
          },
        },
      );
    }

    return res.json({
      result: true,
      message: id ? "Página actualizada" : "Página creada",
    });
  } catch (error) {
    console.error("Error al guardar página:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

// ─── POST /api/config-pages/eliminar ─────────────────────────────────────────

const eliminar = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id)
      return res.status(400).json({ result: false, message: "ID requerido" });

    await db.sequelize.query(
      "UPDATE config_pages SET deleted_at = NOW(), estatus = 0 WHERE id = :id",
      { replacements: { id } },
    );
    return res.json({ result: true, message: "Página eliminada" });
  } catch (error) {
    console.error("Error al eliminar página:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

// ─── GET /api/config-pages/permisos/tipo/:tipoId ─────────────────────────────
// Devuelve los page_ids que tiene asignados el tipo_usuario_id dado

const getPermisosTipo = async (req, res) => {
  try {
    const { tipoId } = req.params;
    const rows = await db.sequelize.query(
      `SELECT page_id FROM config_pages_usuario
       WHERE tipo_usuario_id = :tipoId AND estatus = 1`,
      { replacements: { tipoId }, type: db.Sequelize.QueryTypes.SELECT },
    );
    return res.json({ result: true, data: rows.map((r) => r.page_id) });
  } catch (error) {
    console.error("Error al obtener permisos por tipo:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

// ─── POST /api/config-pages/permisos/tipo/:tipoId ────────────────────────────
// Reemplaza los page_ids del tipo_usuario_id dado

const savePermisosTipo = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { tipoId } = req.params;
    const { pageIds } = req.body; // array de ids

    if (!Array.isArray(pageIds)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ result: false, message: "pageIds debe ser un array" });
    }

    // 1) Marcar como inactivos todos los permisos actuales del tipo
    await db.sequelize.query(
      `UPDATE config_pages_usuario
       SET estatus = 0, updated_at = NOW()
       WHERE tipo_usuario_id = :tipoId`,
      { replacements: { tipoId }, transaction },
    );

    // 2) Reactivar/crear permisos seleccionados
    for (const rawPageId of pageIds) {
      const pageId = Number(rawPageId);
      if (!Number.isFinite(pageId)) continue;

      const existing = await db.sequelize.query(
        `SELECT id FROM config_pages_usuario
         WHERE tipo_usuario_id = :tipoId
           AND page_id = :pageId
         LIMIT 1`,
        {
          replacements: { tipoId, pageId },
          type: db.Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      if (existing.length > 0) {
        await db.sequelize.query(
          `UPDATE config_pages_usuario
           SET estatus = 1,
               usuario_id = NULL,
               updated_at = NOW()
           WHERE tipo_usuario_id = :tipoId
             AND page_id = :pageId`,
          { replacements: { tipoId, pageId }, transaction },
        );
      } else {
        await db.sequelize.query(
          `INSERT INTO config_pages_usuario (page_id, tipo_usuario_id, usuario_id, estatus, created_at, updated_at)
           VALUES (:pageId, :tipoId, NULL, 1, NOW(), NOW())`,
          { replacements: { tipoId, pageId }, transaction },
        );
      }
    }

    await transaction.commit();
    return res.json({ result: true, message: "Permisos guardados" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error al guardar permisos por tipo:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

// ─── GET /api/config-pages/permisos/usuario/:userId ──────────────────────────

const getPermisosUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await db.sequelize.query(
      `SELECT page_id FROM config_pages_usuario
       WHERE usuario_id = :userId AND estatus = 1`,
      { replacements: { userId }, type: db.Sequelize.QueryTypes.SELECT },
    );

    const configuredRows = await db.sequelize.query(
      `SELECT id FROM config_pages_usuario
       WHERE usuario_id = :userId
       LIMIT 1`,
      { replacements: { userId }, type: db.Sequelize.QueryTypes.SELECT },
    );

    return res.json({
      result: true,
      data: {
        pageIds: rows.map((r) => r.page_id),
        hasConfiguredPermissions: configuredRows.length > 0,
      },
    });
  } catch (error) {
    console.error("Error al obtener permisos por usuario:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

// ─── POST /api/config-pages/permisos/usuario/:userId ─────────────────────────

const savePermisosUsuario = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { userId } = req.params;
    const { pageIds } = req.body;

    if (!Array.isArray(pageIds)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ result: false, message: "pageIds debe ser un array" });
    }

    // 1) Marcar como inactivos todos los permisos actuales del usuario
    await db.sequelize.query(
      `UPDATE config_pages_usuario
       SET estatus = 0, updated_at = NOW()
       WHERE usuario_id = :userId`,
      { replacements: { userId }, transaction },
    );

    // 2) Reactivar/crear permisos seleccionados
    for (const rawPageId of pageIds) {
      const pageId = Number(rawPageId);
      if (!Number.isFinite(pageId)) continue;

      const existing = await db.sequelize.query(
        `SELECT id FROM config_pages_usuario
         WHERE usuario_id = :userId
           AND page_id = :pageId
         LIMIT 1`,
        {
          replacements: { userId, pageId },
          type: db.Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      if (existing.length > 0) {
        await db.sequelize.query(
          `UPDATE config_pages_usuario
           SET estatus = 1,
               tipo_usuario_id = NULL,
               updated_at = NOW()
           WHERE usuario_id = :userId
             AND page_id = :pageId`,
          { replacements: { userId, pageId }, transaction },
        );
      } else {
        await db.sequelize.query(
          `INSERT INTO config_pages_usuario (page_id, tipo_usuario_id, usuario_id, estatus, created_at, updated_at)
           VALUES (:pageId, NULL, :userId, 1, NOW(), NOW())`,
          { replacements: { userId, pageId }, transaction },
        );
      }
    }

    await transaction.commit();
    return res.json({ result: true, message: "Permisos guardados" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error al guardar permisos por usuario:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

// ─── GET /api/config-pages/permisos/mi-status ────────────────────────────────
// Devuelve el status de permisos con lógica de CASCADA
// Prioridad GLOBAL ESTRICTA:
// 1) si usuario_id tiene permisos, usar SOLO usuario_id
// 2) si no hay usuario_id pero sí tipo_usuario_id, usar SOLO tipo_usuario_id
// 3) si no hay ni usuario ni tipo, mostrar solo páginas sin restricción

const getMiStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const tipoId = req.user?.tipo_id;

    if (!userId) {
      return res.status(401).json({ result: false, message: "No autenticado" });
    }

    // Obtener todas las páginas
    const todasPaginas = await db.sequelize.query(
      `SELECT id, title, route_name FROM config_pages 
       WHERE estatus = 1 AND deleted_at IS NULL
       ORDER BY id`,
      { type: db.Sequelize.QueryTypes.SELECT },
    );

    // Obtener permisos PERSONALIZADOS (usuario_id)
    const permisosUsuario = await db.sequelize.query(
      `SELECT page_id FROM config_pages_usuario
       WHERE usuario_id = :userId AND estatus = 1
       ORDER BY page_id`,
      { replacements: { userId }, type: db.Sequelize.QueryTypes.SELECT },
    );
    const pageIdsUsuario = new Set(permisosUsuario.map((r) => r.page_id));

    // Obtener permisos por TIPO (tipo_usuario_id)
    const permisosTipo = await db.sequelize.query(
      `SELECT page_id FROM config_pages_usuario
       WHERE tipo_usuario_id = :tipoId AND estatus = 1
       ORDER BY page_id`,
      { replacements: { tipoId }, type: db.Sequelize.QueryTypes.SELECT },
    );
    const pageIdsTipo = new Set(permisosTipo.map((r) => r.page_id));

    // Obtener páginas CON RESTRICCIÓN (existen en config_pages_usuario)
    const paginasConRestriccion = await db.sequelize.query(
      `SELECT DISTINCT page_id FROM config_pages_usuario
       WHERE estatus = 1`,
      { type: db.Sequelize.QueryTypes.SELECT },
    );
    const pageIdsConRestriccion = new Set(
      paginasConRestriccion.map((r) => r.page_id),
    );

    // Banderas globales de cascada estricta
    const tienePermisosUsuarioGlobal = pageIdsUsuario.size > 0;
    const tienePermisosTipoGlobal = pageIdsTipo.size > 0;

    // Aplicar cascada a cada página
    const permisosResultantes = {
      porUsuario: [], // Tiene permiso porque usuario_id (sobrescribe globalmente)
      porTipo: [], // Tiene permiso porque tipo_usuario_id (solo si no hay usuario_id)
      sinRestriccion: [], // Tiene permiso porque no tiene restricción
      bloqueado: [], // NO tiene permiso (restricción pero no aplica)
    };

    for (const pagina of todasPaginas) {
      const pageId = pagina.id;

      // 1. ¿Tiene restricción?
      if (tienePermisosUsuarioGlobal) {
        // Si hay permisos personalizados, SOLO se evalúa usuario_id
        if (pageIdsUsuario.has(pageId)) {
          permisosResultantes.porUsuario.push({
            id: pageId,
            title: pagina.title,
            route_name: pagina.route_name,
          });
        } else {
          permisosResultantes.bloqueado.push({
            id: pageId,
            title: pagina.title,
            route_name: pagina.route_name,
          });
        }
      } else if (tienePermisosTipoGlobal) {
        // Si no hay permisos por usuario, pero sí por tipo, SOLO se evalúa tipo
        if (pageIdsTipo.has(pageId)) {
          permisosResultantes.porTipo.push({
            id: pageId,
            title: pagina.title,
            route_name: pagina.route_name,
          });
        } else {
          permisosResultantes.bloqueado.push({
            id: pageId,
            title: pagina.title,
            route_name: pagina.route_name,
          });
        }
      } else {
        // Si no hay usuario ni tipo, solo se muestran páginas públicas
        if (!pageIdsConRestriccion.has(pageId)) {
          permisosResultantes.sinRestriccion.push({
            id: pageId,
            title: pagina.title,
            route_name: pagina.route_name,
          });
        } else {
          permisosResultantes.bloqueado.push({
            id: pageId,
            title: pagina.title,
            route_name: pagina.route_name,
          });
        }
      }
    }

    // Calcular total de acceso
    const tieneAcceso =
      permisosResultantes.porUsuario.length +
      permisosResultantes.porTipo.length +
      permisosResultantes.sinRestriccion.length;

    // Determinar categoría
    let categoria = "sin_permisos";
    if (tienePermisosUsuarioGlobal) {
      categoria = "usuario_personalizado";
    } else if (tienePermisosTipoGlobal) {
      categoria = "tipo_usuario";
    } else if (permisosResultantes.sinRestriccion.length > 0) {
      categoria = "publico";
    }

    return res.json({
      result: true,
      data: {
        userId,
        tipoId,
        categoria, // Categoría principal del usuario
        totalAcceso: tieneAcceso,
        totalBloqueado: permisosResultantes.bloqueado.length,
        // Detalle por categoría (para UI)
        permisosResultantes,
        // Información cruda (para debugging)
        debug: {
          tienePermisosUsuarioGlobal,
          tienePermisosTipoGlobal,
          pageIdsUsuario: Array.from(pageIdsUsuario),
          pageIdsTipo: Array.from(pageIdsTipo),
          pageIdsConRestriccion: Array.from(pageIdsConRestriccion),
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener status de permisos:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

// ─── GET /api/config-pages/debug/menu ─────────────────────────────────────────
// Análisis DETALLADO de por qué cada página se incluye/excluye en el menú

const getDebugMenu = async (req, res) => {
  try {
    const tipoId = req.user?.tipo_id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ result: false, message: "No autenticado" });
    }

    // Obtener todas las páginas
    const todasPaginas = await db.sequelize.query(
      `SELECT id, title, route_name FROM config_pages 
       WHERE estatus = 1 AND deleted_at IS NULL
       ORDER BY id`,
      { type: db.Sequelize.QueryTypes.SELECT },
    );

    const permisosUsuarioGlobal = await db.sequelize.query(
      `SELECT page_id FROM config_pages_usuario
       WHERE usuario_id = :userId AND estatus = 1
       ORDER BY page_id`,
      { replacements: { userId }, type: db.Sequelize.QueryTypes.SELECT },
    );
    const pageIdsUsuario = new Set(permisosUsuarioGlobal.map((r) => r.page_id));
    const tienePermisosUsuarioGlobal = pageIdsUsuario.size > 0;

    const permisosTipoGlobal = await db.sequelize.query(
      `SELECT page_id FROM config_pages_usuario
       WHERE tipo_usuario_id = :tipoId AND estatus = 1
       ORDER BY page_id`,
      { replacements: { tipoId }, type: db.Sequelize.QueryTypes.SELECT },
    );
    const pageIdsTipo = new Set(permisosTipoGlobal.map((r) => r.page_id));
    const tienePermisosTipoGlobal = pageIdsTipo.size > 0;

    // Para cada página, analizar todos los permisos
    const analisis = [];

    for (const pagina of todasPaginas) {
      const pageId = pagina.id;

      // Buscar TODAS las restricciones de esta página
      const restriccionesPage = await db.sequelize.query(
        `SELECT id, tipo_usuario_id, usuario_id, estatus 
         FROM config_pages_usuario 
         WHERE page_id = :pageId AND estatus = 1
         ORDER BY id`,
        { replacements: { pageId }, type: db.Sequelize.QueryTypes.SELECT },
      );

      // Analizar cascada
      let resultado = "❌ BLOQUEADO";
      let razon = "";
      let detalles = {
        sinRestriccion: false,
        tieneUsuarioId: false,
        tieneTipoId: false,
        tipoIdDelUsuario: tipoId,
        usuarioIdDelUsuario: userId,
      };

      // CASO 1: ¿Sin restricción?
      if (restriccionesPage.length === 0) {
        resultado = "✅ ACCESO";
        razon = "Sin restricción (visible a todos)";
        detalles.sinRestriccion = true;
      } else {
        // Hay restricciones, revisar cascada
        const tieneUsuarioId = restriccionesPage.some(
          (r) => r.usuario_id === userId && r.estatus === 1,
        );
        const tieneTipoId = restriccionesPage.some(
          (r) => r.tipo_usuario_id === tipoId && r.estatus === 1,
        );

        detalles.tieneUsuarioId = tieneUsuarioId;
        detalles.tieneTipoId = tieneTipoId;

        // CASO 2: Si hay permisos por usuario, se usa SOLO usuario
        if (tienePermisosUsuarioGlobal) {
          if (tieneUsuarioId) {
            resultado = "✅ ACCESO";
            razon = `Permiso personal (usuario_id=${userId}) [sobrescribe global]`;
          } else {
            resultado = "❌ BLOQUEADO";
            razon =
              "Usuario tiene permisos personalizados, esta página no está en su lista";
          }
        }
        // CASO 3: Si no hay usuario y sí tipo, se usa SOLO tipo
        else if (tienePermisosTipoGlobal && tieneTipoId) {
          resultado = "✅ ACCESO";
          razon = `Permiso heredado (tipo_usuario_id=${tipoId})`;
        } else {
          resultado = "❌ BLOQUEADO";
          razon = tienePermisosTipoGlobal
            ? "Tiene restricción y no cumple por tipo"
            : "No hay permisos por usuario/tipo para esta página restringida";
        }
      }

      analisis.push({
        pageId,
        title: pagina.title,
        route_name: pagina.route_name,
        resultado,
        razon,
        detalles,
        restriccionesPage: restriccionesPage.map((r) => ({
          id: r.id,
          usuario_id: r.usuario_id || "—",
          tipo_usuario_id: r.tipo_usuario_id || "—",
        })),
      });
    }

    // Separar en acceso y bloqueado
    const conAcceso = analisis.filter((a) => a.resultado.includes("✅"));
    const bloqueado = analisis.filter((a) => a.resultado.includes("❌"));

    return res.json({
      result: true,
      data: {
        usuario: { userId, tipoId },
        contexto: {
          tienePermisosUsuarioGlobal,
          tienePermisosTipoGlobal,
          pageIdsUsuario: Array.from(pageIdsUsuario),
          pageIdsTipo: Array.from(pageIdsTipo),
        },
        resumen: {
          totalPaginas: todasPaginas.length,
          conAcceso: conAcceso.length,
          bloqueado: bloqueado.length,
        },
        conAcceso,
        bloqueado,
        analisisCompleto: analisis, // Para detalles si lo necesitas
      },
    });
  } catch (error) {
    console.error("Error al debug menú:", error);
    return res.status(500).json({ result: false, message: "Error interno" });
  }
};

export default {
  getMenu,
  getAll,
  guardar,
  eliminar,
  getPermisosTipo,
  savePermisosTipo,
  getPermisosUsuario,
  savePermisosUsuario,
  getMiStatus,
  getDebugMenu,
};
