import fs from "fs";
import path from "path";
import { readAsset, type AssetDataUrl } from "./assets";
import type { RenderRequest, TitleLine } from "@/types/render";

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTitle(title?: TitleLine[]) {
  if (!Array.isArray(title)) {
    return "";
  }

  return title
    .map((line) => {
      const text = escapeHtml(line.text);

      if (line.accent) {
        return `<span class="accent">${text}</span>`;
      }

      return text;
    })
    .join("<br>");
}

type TemplateDiagnostics = {
  assetBytes: Record<string, number>;
  containsFontFace: boolean;
  containsUtf8Meta: boolean;
  cssLength: number;
  htmlLength: number;
};

function collectAssetBytes(assets: AssetDataUrl[]) {
  return Object.fromEntries(
    assets.map((asset) => [asset.path, asset.byteLength])
  );
}

export function buildHtmlWithDiagnostics(data: RenderRequest) {
  const titleHtml = renderTitle(data.title);
  const subtitle = escapeHtml(data.subtitle ?? "");

  const template = fs.readFileSync(
    path.join(process.cwd(), "templates", "simple.html"),
    "utf8"
  );

  const logo = readAsset("logo.png", "image/png");
  const background = readAsset("background.png", "image/png");
  const montserratExtraBold = readAsset(
    "fonts/Montserrat-ExtraBold.ttf",
    "font/ttf"
  );
  const interRegular = readAsset("fonts/Inter_28pt-Regular.ttf", "font/ttf");

  const css = fs
    .readFileSync(
      path.join(process.cwd(), "assets", "styles", "main.css"),
      "utf8"
    )
    .replaceAll(
      "{{BACKGROUND}}",
      background.dataUrl
    )
    .replaceAll(
      "{{MONTSERRAT_EXTRABOLD}}",
      montserratExtraBold.dataUrl
    )
    .replaceAll(
      "{{INTER_REGULAR}}",
      interRegular.dataUrl
    );

  const html = template
    .replaceAll("{{CSS}}", css)
    .replaceAll("{{LOGO}}", logo.dataUrl)
    .replaceAll("{{TITLE}}", titleHtml)
    .replaceAll("{{SUBTITLE}}", subtitle);

  const diagnostics: TemplateDiagnostics = {
    assetBytes: collectAssetBytes([
      logo,
      background,
      montserratExtraBold,
      interRegular,
    ]),
    containsFontFace: css.includes("@font-face"),
    containsUtf8Meta: html.includes('charset="UTF-8"'),
    cssLength: css.length,
    htmlLength: html.length,
  };

  return {
    diagnostics,
    html,
  };
}

export function buildHtml(data: RenderRequest) {
  return buildHtmlWithDiagnostics(data).html;
}
