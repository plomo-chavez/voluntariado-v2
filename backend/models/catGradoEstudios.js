export default (sequelize, DataTypes) => {
  const catGradoEstudios = sequelize.define(
    "catGradoEstudios",
    {
      id_grado_estudios: {
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
      tableName: "cat_grado_estudios",
      timestamps: false,
    },
  );

  catGradoEstudios.associate = (models) => {
    catGradoEstudios.hasMany(models.volDatosProfesionales, {
      foreignKey: "id_grado_estudios",
      as: "datosProfesionales",
    });
  };

  return catGradoEstudios;
};
