export default (sequelize, DataTypes) => {
  const catGrupoSanguineo = sequelize.define(
    "catGrupoSanguineo",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      label: {
        type: DataTypes.STRING(5),
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
      tableName: "cat_grupo_sanguineo",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  catGrupoSanguineo.associate = (models) => {
    catGrupoSanguineo.hasMany(models.volInfo, {
      foreignKey: "grupo_sanguineo_id",
      as: "voluntarios",
    });
  };

  return catGrupoSanguineo;
};
