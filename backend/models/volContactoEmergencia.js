export default (sequelize, DataTypes) => {
  const volContactoEmergencia = sequelize.define(
    "volContactoEmergencia",
    {
      id_emergencia: {
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
      label: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      celular: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      parentesco_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "cat_parentesco",
          key: "id",
        },
      },
    },
    {
      tableName: "vol_contacto_emergencia",
      timestamps: false,
    },
  );

  volContactoEmergencia.associate = (models) => {
    volContactoEmergencia.belongsTo(models.volInfo, {
      foreignKey: "voluntario_id",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volContactoEmergencia.belongsTo(models.catParentesco, {
      foreignKey: "parentesco_id",
      as: "parentesco",
    });
  };

  return volContactoEmergencia;
};
