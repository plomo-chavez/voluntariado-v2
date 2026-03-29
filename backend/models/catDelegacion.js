export default (sequelize, DataTypes) => {
  const catDelegacion = sequelize.define(
    "catDelegacion",
    {
      id_delegacion: {
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
      tableName: "cat_delegacion",
      timestamps: false,
    },
  );

  catDelegacion.associate = (models) => {
    catDelegacion.hasMany(models.volInfo, {
      foreignKey: "id_delegacion",
      as: "voluntarios",
    });
  };

  return catDelegacion;
};
