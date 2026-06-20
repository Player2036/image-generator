import fs from "fs";
import path from "path";
import { readAssetAsDataUrl } from "./assets";

export function buildCss() {
  const css = fs.readFileSync(
    path.join(process.cwd(), "assets", "styles", "main.css"),
    "utf8"
  );

  return css
    .replaceAll(
      "{{BACKGROUND}}",
      readAssetAsDataUrl("assets/background.png", "image/png")
    )
    .replaceAll(
      "{{MONTSERRAT_EXTRABOLD}}",
      readAssetAsDataUrl(
        "assets/fonts/Montserrat-ExtraBold.ttf",
        "font/ttf"
      )
    )
    .replaceAll(
      "{{INTER_REGULAR}}",
      readAssetAsDataUrl(
        "assets/fonts/Inter_28pt-Regular.ttf",
        "font/ttf"
      )
    );
}