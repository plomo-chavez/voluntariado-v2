export default (sequelize, DataTypes) => {
  const volInfoExtra = sequelize.define(
    "volInfoExtra",
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
      id_medio: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_medio_difusion",
          key: "id",
        },
      },
      otro_medio: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      motivo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expectativas: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      aportaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      experiencia_previa: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      detalle_experiencia: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      otraInstitucion: {
        field: "otraInstitucion",
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "vol_info_extra",
      timestamps: false,
    },
  );

  volInfoExtra.associate = (models) => {
    volInfoExtra.belongsTo(models.volInfo, {
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volInfoExtra.belongsTo(models.catMedioDifusion, {
      foreignKey: "id_medio",
      as: "medioDifusion",
    });
  };

  return volInfoExtra;
};
