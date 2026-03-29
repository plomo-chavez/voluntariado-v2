"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const hasTable = async (tableName) => {
        const tables = await queryInterface.showAllTables({ transaction });
        return tables
          .map((t) =>
            typeof t === "string" ? t.toLowerCase() : t.tableName.toLowerCase(),
          )
          .includes(tableName.toLowerCase());
      };

      // ── 1. config_pages ──────────────────────────────────────────────────────
      if (!(await hasTable("config_pages"))) {
        await queryInterface.createTable(
          "config_pages",
          {
            id: {
              type: Sequelize.BIGINT.UNSIGNED,
              autoIncrement: true,
              primaryKey: true,
            },
            title: {
              type: Sequelize.STRING(100),
              allowNull: false,
            },
            route_name: {
              type: Sequelize.STRING(100),
              allowNull: true,
            },
            icon: {
              type: Sequelize.STRING(100),
              allowNull: true,
            },
            parent_id: {
              type: Sequelize.BIGINT.UNSIGNED,
              allowNull: true,
            },
            orden: {
              type: Sequelize.INTEGER,
              defaultValue: 0,
            },
            estatus: {
              type: Sequelize.TINYINT(1),
              defaultValue: 1,
            },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            deleted_at: {
              type: Sequelize.STRING(45),
              allowNull: true,
            },
          },
          { transaction },
        );
      }

      // ── 2. config_pages_usuario ───────────────────────────────────────────────
      if (!(await hasTable("config_pages_usuario"))) {
        await queryInterface.createTable(
          "config_pages_usuario",
          {
            id: {
              type: Sequelize.BIGINT.UNSIGNED,
              autoIncrement: true,
              primaryKey: true,
            },
            page_id: {
              type: Sequelize.BIGINT.UNSIGNED,
              allowNull: false,
            },
            tipo_usuario_id: {
              type: Sequelize.BIGINT.UNSIGNED,
              allowNull: false,
            },
            estatus: {
              type: Sequelize.TINYINT(1),
              defaultValue: 1,
            },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            deleted_at: {
              type: Sequelize.STRING(45),
              allowNull: true,
            },
          },
          { transaction },
        );
      }

      // ── 3. Seed: Inicio (visible para todos) ─────────────────────────────────
      const [existingInicio] = await queryInterface.sequelize.query(
        "SELECT id FROM config_pages WHERE route_name = 'root' LIMIT 1",
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
      );

      if (!existingInicio) {
        await queryInterface.bulkInsert(
          "config_pages",
          [
            {
              title: "Inicio",
              route_name: "root",
              icon: "tabler-smart-home",
              parent_id: null,
              orden: 1,
              estatus: 1,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction },
        );
      }

      // ── 4. Seed: grupo Administrador (restringido) ────────────────────────────
      const [existingAdminPage] = await queryInterface.sequelize.query(
        "SELECT id FROM config_pages WHERE title = 'Administrador' AND parent_id IS NULL LIMIT 1",
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
      );

      let adminPageId;
      if (!existingAdminPage) {
        await queryInterface.bulkInsert(
          "config_pages",
          [
            {
              title: "Administrador",
              route_name: null,
              icon: "tabler-settings",
              parent_id: null,
              orden: 2,
              estatus: 1,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction },
        );

        const [newAdminPage] = await queryInterface.sequelize.query(
          "SELECT id FROM config_pages WHERE title = 'Administrador' AND parent_id IS NULL LIMIT 1",
          { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
        );
        adminPageId = newAdminPage.id;
      } else {
        adminPageId = existingAdminPage.id;
      }

      // ── 5. Seed: hijos de Administrador ──────────────────────────────────────
      const children = [
        { title: "Usuarios", route_name: "usuarios", icon: null, orden: 1 },
        { title: "Logs", route_name: "logs", icon: null, orden: 2 },
      ];

      for (const child of children) {
        const [existing] = await queryInterface.sequelize.query(
          "SELECT id FROM config_pages WHERE route_name = ? LIMIT 1",
          {
            replacements: [child.route_name],
            transaction,
            type: queryInterface.sequelize.QueryTypes.SELECT,
          },
        );
        if (!existing) {
          await queryInterface.bulkInsert(
            "config_pages",
            [
              {
                title: child.title,
                route_name: child.route_name,
                icon: child.icon,
                parent_id: adminPageId,
                orden: child.orden,
                estatus: 1,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
            { transaction },
          );
        }
      }

      // ── 6. Asignar restricciones a config_pages_usuario ──────────────────────
      const [adminTipoRow] = await queryInterface.sequelize.query(
        "SELECT id FROM catTiposUsuarios WHERE label = 'Administrador' LIMIT 1",
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
      );

      if (!adminTipoRow) {
        throw new Error(
          "No se encontró el tipo 'Administrador' en catTiposUsuarios. Ejecuta la migración inicial primero.",
        );
      }
      const adminTipoId = adminTipoRow.id;

      // Obtener todas las páginas restringidas (grupo Administrador + hijos)
      const restrictedPages = await queryInterface.sequelize.query(
        "SELECT id FROM config_pages WHERE (title = 'Administrador' AND parent_id IS NULL) OR parent_id = ?",
        {
          replacements: [adminPageId],
          transaction,
          type: queryInterface.sequelize.QueryTypes.SELECT,
        },
      );

      const now = new Date();
      for (const page of restrictedPages) {
        const [existing] = await queryInterface.sequelize.query(
          "SELECT id FROM config_pages_usuario WHERE page_id = ? AND tipo_usuario_id = ? LIMIT 1",
          {
            replacements: [page.id, adminTipoId],
            transaction,
            type: queryInterface.sequelize.QueryTypes.SELECT,
          },
        );
        if (!existing) {
          await queryInterface.bulkInsert(
            "config_pages_usuario",
            [
              {
                page_id: page.id,
                tipo_usuario_id: adminTipoId,
                estatus: 1,
                created_at: now,
                updated_at: now,
              },
            ],
            { transaction },
          );
        }
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("config_pages_usuario");
    await queryInterface.dropTable("config_pages");
  },
};
