import fs from "fs";
import path from "path";
import { chromium } from "playwright-core";

const outputPath = process.argv[2] ?? "cyrillic-render-check.png";

function readAssetAsDataUrl(assetPath, mimeType) {
  const filePath = path.join(process.cwd(), "assets", assetPath);
  const base64 = fs.readFileSync(filePath).toString("base64");

  return `data:${mimeType};base64,${base64}`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildVerificationHtml() {
  const title = [
    { text: "Ваш бизнес" },
    { text: "теряет клиентов", accent: true },
    { text: "пока вы" },
    { text: "не отвечаете" },
  ]
    .map((line) => {
      const text = escapeHtml(line.text);

      return line.accent ? `<span class="accent">${text}</span>` : text;
    })
    .join("<br>");

  const template = fs.readFileSync(
    path.join(process.cwd(), "templates", "simple.html"),
    "utf8"
  );

  const css = fs
    .readFileSync(path.join(process.cwd(), "assets", "styles", "main.css"), "utf8")
    .replaceAll(
      "{{BACKGROUND}}",
      readAssetAsDataUrl("background.png", "image/png")
    )
    .replaceAll(
      "{{MONTSERRAT_EXTRABOLD}}",
      readAssetAsDataUrl("fonts/Montserrat-ExtraBold.ttf", "font/ttf")
    )
    .replaceAll(
      "{{INTER_REGULAR}}",
      readAssetAsDataUrl("fonts/Inter_28pt-Regular.ttf", "font/ttf")
    );

  return template
    .replaceAll("{{CSS}}", css)
    .replaceAll("{{LOGO}}", readAssetAsDataUrl("logo.png", "image/png"))
    .replaceAll("{{TITLE}}", title)
    .replaceAll("{{SUBTITLE}}", "AI Voice Agent отвечает за вас 24/7");
}

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: {
      width: 1080,
      height: 1350,
    },
  });

  await page.setContent(buildVerificationHtml(), {
    waitUntil: "load",
  });

  const fontStatus = await page.evaluate(async () => {
    await document.fonts.ready;

    return [...document.fonts].map((font) => ({
      family: font.family,
      status: font.status,
      weight: font.weight,
    }));
  });

  const missingFonts = fontStatus.filter((font) => font.status !== "loaded");

  if (missingFonts.length > 0) {
    throw new Error(`Fonts failed to load: ${JSON.stringify(missingFonts)}`);
  }

  await page.screenshot({
    path: outputPath,
    type: "png",
  });

  console.log(`Saved ${outputPath}`);
  console.log(JSON.stringify(fontStatus));
} finally {
  await browser.close();
}
