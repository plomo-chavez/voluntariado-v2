import express from "express";
import pagesController from "../controllers/pagesController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Menú filtrado para el usuario autenticado
router.get("/menu", pagesController.getMenu);

// CRUD de páginas
router.get("/config-pages/list", pagesController.getAll);
router.post("/config-pages/guardar", pagesController.guardar);
router.post("/config-pages/eliminar", pagesController.eliminar);

// Permisos por tipo de usuario
router.get("/config-pages/permisos/tipo/:tipoId", pagesController.getPermisosTipo);
router.post("/config-pages/permisos/tipo/:tipoId", pagesController.savePermisosTipo);

// Permisos por usuario individual
router.get("/config-pages/permisos/usuario/:userId", pagesController.getPermisosUsuario);
router.post("/config-pages/permisos/usuario/:userId", pagesController.savePermisosUsuario);

// Status de permisos del usuario actual
router.get("/config-pages/permisos/mi-status", pagesController.getMiStatus);

// Debug: Análisis detallado de menú por página
router.get("/config-pages/debug/menu", pagesController.getDebugMenu);

export default router;
