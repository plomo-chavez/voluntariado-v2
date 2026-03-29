"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const hasTable = async (tableName) => {
        const tables = await queryInterface.showAllTables({ transaction });
        return tables
          .map((table) =>
            typeof table === "string"
              ? table.toLowerCase()
              : table.tableName.toLowerCase(),
          )
          .includes(tableName.toLowerCase());
      };

      const ensureColumns = async (tableName, columnsDef) => {
        const desc = await queryInterface.describeTable(tableName, {
          transaction,
        });

        for (const [columnName, columnDef] of Object.entries(columnsDef)) {
          if (!desc[columnName]) {
            await queryInterface.addColumn(tableName, columnName, columnDef, {
              transaction,
            });
          }
        }
      };

      const catTiposUsuariosColumns = {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        label: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        estatus: {
          type: Sequelize.TINYINT(1),
          allowNull: true,
          defaultValue: 1,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      };

      const usuariosColumns = {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        nombre: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        correo: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        tipo_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
        },
        estatus: {
          type: Sequelize.TINYINT(1),
          allowNull: true,
          defaultValue: 1,
        },
        reset_token: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      };

      const logsColumns = {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        usuario_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        accion: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        extraData: {
          type: Sequelize.TEXT("long"),
          allowNull: true,
        },
        estatus: {
          type: Sequelize.TINYINT(1),
          allowNull: true,
          defaultValue: 1,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        deleted_at: {
          type: Sequelize.STRING(45),
          allowNull: true,
        },
      };

      const catTiposUsuariosExists = await hasTable("catTiposUsuarios");

      if (!catTiposUsuariosExists) {
        await queryInterface.createTable(
          "catTiposUsuarios",
          catTiposUsuariosColumns,
          {
            transaction,
          },
        );
      } else {
        await ensureColumns("catTiposUsuarios", catTiposUsuariosColumns);
      }

      const [developerTypeRows] = await queryInterface.sequelize.query(
        `SELECT id, deleted_at FROM catTiposUsuarios WHERE label = :label LIMIT 1`,
        {
          replacements: { label: "Desarrollador" },
          transaction,
        },
      );

      let developerTypeId;

      if (!developerTypeRows.length) {
        await queryInterface.sequelize.query(
          `
            INSERT INTO catTiposUsuarios (label, estatus, created_at, updated_at, deleted_at)
            VALUES (:label, :estatus, NOW(), NOW(), NULL)
          `,
          {
            replacements: { label: "Desarrollador", estatus: 1 },
            transaction,
          },
        );

        const [newDeveloperTypeRows] = await queryInterface.sequelize.query(
          `SELECT id FROM catTiposUsuarios WHERE label = :label LIMIT 1`,
          {
            replacements: { label: "Desarrollador" },
            transaction,
          },
        );

        developerTypeId = newDeveloperTypeRows?.[0]?.id;
      } else {
        developerTypeId = developerTypeRows[0].id;

        await queryInterface.sequelize.query(
          `
            UPDATE catTiposUsuarios
            SET estatus = 1,
                deleted_at = NULL,
                updated_at = NOW()
            WHERE id = :id
          `,
          {
            replacements: { id: developerTypeId },
            transaction,
          },
        );
      }

      if (!developerTypeId) {
        throw new Error(
          "No se pudo resolver el id del tipo de usuario 'Desarrollador'.",
        );
      }

      const [adminTypeRows] = await queryInterface.sequelize.query(
        `SELECT id, deleted_at FROM catTiposUsuarios WHERE label = :label LIMIT 1`,
        {
          replacements: { label: "Administrador" },
          transaction,
        },
      );

      let adminTypeId;

      if (!adminTypeRows.length) {
        await queryInterface.sequelize.query(
          `
            INSERT INTO catTiposUsuarios (label, estatus, created_at, updated_at, deleted_at)
            VALUES (:label, :estatus, NOW(), NOW(), NULL)
          `,
          {
            replacements: { label: "Administrador", estatus: 1 },
            transaction,
          },
        );

        const [newAdminTypeRows] = await queryInterface.sequelize.query(
          `SELECT id FROM catTiposUsuarios WHERE label = :label LIMIT 1`,
          {
            replacements: { label: "Administrador" },
            transaction,
          },
        );

        adminTypeId = newAdminTypeRows?.[0]?.id;
      } else {
        adminTypeId = adminTypeRows[0].id;

        await queryInterface.sequelize.query(
          `
            UPDATE catTiposUsuarios
            SET estatus = 1,
                deleted_at = NULL,
                updated_at = NOW()
            WHERE id = :id
          `,
          {
            replacements: { id: adminTypeId },
            transaction,
          },
        );
      }

      if (!adminTypeId) {
        throw new Error(
          "No se pudo resolver el id del tipo de usuario 'Administrador'.",
        );
      }

      const usuariosExists = await hasTable("usuarios");

      if (!usuariosExists) {
        await queryInterface.createTable("usuarios", usuariosColumns, {
          transaction,
        });
      } else {
        await ensureColumns("usuarios", usuariosColumns);
      }

      const [developerUserRows] = await queryInterface.sequelize.query(
        `SELECT id FROM usuarios WHERE correo = ? LIMIT 1`,
        {
          replacements: ["dev@gmail.com"],
          transaction,
        },
      );

      if (!developerUserRows.length) {
        await queryInterface.sequelize.query(
          `
            INSERT INTO usuarios
              (nombre, correo, password, tipo_id, estatus, reset_token, created_at, updated_at, deleted_at)
            VALUES
              (?, ?, ?, ?, ?, NULL, NOW(), NOW(), NULL)
          `,
          {
            replacements: [
              "dev",
              "dev@gmail.com",
              "$2b$10$tb/UyQmvXAz7lQnvHx9tKeI/CDDBnUdb3xzNQBXmLIE3vcjwbZCy6",
              developerTypeId,
              1,
            ],
            transaction,
          },
        );
      } else {
        await queryInterface.sequelize.query(
          `
            UPDATE usuarios
            SET nombre = ?,
                tipo_id = ?,
                estatus = 1,
                deleted_at = NULL,
                updated_at = NOW()
            WHERE id = ?
          `,
          {
            replacements: ["dev", developerTypeId, developerUserRows[0].id],
            transaction,
          },
        );
      }

      const [adminUserRows] = await queryInterface.sequelize.query(
        `SELECT id FROM usuarios WHERE nombre = ? AND tipo_id = ? LIMIT 1`,
        {
          replacements: ["admin", adminTypeId],
          transaction,
        },
      );

      if (!adminUserRows.length) {
        await queryInterface.sequelize.query(
          `
            INSERT INTO usuarios
              (nombre, correo, password, tipo_id, estatus, reset_token, created_at, updated_at, deleted_at)
            VALUES
              (?, ?, ?, ?, ?, NULL, NOW(), NOW(), NULL)
          `,
          {
            replacements: [
              "admin",
              "admin@gmail.com",
              "$2b$10$tThxwTGuxBfZWM0uh32yqeyBgfkoRb7xk8Mlwjf/C.4AOyQmqJuaG",
              adminTypeId,
              1,
            ],
            transaction,
          },
        );
      }

      const logsExists = await hasTable("logs");

      if (!logsExists) {
        await queryInterface.createTable("logs", logsColumns, {
          transaction,
        });
      } else {
        await ensureColumns("logs", logsColumns);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down() {},
};
