export default (sequelize, DataTypes) => {
  const catDia = sequelize.define(
    "catDia",
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
      tableName: "cat_dia",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  catDia.associate = (models) => {
    catDia.hasMany(models.volDisponibilidad, {
      foreignKey: "dia_id",
      as: "disponibilidades",
    });
  };

  return catDia;
};
