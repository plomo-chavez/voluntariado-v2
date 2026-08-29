export default (sequelize, DataTypes) => {
  const volDocumento = sequelize.define(
    "volDocumento",
    {
      id_documento: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_voluntario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "vol_info",
          key: "id_voluntario",
        },
        onDelete: "CASCADE",
      },
      id_tipo_documento: {
        field: "id_tipo_documento",
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_tipo_documento",
          key: "id_tipo_documento",
        },
      },
      numero: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      fechaFinal: {
        field: "fechaFinal",
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      fechaInicio: {
        field: "fechaInicio",
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      ruta_archivo: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      referencia_documento: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      area_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "cat_areas",
          key: "id",
        },
      },
    },
    {
      tableName: "vol_documento",
      timestamps: true,
    },
  );

  volDocumento.associate = (models) => {
    volDocumento.belongsTo(models.volInfo, {
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volDocumento.belongsTo(models.catTipoDocumento, {
      foreignKey: "id_tipo_documento",
      as: "tipoDocumento",
    });
    volDocumento.belongsTo(models.catAreas, {
      foreignKey: "area_id",
      as: "area",
    });
  };

  return volDocumento;
};
