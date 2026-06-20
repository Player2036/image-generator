import { google } from "googleapis";
import { Readable } from "stream";
import { getGoogleOAuthClient } from "./googleAuth";

export async function uploadPngToGoogleDrive(
  png: Buffer,
  fileName: string
) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is missing");
  }

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
  });

  return res.data;
}