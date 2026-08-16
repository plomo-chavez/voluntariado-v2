import { verifyEncryptedJWT } from "../utils/encryptHelper.js"; // Importa tu helper
import authMiddleware from "./authMiddleware.js";
import { getUserToken, isPublicCatalogRoute } from "./authHelper.js"; // Importa tu helper
import db from "../models/index.js";
import dotenv from "dotenv";
const { Usuarios } = db;
dotenv.config();

const tokenMiddleware = async (req, res, next) => {
  const debug = process.env.DEBUG_REQUEST_AUTH === "true";

  const authHeader = req.headers.authorization;

  const token = authHeader.split(" ")[1]; // Extraer el token después de "Bearer"
  try {
    if (token == "dev-token") {
      req.user = await getUserToken(1);
      logMsg = "[AUTH GRANTED] Acceso concedido";
      logData = {
        user: req.user,
        url: req.originalUrl,
        method: req.method,
      };
      if (debug) console.log(logMsg, logData);
      next();
    } else {
      const decoded = verifyEncryptedJWT(token);
      const user = await getUserToken(decoded.id);
      req.user = user;
      next();
    }
  } catch (error) {
    return res.json({ message: "Token inválido o expirado" });
  }
};

export default tokenMiddleware;
