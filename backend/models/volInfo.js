export default (sequelize, DataTypes) => {
  const volInfo = sequelize.define(
    "volInfo",
    {
      id_voluntario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      numero_interno: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      numero_asociado: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      segundo_nombre: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      primer_apellido: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      segundo_apellido: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      curp: {
        type: DataTypes.STRING(18),
        allowNull: true,
        unique: true,
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      sexo: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      lugar_nacimiento: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      id_nacionalidad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_nacionalidad",
          key: "id_nacionalidad",
        },
      },
      id_estado_civil: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_estado_civil",
          key: "id_estado_civil",
        },
      },
      id_grupo_sanguineo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_grupo_sanguineo",
          key: "id_grupo_sanguineo",
        },
      },
      capacidades_diferentes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      enfermedades: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      alergias: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      correo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      id_estado: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_estado",
          key: "id_estado",
        },
      },
      id_delegacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_delegacion",
          key: "id_delegacion",
        },
      },
    },
    {
      tableName: "vol_info",
      timestamps: false,
    },
  );

  volInfo.associate = (models) => {
    volInfo.belongsTo(models.catNacionalidad, {
      foreignKey: "id_nacionalidad",
      as: "nacionalidad",
    });
    volInfo.belongsTo(models.catEstadoCivil, {
      foreignKey: "id_estado_civil",
      as: "estadoCivil",
    });
    volInfo.belongsTo(models.catGrupoSanguineo, {
      foreignKey: "id_grupo_sanguineo",
      as: "grupoSanguineo",
    });
    volInfo.belongsTo(models.catEstado, {
      foreignKey: "id_estado",
      as: "estado",
    });
    volInfo.belongsTo(models.catDelegacion, {
      foreignKey: "id_delegacion",
      as: "delegacion",
    });

    volInfo.hasMany(models.volHistorial, {
      foreignKey: "id_voluntario",
      as: "historial",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volContacto, {
      foreignKey: "id_voluntario",
      as: "contactos",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volDireccion, {
      foreignKey: "id_voluntario",
      as: "direcciones",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volContactoEmergencia, {
      foreignKey: "id_voluntario",
      as: "contactosEmergencia",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volDatosProfesionales, {
      foreignKey: "id_voluntario",
      as: "datosProfesionales",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volIdioma, {
      foreignKey: "id_voluntario",
      as: "idiomas",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volDocumento, {
      foreignKey: "id_voluntario",
      as: "documentos",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volDisponibilidad, {
      foreignKey: "id_voluntario",
      as: "disponibilidades",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volInfoExtra, {
      foreignKey: "id_voluntario",
      as: "infoExtra",
      onDelete: "CASCADE",
    });
  };

  return volInfo;
};
