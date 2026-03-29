export default (sequelize, DataTypes) => {
  const configPagesUsuario = sequelize.define(
    "configPagesUsuario",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      page_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      // Permiso por tipo de usuario (null si es permiso individual)
      tipo_usuario_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      // Permiso por usuario individual (null si es permiso por tipo)
      usuario_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      estatus: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
    },
    {
      tableName: "config_pages_usuario",
      timestamps: false,
    },
  );

  configPagesUsuario.associate = (models) => {
    configPagesUsuario.belongsTo(models.configPages, {
      foreignKey: "page_id",
      as: "page",
    });
    configPagesUsuario.belongsTo(models.catTiposUsuarios, {
      foreignKey: "tipo_usuario_id",
      as: "tipoUsuario",
    });
    configPagesUsuario.belongsTo(models.Usuarios, {
      foreignKey: "usuario_id",
      as: "usuario",
    });
  };

  return configPagesUsuario;
};
