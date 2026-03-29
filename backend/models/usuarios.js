export default (sequelize, DataTypes) => {
  const Usuarios = sequelize.define(
    "Usuarios",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      estado_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      municipio_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      delegacion_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tipo_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      estatus: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "usuarios",
    },
  );

  Usuarios.associate = (models) => {
    Usuarios.belongsTo(models.catTiposUsuarios, {
      foreignKey: "tipo_id",
      as: "tipo",
    });
    Usuarios.belongsTo(models.catEstados, {
      foreignKey: "estado_id",
      as: "estado",
    });
    Usuarios.belongsTo(models.catMunicipios, {
      foreignKey: "municipio_id",
      as: "municipio",
    });
    Usuarios.belongsTo(models.catDelegaciones, {
      foreignKey: "delegacion_id",
      as: "delegacion",
    });
    Usuarios.hasMany(models.Reportes, {
      foreignKey: "userCreate_id",
      as: "reportes",
    });
  };

  return Usuarios;
};
