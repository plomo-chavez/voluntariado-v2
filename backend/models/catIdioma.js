export default (sequelize, DataTypes) => {
  const catIdioma = sequelize.define(
    "catIdioma",
    {
      id_idioma: {
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
      tableName: "cat_idioma",
      timestamps: false,
    },
  );

  catIdioma.associate = (models) => {
    catIdioma.hasMany(models.volIdioma, {
      foreignKey: "id_idioma",
      as: "voluntariosIdiomas",
    });
  };

  return catIdioma;
};
