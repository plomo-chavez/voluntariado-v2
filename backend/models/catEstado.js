export default (sequelize, DataTypes) => {
  const catEstado = sequelize.define(
    "catEstado",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      label: {
        type: DataTypes.STRING(100),
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
      tableName: "cat_estado",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  catEstado.associate = (models) => {
    catEstado.hasMany(models.volInfo, {
      foreignKey: "estado_id",
      as: "voluntarios",
    });
    catEstado.hasMany(models.volDireccion, {
      foreignKey: "estado_id",
      as: "direcciones",
    });
  };

  return catEstado;
};
