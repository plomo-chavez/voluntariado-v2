export default (sequelize, DataTypes) => {
  const catCargo = sequelize.define(
    "catCargo",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      area_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "cat_areas",
          key: "id",
        },
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
      tableName: "cat_cargo",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  catCargo.associate = (models) => {
    // catCargo.hasMany(models.volHistorial, {
    //   foreignKey: "cargo_id",
    //   as: "historiales",
    // });

    catCargo.belongsTo(models.catAreas, {
      foreignKey: "area_id",
      as: "area",
    });
  };

  return catCargo;
};
