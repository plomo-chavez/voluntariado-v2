export default (sequelize, DataTypes) => {
  const volDireccion = sequelize.define(
    "volDireccion",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_voluntario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "vol_info",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      direccion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      colonia: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      numero_exterior: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      numero_interior: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      ciudad: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      cp: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      id_estado: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_estado",
          key: "id",
        },
      },
    },
    {
      tableName: "vol_direccion",
      timestamps: false,
    },
  );

  volDireccion.associate = (models) => {
    volDireccion.belongsTo(models.volInfo, {
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volDireccion.belongsTo(models.catEstado, {
      foreignKey: "id_estado",
      as: "estado",
    });
  };

  return volDireccion;
};
