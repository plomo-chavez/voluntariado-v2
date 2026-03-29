export default (sequelize, DataTypes) => {
  const catTiposSolicitante = sequelize.define(
    "catTiposSolicitante",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      estatus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "catTiposSolicitante",
    },
  );

  catTiposSolicitante.associate = (models) => {};
  return catTiposSolicitante;
};
