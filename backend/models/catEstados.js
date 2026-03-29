export default (sequelize, DataTypes) => {
  const catEstados = sequelize.define(
    "catEstados",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      estatus: {
        type: DataTypes.TINYINT,
        allowNull: false,
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
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "catEstados",
    },
  );

  catEstados.associate = (models) => {
    catEstados.hasMany(models.catMunicipios, {
      foreignKey: "estado_id",
      as: "municipios",
    });
    catEstados.hasMany(models.catDelegaciones, {
      foreignKey: "estado_id",
      as: "delegaciones",
    });
  };

  return catEstados;
};
