export default (sequelize, DataTypes) => {
  const catTipoDocumento = sequelize.define(
    "catTipoDocumento",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      label: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      estatus: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
      },
      label: {
        type: DataTypes.STRING(50),
        allowNull: true,
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
      foreignKey: "tipo_documento_id",
      as: "documentos",
    });
  };

  return catTipoDocumento;
};
