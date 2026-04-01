export default (sequelize, DataTypes) => {
  const volDatosProfesionales = sequelize.define(
    "volDatosProfesionales",
    {
      id_profesional: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      voluntario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "vol_info",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      grado_estudios_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_grado_estudios",
          key: "id",
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
      foreignKey: "voluntario_id",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volDatosProfesionales.belongsTo(models.catGradoEstudios, {
      foreignKey: "grado_estudios_id",
      as: "gradoEstudios",
    });
  };

  return volDatosProfesionales;
};
