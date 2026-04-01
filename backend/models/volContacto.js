export default (sequelize, DataTypes) => {
  const volContacto = sequelize.define(
    "volContacto",
    {
      id_contacto: {
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
      tipo_contacto_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_tipo_contacto",
          key: "id",
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
      foreignKey: "voluntario_id",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volContacto.belongsTo(models.catTipoContacto, {
      foreignKey: "tipo_contacto_id",
      as: "tipoContacto",
    });
  };

  return volContacto;
};
