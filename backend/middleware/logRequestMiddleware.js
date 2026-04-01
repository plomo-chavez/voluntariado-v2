import dotenv from "dotenv";
dotenv.config();

// Middleware para loguear dirección, tipo y payload de cada petición
export default function logRequestMiddleware(req, res, next) {
  const { method, originalUrl, body, query, params } = req;
  const log = {
    tipo: method,
    direccion: originalUrl,
    payload: {
      body,
      query,
      params,
    },
    fecha: new Date().toISOString(),
  };
  const debug = process.env.DEBUG_LOG_REQUEST === "true";
  if (debug) {
    console.log("[LOG REQUEST]", JSON.stringify(log, null, 2));
  }
  next();
}
