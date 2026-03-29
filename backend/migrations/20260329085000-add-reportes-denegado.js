"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Agregar "Reportes" sin restricción (visible para todos)
      const [existingReportes] = await queryInterface.sequelize.query(
        "SELECT id FROM config_pages WHERE route_name = 'reportes' LIMIT 1",
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
      );

      if (!existingReportes) {
        await queryInterface.bulkInsert(
          "config_pages",
          [
            {
              title: "Reportes",
              route_name: "reportes",
              icon: "tabler-smart-home",
              parent_id: null,
              orden: 2,
              estatus: 1,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction },
        );
      }

      // Agregar "Denegado" sin restricción + sin requerir auth
      const [existingDenegado] = await queryInterface.sequelize.query(
        "SELECT id FROM config_pages WHERE route_name = 'denegado' LIMIT 1",
        { transaction, type: queryInterface.sequelize.QueryTypes.SELECT },
      );

      if (!existingDenegado) {
        await queryInterface.bulkInsert(
          "config_pages",
          [
            {
              title: "Denegado",
              route_name: "denegado",
              icon: "tabler-alert-circle",
              parent_id: null,
              orden: 100,
              estatus: 1,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction },
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE FROM config_pages WHERE route_name IN ('reportes', 'denegado')",
    );
  },
};
