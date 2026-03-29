export default (sequelize, DataTypes) => {
  const catDia = sequelize.define(
    "catDia",
    {
      id_dia: {
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
      tableName: "cat_dia",
      timestamps: false,
    },
  );

  catDia.associate = (models) => {
    catDia.hasMany(models.volDisponibilidad, {
      foreignKey: "id_dia",
      as: "disponibilidades",
    });
  };

  return catDia;
};
