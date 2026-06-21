import fs from "fs";
import path from "path";

export function readAssetAsDataUrl(
  assetPath: string,
  mimeType: string
) {
  const assetsRoot = path.join(process.cwd(), "assets");
  const filePath = path.resolve(assetsRoot, assetPath);

  if (!filePath.startsWith(`${assetsRoot}${path.sep}`)) {
    throw new Error(`Asset path escapes assets directory: ${assetPath}`);
  }

  const base64 = fs.readFileSync(filePath).toString("base64");

  return `data:${mimeType};base64,${base64}`;
}
