export default (sequelize, DataTypes) => {
  const catGradoEstudios = sequelize.define(
    "catGradoEstudios",
    {
      id_grado_estudios: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
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
      tableName: "cat_grado_estudios",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  catGradoEstudios.associate = (models) => {
    catGradoEstudios.hasMany(models.volDatosProfesionales, {
      foreignKey: "id_grado_estudios",
      as: "datosProfesionales",
    });
  };

  return catGradoEstudios;
};
