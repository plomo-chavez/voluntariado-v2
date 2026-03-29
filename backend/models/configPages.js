export default (sequelize, DataTypes) => {
  const configPages = sequelize.define(
    "configPages",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      route_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      parent_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      tableName: "config_pages",
      timestamps: false,
    },
  );

  configPages.associate = (models) => {
    configPages.hasMany(models.configPagesUsuario, {
      foreignKey: "page_id",
      as: "permisos",
    });
    configPages.belongsTo(models.configPages, {
      foreignKey: "parent_id",
      as: "parent",
    });
    configPages.hasMany(models.configPages, {
      foreignKey: "parent_id",
      as: "children",
    });
  };

  return configPages;
};
