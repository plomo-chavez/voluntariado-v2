export default (sequelize, DataTypes) => {
  const volContactoEmergencia = sequelize.define(
    "volContactoEmergencia",
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
      nombre: {
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
      id_parentesco: {
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
      foreignKey: "id_voluntario",
      as: "voluntario",
      onDelete: "CASCADE",
    });
    volContactoEmergencia.belongsTo(models.catParentesco, {
      foreignKey: "id_parentesco",
      as: "parentesco",
    });
  };

  return volContactoEmergencia;
};
