export default (sequelize, DataTypes) => {
  const volContacto = sequelize.define(
    "volContacto",
    {
      id_contacto: {
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
      id_tipo_contacto: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_tipo_contacto",
          key: "id_tipo_contacto",
        },
      },
      numero: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "vol_contacto",
      timestamps: false,
    },
  );

  volContacto.associate = (models) => {
    volContacto.belongsTo(models.volInfo, {
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volContacto.belongsTo(models.catTipoContacto, {
      foreignKey: "id_tipo_contacto",
      as: "tipoContacto",
    });
  };

  return volContacto;
};
