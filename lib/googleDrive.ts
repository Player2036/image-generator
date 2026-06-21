import { google } from "googleapis";
import { Readable } from "stream";
import { getRequiredEnvValues } from "./env";
import { getGoogleOAuthClient } from "./googleAuth";

type UploadedDriveFile = {
  id: string;
  webViewLink: string;
  webContentLink: string;
};

export function validateGoogleDriveConfiguration() {
  getRequiredEnvValues([
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REFRESH_TOKEN",
    "GOOGLE_DRIVE_FOLDER_ID",
  ] as const);
}

export async function uploadPngToGoogleDrive(
  png: Buffer,
  fileName: string
): Promise<UploadedDriveFile> {
  const { GOOGLE_DRIVE_FOLDER_ID: folderId } = getRequiredEnvValues([
    "GOOGLE_DRIVE_FOLDER_ID",
  ] as const);

  const auth = getGoogleOAuthClient();

  const drive = google.drive({
    version: "v3",
    auth,
  });

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType: "image/png",
    },
    media: {
      mimeType: "image/png",
      body: Readable.from(png),
    },
    fields: "id, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  const fileId = res.data.id;

  if (!fileId) {
    throw new Error("Google Drive upload did not return a file id");
  }

  return {
    id: fileId,
    webViewLink:
      res.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`,
    webContentLink:
      res.data.webContentLink ??
      `https://drive.google.com/uc?id=${fileId}&export=download`,
  };
}
