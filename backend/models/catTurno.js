export default (sequelize, DataTypes) => {
  const catTurno = sequelize.define(
    "catTurno",
    {
      id_turno: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "cat_turno",
      timestamps: false,
    },
  );

  catTurno.associate = (models) => {
    catTurno.hasMany(models.volDisponibilidad, {
      foreignKey: "id_turno",
      as: "disponibilidades",
    });
  };

  return catTurno;
};
