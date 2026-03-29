export default (sequelize, DataTypes) => {
  const catTipoContacto = sequelize.define(
    "catTipoContacto",
    {
      id_tipo_contacto: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "cat_tipo_contacto",
      timestamps: false,
    },
  );

  catTipoContacto.associate = (models) => {
    catTipoContacto.hasMany(models.volContacto, {
      foreignKey: "id_tipo_contacto",
      as: "contactos",
    });
  };

  return catTipoContacto;
};
