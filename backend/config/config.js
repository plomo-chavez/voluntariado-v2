import dotenv from "dotenv";
dotenv.config();

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
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
};
console.log("Database configuration loaded:", {
  username: baseConfig.username,
  database: baseConfig.database,
  host: baseConfig.host,
  port: baseConfig.port,
  dialect: baseConfig.dialect,
});

export default {
  development: {
    ...baseConfig,
    logging: true,
  },
  test: {
    ...baseConfig,
  },
  production: {
    ...baseConfig,
  },
};
