export default (sequelize, DataTypes) => {
  const catDelegaciones = sequelize.define(
    "catDelegaciones",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      numDelegacion: {
        field: "numDelegacion",
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      label: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      municipio_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      autoridades: {
        type: DataTypes.TEXT,
      },
      estado_id: {
        type: DataTypes.BIGINT,
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
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "catDelegaciones",
    },
  );

  catDelegaciones.associate = (models) => {
    catDelegaciones.belongsTo(models.catEstados, {
      foreignKey: "estado_id",
      as: "estado",
    });
    catDelegaciones.belongsTo(models.catMunicipios, {
      foreignKey: "municipio_id",
      as: "municipio",
    });
  };

  return catDelegaciones;
};
