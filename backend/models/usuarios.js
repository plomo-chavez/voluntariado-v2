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
      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tipo_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      estado_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      delegacion_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
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
    Usuarios.belongsTo(models.catEstado, {
      foreignKey: "estado_id",
      as: "estado",
    });
    Usuarios.belongsTo(models.catDelegacion, {
      foreignKey: "delegacion_id",
      as: "delegacion",
    });
  };

  return Usuarios;
};
