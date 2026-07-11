import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import process from "process";
import Sequelize from "sequelize";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load variables before importing the Sequelize config. Static ES module
// imports are evaluated before index.js can execute its own dotenv.config().
const envPath = path.resolve(
  __dirname,
  "../../config",
  process.env.NODE_ENV === "production" ? ".env.backend.prod" : ".env.backend",
);
dotenv.config({ path: envPath });

const { default: config } = await import("../config/config.js");

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
// Determina entorno
const isProd = process.env.NODE_ENV === "production";

console.log("Cargando configuración para entorno:", env);
console.log("Cargando configuración para entorno:", isProd);

const dbConfig = config[env];

const db = {};

let sequelize;

if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig,
  );
}

// ===== Load models dynamically =====
const files = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.endsWith(".js") &&
    !file.endsWith(".test.js")
  );
});

for (const file of files) {
  const modelModule = await import(path.join(__dirname, file));
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// ===== Associations =====
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
