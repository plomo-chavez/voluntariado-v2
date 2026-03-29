import express from "express";
import catalogoController from "../controllers/catalogoController.js";

const router = express.Router();

// Catálogos
router.post(
  "/catalogo/:catalogo",
  (req, res) => catalogoController.getData(req, res, false)
);

router.post(
  "/catalogo/:catalogo/get",
  (req, res) => catalogoController.getData(req, res, true)
);

router.post(
  "/catalogo/:catalogo/eliminar",
  catalogoController.delete
);

router.post(
  "/catalogo/:catalogo/eliminar/soft",
  catalogoController.deleteSoftData
);

export default router;
