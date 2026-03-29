export default (sequelize, DataTypes) => {
  const volIdioma = sequelize.define(
    "volIdioma",
    {
      id_voluntario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "vol_info",
          key: "id_voluntario",
        },
        onDelete: "CASCADE",
      },
      id_idioma: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "cat_idioma",
          key: "id_idioma",
        },
      },
      nivel_escrito: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      nivel_hablado: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "vol_idioma",
      timestamps: false,
    },
  );

  volIdioma.associate = (models) => {
    volIdioma.belongsTo(models.volInfo, {
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volIdioma.belongsTo(models.catIdioma, {
      foreignKey: "id_idioma",
      as: "idioma",
    });
  };

  return volIdioma;
};
