"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // ── 1. Agregar usuario_id a config_pages_usuario ─────────────────────────
      const desc = await queryInterface.describeTable("config_pages_usuario", {
        transaction,
      });

      if (!desc.usuario_id) {
        await queryInterface.addColumn(
          "config_pages_usuario",
          "usuario_id",
          {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            defaultValue: null,
          },
          { transaction },
        );
      }

      // tipo_usuario_id pasa a ser nullable (ya un usuario individual puede sobreescribir)
      if (desc.tipo_usuario_id && !desc.tipo_usuario_id.allowNull) {
        await queryInterface.changeColumn(
          "config_pages_usuario",
          "tipo_usuario_id",
          {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            defaultValue: null,
          },
          { transaction },
        );
      }

      // ── 2. Seed: agregar páginas especiales de menú en config_pages ─────────
      const [adminPage] = await queryInterface.sequelize.query(
        "SELECT id FROM config_pages WHERE title = 'Administrador' AND parent_id IS NULL LIMIT 1",
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
      );
      const [catalogosPage] = await queryInterface.sequelize.query(
        "SELECT id FROM config_pages WHERE title = 'Catalogos' AND parent_id IS NULL LIMIT 1",
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
      );

      if (adminPage) {
        const [developerTipo] = await queryInterface.sequelize.query(
          "SELECT id FROM catTiposUsuarios WHERE label = 'Desarrollador' LIMIT 1",
          { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
        );
        const [adminTipo] = await queryInterface.sequelize.query(
          "SELECT id FROM catTiposUsuarios WHERE label = 'Administrador' LIMIT 1",
          { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
        );

        const ensureDeveloperOnlyPage = async ({
          title,
          routeName,
          icon,
          orden,
          parentId,
        }) => {
          const [existingPage] = await queryInterface.sequelize.query(
            "SELECT id FROM config_pages WHERE route_name = :routeName LIMIT 1",
            {
              replacements: { routeName },
              transaction,
              type: queryInterface.sequelize.QueryTypes.SELECT,
            },
          );

          if (!existingPage) {
            await queryInterface.bulkInsert(
              "config_pages",
              [
                {
                  title,
                  route_name: routeName,
                  icon,
                  parent_id: parentId,
                  orden,
                  estatus: 1,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              ],
              { transaction },
            );
          } else {
            await queryInterface.sequelize.query(
              `UPDATE config_pages
               SET title = :title,
                   icon = :icon,
                   parent_id = :parentId,
                   orden = :orden,
                   estatus = 1,
                   updated_at = NOW(),
                   deleted_at = NULL
               WHERE id = :pageId`,
              {
                replacements: {
                  pageId: existingPage.id,
                  parentId,
                  title,
                  icon,
                  orden,
                },
                transaction,
              },
            );
          }

          const [page] = await queryInterface.sequelize.query(
            "SELECT id FROM config_pages WHERE route_name = :routeName LIMIT 1",
            {
              replacements: { routeName },
              transaction,
              type: queryInterface.sequelize.QueryTypes.SELECT,
            },
          );

          if (!page || !developerTipo) return;

          const [existingDevPermission] = await queryInterface.sequelize.query(
            `SELECT id FROM config_pages_usuario
             WHERE page_id = :pageId
               AND tipo_usuario_id = :tipoId
               AND usuario_id IS NULL
             LIMIT 1`,
            {
              replacements: { pageId: page.id, tipoId: developerTipo.id },
              transaction,
              type: queryInterface.sequelize.QueryTypes.SELECT,
            },
          );

          if (!existingDevPermission) {
            await queryInterface.bulkInsert(
              "config_pages_usuario",
              [
                {
                  page_id: page.id,
                  tipo_usuario_id: developerTipo.id,
                  usuario_id: null,
                  estatus: 1,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              ],
              { transaction },
            );
          } else {
            await queryInterface.sequelize.query(
              `UPDATE config_pages_usuario
               SET estatus = 1,
                   updated_at = NOW()
               WHERE id = :id`,
              {
                replacements: { id: existingDevPermission.id },
                transaction,
              },
            );
          }

          if (adminTipo) {
            await queryInterface.sequelize.query(
              `UPDATE config_pages_usuario
               SET estatus = 0,
                   updated_at = NOW()
               WHERE page_id = :pageId
                 AND tipo_usuario_id = :adminTipoId
                 AND usuario_id IS NULL`,
              {
                replacements: { pageId: page.id, adminTipoId: adminTipo.id },
                transaction,
              },
            );
          }
        };

        await ensureDeveloperOnlyPage({
          title: "Páginas",
          routeName: "administrador-config-pages",
          icon: "tabler-layout-navbar",
          orden: 3,
          parentId: adminPage.id,
        });

        if (catalogosPage) {
          // Vinculada a frontend/src/pages/catalogos/tipo-usuario.vue
          await ensureDeveloperOnlyPage({
            title: "Tipos de usuarios",
            routeName: "catalogos-tipo-usuario",
            icon: null,
            orden: 1,
            parentId: catalogosPage.id,
          });
        }
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("config_pages_usuario", "usuario_id");
  },
};
