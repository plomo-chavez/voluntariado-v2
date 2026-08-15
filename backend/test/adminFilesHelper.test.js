import assert from "node:assert/strict";
import test from "node:test";

import {
  getDocumentStoragePath,
  validateUploadedFile,
} from "../utils/adminFilesHelper.js";

test("validateUploadedFile acepta formatos permitidos", () => {
  const result = validateUploadedFile(
    {
      originalname: "cedula.pdf",
      mimetype: "application/pdf",
      size: 250000,
    },
    { allowedFormats: ["pdf", "jpg", "png"] },
  );

  assert.equal(result.valid, true);
  assert.equal(result.extension, "pdf");
});

test("validateUploadedFile rechaza formatos no permitidos", () => {
  const result = validateUploadedFile(
    {
      originalname: "archivo.exe",
      mimetype: "application/x-msdownload",
      size: 250000,
    },
    { allowedFormats: ["pdf", "jpg", "png"] },
  );

  assert.equal(result.valid, false);
  assert.match(result.error, /no está permitido/i);
});

test("getDocumentStoragePath arma una ruta consistente para el voluntario", () => {
  const result = getDocumentStoragePath({
    volunteerId: 42,
    documentType: "identificacion",
  });

  assert.match(result, /voluntarios[\\/]+42[\\/]+identificacion/);
});
