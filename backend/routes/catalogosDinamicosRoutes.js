import express from "express";

import catalogosController from "../controllers/catalogosController.js";

const router = express.Router();

router.post("/catalogos/:catalogo", (req, res) => {
  const { catalogo } = req.params;
  catalogosController.getCatalogo(req, res, catalogo);
});

export default router;
