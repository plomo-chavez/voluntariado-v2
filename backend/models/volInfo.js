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
      fecha_nacimiento: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(100),
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
      area_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "cat_areas",
          key: "id",
        },
      },
      cargo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "cat_cargo",
          key: "id",
        },
      },
      fecha_cr: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      fecha_area: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      seguro_personal: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      seguro_institucional: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      paranoid: true,
      tableName: "vol_info",
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
      as: "estado_civil",
    });
    volInfo.belongsTo(models.catGrupoSanguineo, {
      foreignKey: "grupo_sanguineo_id",
      as: "grupo_sanguineo",
    });
    volInfo.belongsTo(models.catEstado, {
      foreignKey: "estado_id",
      as: "estado",
    });
    volInfo.belongsTo(models.catDelegacion, {
      foreignKey: "delegacion_id",
      as: "delegacion",
    });
    volInfo.belongsTo(models.catAreas, {
      foreignKey: "area_id",
      as: "area",
    });
    volInfo.belongsTo(models.catCargo, {
      foreignKey: "cargo_id",
      as: "cargo",
    });
    volInfo.hasMany(models.volCargos, {
      foreignKey: "id_voluntario",
      as: "cargos",
    });
    volInfo.hasMany(models.volContacto, {
      foreignKey: "id_voluntario",
      as: "contactos",
    });
    volInfo.hasOne(models.volDireccion, {
      foreignKey: "id_voluntario",
      as: "direccion",
    });
    volInfo.hasOne(models.volContactoEmergencia, {
      foreignKey: "id_voluntario",
      as: "contactoEmergencia",
    });
    volInfo.hasOne(models.volDatosProfesionales, {
      foreignKey: "id_voluntario",
      as: "profesionales",
    });
    volInfo.hasMany(models.volIdioma, {
      foreignKey: "id_voluntario",
      as: "idiomas",
    });
    volInfo.hasMany(models.volDocumento, {
      foreignKey: "id_voluntario",
      as: "documentos",
    });
    volInfo.hasMany(models.volDisponibilidad, {
      foreignKey: "id_voluntario",
      as: "disponibilidades",
    });
    volInfo.hasOne(models.volInfoExtra, {
      foreignKey: "id_voluntario",
      as: "intereses",
    });
  };

  return volInfo;
};
