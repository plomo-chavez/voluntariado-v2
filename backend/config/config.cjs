export default {
  development: {
    username: "volunta3_voluntariado",
    password: "Jesus.34J",
    database: "volunta3_vol2",
    host: "mx58.hostgator.mx",
    logging: true,
    dialect: "mysql",
    define: {
      paranoid: true,
      timestamps: true,
      underscored: true,
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  test: {
    username: "volunta3_voluntariado",
    password: "Jesus.34J",
    database: "volunta3_vol2",
    host: "mx58.hostgator.mx",
    logging: false,
    dialect: "mysql",
    define: {
      paranoid: true,
      timestamps: true,
      underscored: true,
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  production: {
    username: "volunta3_voluntariado",
    password: "Jesus.34J",
    database: "volunta3_vol2",
    host: "mx58.hostgator.mx",
    logging: false,
    dialect: "mysql",
    define: {
      paranoid: true,
      timestamps: true,
      underscored: true,
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
};
