export default (sequelize, DataTypes) => {
  const catTipoDocumento = sequelize.define(
    "catTipoDocumento",
    {
      id_tipo_documento: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
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
      tableName: "cat_tipo_documento",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  catTipoDocumento.associate = (models) => {
    catTipoDocumento.hasMany(models.volDocumento, {
      foreignKey: "id_tipo_documento",
      as: "documentos",
    });
  };

  return catTipoDocumento;
};
