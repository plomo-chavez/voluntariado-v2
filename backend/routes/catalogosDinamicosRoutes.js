import express from "express";

import catalogosController from "../controllers/catalogosController.js";
import tokenMiddleware from "../middleware/tokenMiddleware.js";

const router = express.Router();

router.post("/catalogos/:catalogo",tokenMiddleware, (req, res) => {
  const { catalogo } = req.params;
  catalogosController.getCatalogo(req, res, catalogo);
});

export default router;
