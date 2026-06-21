import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const generateTestPDF = async () => {
  let browser;
  try {
    // Ruta del template
    const templatePath = path.join(
      "/Users/plomochavez/Documents/GitHub/cruzRoja/vol/backend/assets",
      "caratula-template.html",
    );

    // Leer el template
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");

    // Datos de prueba
    const testData = {
      id_voluntario: "12345",
      nombre: "Juan",
      segundo_nombre: "Pablo",
      primer_apellido: "García",
      segundo_apellido: "López",
      puesto: "Coordinador Regional",
      coordinacion: "Centro",
      delegacion: "CDMX",
      telefono: "5555123456",
      correo: "juan@example.com",
    };

    // Reemplazar placeholders
    htmlTemplate = htmlTemplate.replace(/{{\s*([\w_-]+)\s*}}/g, (_, key) => {
      const value = testData[key];
      return typeof value === "undefined" || value === null
        ? ""
        : String(value);
    });

    // Generar PDF
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: "networkidle2" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    // Guardar el PDF
    const outputPath =
      "/Users/plomochavez/Documents/GitHub/cruzRoja/vol/backend/assets/pruebas/test-caratula.pdf";
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`✅ PDF generado en: ${outputPath}`);
    console.log(
      `📄 Tamaño del PDF: ${(pdfBuffer.length / 1024).toFixed(2)} KB`,
    );
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

generateTestPDF();
