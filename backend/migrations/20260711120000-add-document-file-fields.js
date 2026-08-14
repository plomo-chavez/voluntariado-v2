"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const description = await queryInterface.describeTable("vol_documento", {
        transaction,
      });

      if (!description.ruta_archivo) {
        await queryInterface.addColumn(
          "vol_documento",
          "ruta_archivo",
          {
            type: Sequelize.STRING(500),
            allowNull: true,
          },
          { transaction },
        );
      }

      if (!description.fecha_registro) {
        await queryInterface.addColumn(
          "vol_documento",
          "fecha_registro",
          {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
          { transaction },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("vol_documento", "ruta_archivo");
    await queryInterface.removeColumn("vol_documento", "fecha_registro");
  },
};
