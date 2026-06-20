export default (sequelize, DataTypes) => {
  const volIdioma = sequelize.define(
    "volIdioma",
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
      id_idioma: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "cat_idioma",
          key: "id",
        },
      },
      escrito: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      hablado: {
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
