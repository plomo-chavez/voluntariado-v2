export default (sequelize, DataTypes) => {
  const volDisponibilidad = sequelize.define(
    "volDisponibilidad",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      voluntario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "vol_info",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      dia_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_dia",
          key: "id",
        },
      },
      turno_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_turno",
          key: "id",
        },
      },
      horario: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "vol_disponibilidad",
      timestamps: false,
    },
  );

  volDisponibilidad.associate = (models) => {
    volDisponibilidad.belongsTo(models.volInfo, {
      foreignKey: "voluntario_id",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volDisponibilidad.belongsTo(models.catDia, {
      foreignKey: "dia_id",
      as: "dia",
    });
    volDisponibilidad.belongsTo(models.catTurno, {
      foreignKey: "turno_id",
      as: "turno",
    });
  };

  return volDisponibilidad;
};
