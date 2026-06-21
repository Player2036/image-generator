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
      readAssetAsDataUrl("background.png", "image/png")
    )
    .replaceAll(
      "{{MONTSERRAT_EXTRABOLD}}",
      readAssetAsDataUrl(
        "fonts/Montserrat-ExtraBold.ttf",
        "font/ttf"
      )
    )
    .replaceAll(
      "{{INTER_REGULAR}}",
      readAssetAsDataUrl(
        "fonts/Inter_28pt-Regular.ttf",
        "font/ttf"
      )
    );
}
