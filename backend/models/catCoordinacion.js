export default (sequelize, DataTypes) => {
  const catCoordinacion = sequelize.define(
    "catCoordinacion",
    {
      id_coordinacion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: "cat_coordinacion",
      timestamps: false,
    },
  );

  catCoordinacion.associate = (models) => {
    catCoordinacion.hasMany(models.volHistorial, {
      foreignKey: "id_coordinacion",
      as: "historiales",
    });
  };

  return catCoordinacion;
};
