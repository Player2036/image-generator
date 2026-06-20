import fs from "fs";
import path from "path";

export function readAssetAsDataUrl(
  relativePath: string,
  mimeType: string
) {
  const filePath = path.join(process.cwd(), relativePath);

  const base64 = fs.readFileSync(filePath).toString("base64");

  return `data:${mimeType};base64,${base64}`;
}