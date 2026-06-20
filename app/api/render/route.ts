import { NextRequest } from "next/server";
import { buildHtml } from "@/lib/template";
import { renderHtmlToPng } from "@/lib/renderer";
import { uploadPngToGoogleDrive } from "@/lib/googleDrive";
import type { RenderRequest } from "@/types/render";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RenderRequest;

    const html = buildHtml(body);
    const png = await renderHtmlToPng(html);

    const fileName = `image-${Date.now()}.png`;
    const uploadedFile = await uploadPngToGoogleDrive(png, fileName);

    return Response.json({
      success: true,
      fileId: uploadedFile.id,
      viewLink: uploadedFile.webViewLink,
      downloadLink: uploadedFile.webContentLink,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}