export default (sequelize, DataTypes) => {
  const Logs = sequelize.define(
    "Logs",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      accion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      extraData: {
        field: "extraData",
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      estatus: {
        type: DataTypes.TINYINT,
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
      tableName: "logs",
    },
  );

  Logs.associate = (models) => {
    Logs.belongsTo(models.Usuarios, {
      foreignKey: "usuario_id",
      as: "usuario",
    });
  };

  return Logs;
};
