import fs from "fs";
import path from "path";

export type AssetDataUrl = {
  byteLength: number;
  dataUrl: string;
  mimeType: string;
  path: string;
};

export function readAsset(
  assetPath: string,
  mimeType: string
): AssetDataUrl {
  const assetsRoot = path.join(process.cwd(), "assets");
  const filePath = path.resolve(assetsRoot, assetPath);

  if (!filePath.startsWith(`${assetsRoot}${path.sep}`)) {
    throw new Error(`Asset path escapes assets directory: ${assetPath}`);
  }

  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString("base64");

  return {
    byteLength: buffer.byteLength,
    dataUrl: `data:${mimeType};base64,${base64}`,
    mimeType,
    path: assetPath,
  };
}

export function readAssetAsDataUrl(
  assetPath: string,
  mimeType: string
) {
  return readAsset(assetPath, mimeType).dataUrl;
}
