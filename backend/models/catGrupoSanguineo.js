export default (sequelize, DataTypes) => {
  const catGrupoSanguineo = sequelize.define(
    "catGrupoSanguineo",
    {
      id_grupo_sanguineo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
    },
    {
      tableName: "cat_grupo_sanguineo",
      timestamps: false,
    },
  );

  catGrupoSanguineo.associate = (models) => {
    catGrupoSanguineo.hasMany(models.volInfo, {
      foreignKey: "id_grupo_sanguineo",
      as: "voluntarios",
    });
  };

  return catGrupoSanguineo;
};
