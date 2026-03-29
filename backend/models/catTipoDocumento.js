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
    },
    {
      tableName: "cat_tipo_documento",
      timestamps: false,
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
