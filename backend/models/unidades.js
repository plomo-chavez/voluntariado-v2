export default (sequelize, DataTypes) => {
  const Unidades = sequelize.define(
    "Unidades",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      numero: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      marca: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      modelo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      serie: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estado_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      municipio_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      delegacion_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
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
      tableName: "unidades",
    },
  );

  Unidades.associate = (models) => {
    Unidades.belongsTo(models.catEstados, {
      foreignKey: "estado_id",
      as: "estado",
    });
    Unidades.belongsTo(models.catMunicipios, {
      foreignKey: "municipio_id",
      as: "municipio",
    });
    Unidades.belongsTo(models.catDelegaciones, {
      foreignKey: "delegacion_id",
      as: "delegacion",
    });
  };

  return Unidades;
};
