export default (sequelize, DataTypes) => {
  const catEstadoCivil = sequelize.define(
    "catEstadoCivil",
    {
      id_estado_civil: {
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
      tableName: "cat_estado_civil",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  catEstadoCivil.associate = (models) => {
    catEstadoCivil.hasMany(models.volInfo, {
      foreignKey: "id_estado_civil",
      as: "voluntarios",
    });
  };

  return catEstadoCivil;
};
