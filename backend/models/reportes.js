export default (sequelize, DataTypes) => {
  const Reporte = sequelize.define(
    "Reportes",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      tipo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      timeInicio: {
        field: "timeInicio",
        type: DataTypes.TIME,
      },
      timeFin: {
        field: "timeFin",
        type: DataTypes.TIME,
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
      horario_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      area_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      agresor_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      userCreate_id: {
        field: "userCreate_id",
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      data: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
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
      tableName: "reportes",
    },
  );

  Reporte.associate = (models) => {
    Reporte.belongsTo(models.catEstados, {
      foreignKey: "estado_id",
      as: "estado",
    });
    Reporte.belongsTo(models.catMunicipios, {
      foreignKey: "municipio_id",
      as: "municipio",
    });
    Reporte.belongsTo(models.catDelegaciones, {
      foreignKey: "delegacion_id",
      as: "delegacion",
    });

    Reporte.belongsTo(models.catHorarios, {
      foreignKey: "horario_id",
      as: "horario",
    });

    Reporte.belongsTo(models.catAreas, {
      foreignKey: "area_id",
      as: "area",
    });

    Reporte.belongsTo(models.catAgresores, {
      foreignKey: "agresor_id",
      as: "agresor",
    });

    Reporte.belongsTo(models.Usuarios, {
      foreignKey: "userCreate_id",
      as: "userCreate",
    });
  };

  return Reporte;
};
