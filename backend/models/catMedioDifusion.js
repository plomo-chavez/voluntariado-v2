export default (sequelize, DataTypes) => {
  const catMedioDifusion = sequelize.define(
    "catMedioDifusion",
    {
      id_medio: {
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
      tableName: "cat_medio_difusion",
      timestamps: false,
    },
  );

  catMedioDifusion.associate = (models) => {
    catMedioDifusion.hasMany(models.volInfoExtra, {
      foreignKey: "id_medio",
      as: "informacionExtra",
    });
  };

  return catMedioDifusion;
};
