export default (sequelize, DataTypes) => {
  const catCargo = sequelize.define(
    "catCargo",
    {
      id_cargo: {
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
      tableName: "cat_cargo",
      timestamps: false,
    },
  );

  catCargo.associate = (models) => {
    catCargo.hasMany(models.volHistorial, {
      foreignKey: "id_cargo",
      as: "historiales",
    });
  };

  return catCargo;
};
