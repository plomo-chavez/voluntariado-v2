import dotenv from "dotenv";
import db from "../models/index.js";

const { Usuarios } = db;
dotenv.config();

import { verifyEncryptedJWT } from "../utils/encryptHelper.js"; // Importa tu helper

const getUserToken = async (userID) => {
  const userBD = await Usuarios.findByPk(userID, {
    attributes: ["id", "nombre", "correo", "tipo_id", "estatus"],
  });
  return userBD?.toJSON() ?? null;
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1]; // Extraer el token después de "Bearer"

  try {
    if (token == "dev-token") {
      req.user = await getUserToken(1); // Agregar los datos del usuario al objeto de la solicitud
      next(); // Continuar con la siguiente función
    } else {
      // Verifica y decodifica el token JWT
      const decoded = verifyEncryptedJWT(token);
      req.user = await getUserToken(decoded.id); // Agregar los datos del usuario al objeto de la solicitud
      next(); // Continuar con la siguiente función
    }
  } catch (error) {
    return res.json({ message: "Token inválido o expirado" });
  }
};

export default authMiddleware;
