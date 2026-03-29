export default (sequelize, DataTypes) => {
  const catMunicipios = sequelize.define(
    "catMunicipios",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      label: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      estado_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
    },
    {
      tableName: "catMunicipios",
      timestamps: false, // No hay columnas de timestamps en esta tabla
      underscored: true, // Usa snake_case para los nombres de las columnas
    },
  );

  catMunicipios.associate = (models) => {
    catMunicipios.belongsTo(models.catEstados, {
      foreignKey: "estado_id",
      as: "estado",
    });

    catMunicipios.hasMany(models.catDelegaciones, {
      foreignKey: "municipio_id",
      as: "delegaciones",
    });
  };

  return catMunicipios;
};
