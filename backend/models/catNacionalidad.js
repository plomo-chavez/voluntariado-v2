export default (sequelize, DataTypes) => {
  const catNacionalidad = sequelize.define(
    "catNacionalidad",
    {
      id_nacionalidad: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "cat_nacionalidad",
      timestamps: false,
    },
  );

  catNacionalidad.associate = (models) => {
    catNacionalidad.hasMany(models.volInfo, {
      foreignKey: "id_nacionalidad",
      as: "voluntarios",
    });
  };

  return catNacionalidad;
};
