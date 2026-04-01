export default (sequelize, DataTypes) => {
  const volCargos = sequelize.define(
    "volCargos",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      voluntario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "vol_info",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      coordinacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cat_coordinacion",
          key: "id",
        },
      },
      cargo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cat_cargo",
          key: "id",
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

  volCargos.associate = (models) => {
    // volCargos.belongsTo(models.volInfo, {
    //   foreignKey: "voluntario_id",
    //   as: "voluntario",
    //   onDelete: "CASCADE",
    // });
    // volCargos.belongsTo(models.catAreas, {
    //   foreignKey: "coordinacion_id",
    //   as: "coordinacion",
    // });
    // volCargos.belongsTo(models.catCargo, {
    //   foreignKey: "cargo_id",
    //   as: "cargo",
    // });
  };

  return volCargos;
};
