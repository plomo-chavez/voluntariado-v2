import db from "../models/index.js";
const { Usuarios } = db;
const getUserToken = async (userID) => {
  const userBD = await Usuarios.findByPk(userID, {
    attributes: ["id", "nombre", "correo", "tipo_id", "estatus"],
  });
  return userBD?.toJSON() ?? null;
};

const isPublicCatalogRoute = (req) => {
  if (req.method === "OPTIONS") return true;
  return (
    req.originalUrl.startsWith("/api/catalogos") ||
    req.originalUrl.startsWith("/api/public/catalogos")
  );
};

export { getUserToken, isPublicCatalogRoute };
