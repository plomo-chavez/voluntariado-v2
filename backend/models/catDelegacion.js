export default (sequelize, DataTypes) => {
  const catDelegacion = sequelize.define(
    "catDelegacion",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      estado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: "cat_delegacion",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  catDelegacion.associate = (models) => {
    catDelegacion.hasMany(models.volInfo, {
      foreignKey: "delegacion_id",
      as: "voluntarios",
    });
    // Si hay relación con estado, agregarla aquí:
    // catDelegacion.belongsTo(models.catEstado, { foreignKey: "estado_id", as: "estado" });
  };

  return catDelegacion;
};
