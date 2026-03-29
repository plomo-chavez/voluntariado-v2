export default (sequelize, DataTypes) => {
  const volDocumento = sequelize.define(
    "volDocumento",
    {
      id_documento: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_voluntario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "vol_info",
          key: "id_voluntario",
        },
        onDelete: "CASCADE",
      },
      id_tipo_documento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_tipo_documento",
          key: "id_tipo_documento",
        },
      },
      numero: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      vigencia: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      tableName: "vol_documento",
      timestamps: false,
    },
  );

  volDocumento.associate = (models) => {
    volDocumento.belongsTo(models.volInfo, {
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volDocumento.belongsTo(models.catTipoDocumento, {
      foreignKey: "id_tipo_documento",
      as: "tipoDocumento",
    });
  };

  return volDocumento;
};
