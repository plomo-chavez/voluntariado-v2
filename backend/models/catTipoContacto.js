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
      estatus: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "cat_tipo_contacto",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
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
