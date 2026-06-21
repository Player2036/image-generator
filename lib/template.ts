import fs from "fs";
import path from "path";
import { readAssetAsDataUrl } from "./assets";
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

export function buildHtml(data: RenderRequest) {
  const titleHtml = renderTitle(data.title);
  const subtitle = escapeHtml(data.subtitle ?? "");

  const template = fs.readFileSync(
    path.join(process.cwd(), "templates", "simple.html"),
    "utf8"
  );

  const logoDataUrl = readAssetAsDataUrl("logo.png", "image/png");

  const css = fs
    .readFileSync(
      path.join(process.cwd(), "assets", "styles", "main.css"),
      "utf8"
    )
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
    .replaceAll("{{LOGO}}", logoDataUrl)
    .replaceAll("{{TITLE}}", titleHtml)
    .replaceAll("{{SUBTITLE}}", subtitle);
}
