export default (sequelize, DataTypes) => {
  const catEstadoCivil = sequelize.define(
    "catEstadoCivil",
    {
      id_estado_civil: {
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
      tableName: "cat_estado_civil",
      timestamps: false,
    },
  );

  catEstadoCivil.associate = (models) => {
    catEstadoCivil.hasMany(models.volInfo, {
      foreignKey: "id_estado_civil",
      as: "voluntarios",
    });
  };

  return catEstadoCivil;
};
