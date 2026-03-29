export default (sequelize, DataTypes) => {
  const catTiposUsuarios = sequelize.define(
    "catTiposUsuarios",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
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
    },
    {
      tableName: "catTiposUsuarios",
    },
  );

  catTiposUsuarios.associate = (models) => {
    catTiposUsuarios.hasMany(models.Usuarios, {
      foreignKey: "tipo_id",
      as: "usuarios",
    });
  };

  return catTiposUsuarios;
};
