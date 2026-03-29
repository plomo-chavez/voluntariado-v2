export default (sequelize, DataTypes) => {
  const Elementos = sequelize.define(
    "Elementos",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      curp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      segundoNombre: {
        field: "segundoNombre",
        type: DataTypes.STRING,
        allowNull: true,
      },
      primerApellido: {
        field: "primerApellido",
        type: DataTypes.STRING,
        allowNull: true,
      },
      segundoApellido: {
        field: "segundoApellido",
        type: DataTypes.STRING,
        allowNull: true,
      },
      numeroAsociado: {
        field: "numeroAsociado",
        type: DataTypes.STRING,
        unique: true,
      },
      estado_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      municipio_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      delegacion_id: {
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
      tableName: "elementos",
    },
  );

  Elementos.associate = (models) => {
    Elementos.belongsTo(models.catEstados, {
      foreignKey: "estado_id",
      as: "estado",
    });
    Elementos.belongsTo(models.catMunicipios, {
      foreignKey: "municipio_id",
      as: "municipio",
    });
    Elementos.belongsTo(models.catDelegaciones, {
      foreignKey: "delegacion_id",
      as: "delegacion",
    });
  };

  return Elementos;
};
