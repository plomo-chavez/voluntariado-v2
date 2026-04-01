export default (sequelize, DataTypes) => {
  const volInfo = sequelize.define(
    "volInfo",
    {
      id: {
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
        label: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
      },
      sexo: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      lugar_nacimiento: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      nacionalidad_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_nacionalidad",
          key: "id",
        },
      },
      estado_civil_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_estado_civil",
          key: "id",
        },
      },
      grupo_sanguineo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_grupo_sanguineo",
          key: "id",
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
      estado_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_estado",
          key: "id",
        },
      },
      delegacion_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_delegacion",
          key: "id",
        },
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
      tableName: "vol_info",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  volInfo.associate = (models) => {
    volInfo.belongsTo(models.catNacionalidad, {
      foreignKey: "nacionalidad_id",
      as: "nacionalidad",
    });
    volInfo.belongsTo(models.catEstadoCivil, {
      foreignKey: "estado_civil_id",
      as: "estadoCivil",
    });
    volInfo.belongsTo(models.catGrupoSanguineo, {
      foreignKey: "grupo_sanguineo_id",
      as: "grupoSanguineo",
    });
    volInfo.belongsTo(models.catEstado, {
      foreignKey: "estado_id",
      as: "estado",
    });
    volInfo.belongsTo(models.catDelegacion, {
      foreignKey: "delegacion_id",
      as: "delegacion",
    });
    volInfo.hasMany(models.volCargos, {
      foreignKey: "voluntario_id",
      as: "cargos",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volContacto, {
      foreignKey: "voluntario_id",
      as: "contactos",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volDireccion, {
      foreignKey: "voluntario_id",
      as: "direcciones",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volContactoEmergencia, {
      foreignKey: "voluntario_id",
      as: "contactosEmergencia",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volDatosProfesionales, {
      foreignKey: "voluntario_id",
      as: "datosProfesionales",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volIdioma, {
      foreignKey: "voluntario_id",
      as: "idiomas",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volDocumento, {
      foreignKey: "voluntario_id",
      as: "documentos",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volDisponibilidad, {
      foreignKey: "voluntario_id",
      as: "disponibilidades",
      onDelete: "CASCADE",
    });
    volInfo.hasMany(models.volInfoExtra, {
      foreignKey: "voluntario_id",
      as: "infoExtra",
      onDelete: "CASCADE",
    });
  };

  return volInfo;
};
