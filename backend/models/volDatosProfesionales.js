export default (sequelize, DataTypes) => {
  const volDatosProfesionales = sequelize.define(
    "volDatosProfesionales",
    {
      id_profesional: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_voluntario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "vol_info",
          key: "id_voluntario",
        },
        onDelete: "CASCADE",
      },
      id_grado_estudios: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_grado_estudios",
          key: "id_grado_estudios",
        },
      },
      profesion: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ocupacion_actual: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      empresa: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: "vol_datos_profesionales",
      timestamps: false,
    },
  );

  volDatosProfesionales.associate = (models) => {
    volDatosProfesionales.belongsTo(models.volInfo, {
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volDatosProfesionales.belongsTo(models.catGradoEstudios, {
      foreignKey: "id_grado_estudios",
      as: "gradoEstudios",
    });
  };

  return volDatosProfesionales;
};
