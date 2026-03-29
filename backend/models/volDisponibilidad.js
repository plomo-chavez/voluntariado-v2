export default (sequelize, DataTypes) => {
  const volDisponibilidad = sequelize.define(
    "volDisponibilidad",
    {
      id_disponibilidad: {
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
      id_dia: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_dia",
          key: "id_dia",
        },
      },
      id_turno: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_turno",
          key: "id_turno",
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
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volDisponibilidad.belongsTo(models.catDia, {
      foreignKey: "id_dia",
      as: "dia",
    });
    volDisponibilidad.belongsTo(models.catTurno, {
      foreignKey: "id_turno",
      as: "turno",
    });
  };

  return volDisponibilidad;
};
