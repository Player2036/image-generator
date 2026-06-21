import fs from "fs";
import path from "path";

export function readAssetAsDataUrl(
  assetPath: string,
  mimeType: string
) {
  const filePath = path.join(process.cwd(), "assets", assetPath);

  const base64 = fs.readFileSync(filePath).toString("base64");

  return `data:${mimeType};base64,${base64}`;
}
