export default (sequelize, DataTypes) => {
  const estadoElementos = sequelize.define(
    "estadoElementos",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      estado_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_estado",
          key: "id",
        },
      },
      numero: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
    },
    {
      tableName: "estado_elementos",
      timestamps: false,
    },
  );

  estadoElementos.associate = (models) => {
    estadoElementos.belongsTo(models.catEstado, {
      foreignKey: "estado_id",
      as: "estado",
    });
  };

  return estadoElementos;
};
