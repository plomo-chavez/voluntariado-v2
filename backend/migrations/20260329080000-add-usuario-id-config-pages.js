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

      // ── 2. Seed: agregar "Páginas" como hijo de Administrador en config_pages ─
      const [adminPage] = await queryInterface.sequelize.query(
        "SELECT id FROM config_pages WHERE title = 'Administrador' AND parent_id IS NULL LIMIT 1",
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
      );

      if (adminPage) {
        const [existing] = await queryInterface.sequelize.query(
          "SELECT id FROM config_pages WHERE route_name = 'administrador-config-pages' LIMIT 1",
          { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
        );

        if (!existing) {
          await queryInterface.bulkInsert(
            "config_pages",
            [
              {
                title: "Páginas",
                route_name: "administrador-config-pages",
                icon: "tabler-layout-navbar",
                parent_id: adminPage.id,
                orden: 10,
                estatus: 1,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
            { transaction },
          );

          // También asignar permiso solo a Administrador
          const [newPage] = await queryInterface.sequelize.query(
            "SELECT id FROM config_pages WHERE route_name = 'administrador-config-pages' LIMIT 1",
            { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
          );
          const [adminTipo] = await queryInterface.sequelize.query(
            "SELECT id FROM catTiposUsuarios WHERE label = 'Administrador' LIMIT 1",
            { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
          );

          if (newPage && adminTipo) {
            await queryInterface.bulkInsert(
              "config_pages_usuario",
              [
                {
                  page_id: newPage.id,
                  tipo_usuario_id: adminTipo.id,
                  usuario_id: null,
                  estatus: 1,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              ],
              { transaction },
            );
          }
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
