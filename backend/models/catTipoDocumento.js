export default (sequelize, DataTypes) => {
  const catTipoDocumento = sequelize.define(
    "catTipoDocumento",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orden: {
        type: DataTypes.INTEGER,
        defaultValue: null,
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
      isUnique: {
        field: "isUnique",
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      label: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(100),
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
      foreignKey: "id_tipo_documento",
      as: "documentos",
    });
  };

  return catTipoDocumento;
};
