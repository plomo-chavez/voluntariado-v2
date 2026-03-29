export default (sequelize, DataTypes) => {
  const volHistorial = sequelize.define(
    "volHistorial",
    {
      id_historial: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_voluntario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "vol_info",
          key: "id_voluntario",
        },
        onDelete: "CASCADE",
      },
      id_coordinacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cat_coordinacion",
          key: "id_coordinacion",
        },
      },
      id_cargo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cat_cargo",
          key: "id_cargo",
        },
      },
      fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      es_principal: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      tableName: "vol_historial",
      timestamps: false,
    },
  );

  volHistorial.associate = (models) => {
    volHistorial.belongsTo(models.volInfo, {
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volHistorial.belongsTo(models.catCoordinacion, {
      foreignKey: "id_coordinacion",
      as: "coordinacion",
    });
    volHistorial.belongsTo(models.catCargo, {
      foreignKey: "id_cargo",
      as: "cargo",
    });
  };

  return volHistorial;
};
