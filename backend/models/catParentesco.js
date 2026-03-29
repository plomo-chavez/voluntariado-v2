export default (sequelize, DataTypes) => {
  const catParentesco = sequelize.define(
    "catParentesco",
    {
      id_parentesco: {
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
      tableName: "cat_parentesco",
      timestamps: false,
    },
  );

  catParentesco.associate = (models) => {
    catParentesco.hasMany(models.volContactoEmergencia, {
      foreignKey: "id_parentesco",
      as: "contactosEmergencia",
    });
  };

  return catParentesco;
};
