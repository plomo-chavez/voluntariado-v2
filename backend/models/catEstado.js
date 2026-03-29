export default (sequelize, DataTypes) => {
  const catEstado = sequelize.define(
    "catEstado",
    {
      id_estado: {
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
      tableName: "cat_estado",
      timestamps: false,
    },
  );

  catEstado.associate = (models) => {
    catEstado.hasMany(models.volInfo, {
      foreignKey: "id_estado",
      as: "voluntarios",
    });
    catEstado.hasMany(models.volDireccion, {
      foreignKey: "id_estado",
      as: "direcciones",
    });
  };

  return catEstado;
};
