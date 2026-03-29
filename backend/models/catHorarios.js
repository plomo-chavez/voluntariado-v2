export default (sequelize, DataTypes) => {
  const catHorarios = sequelize.define(
    "catHorarios",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      horaInicio: {
        field: "horaInicio",
        type: DataTypes.TIME,
        allowNull: false,
      },
      horaFin: {
        field: "horaFin",
        type: DataTypes.TIME,
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "horarios",
    },
  );

  catHorarios.associate = (models) => {};
  return catHorarios;
};
