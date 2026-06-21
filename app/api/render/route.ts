import { NextRequest } from "next/server";
import { buildHtml } from "@/lib/template";
import { renderHtmlToPng } from "@/lib/renderer";
import {
  uploadPngToGoogleDrive,
  validateGoogleDriveConfiguration,
} from "@/lib/googleDrive";
import { MissingEnvironmentVariablesError } from "@/lib/env";
import type { RenderRequest } from "@/types/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

class BadRequestError extends Error {
  readonly status = 400;
  readonly code = "BAD_REQUEST";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readRenderRequest(req: NextRequest): Promise<RenderRequest> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Request body must be valid JSON");
  }

  if (!isRecord(body)) {
    throw new BadRequestError("Request body must be a JSON object");
  }

  const renderRequest: RenderRequest = {};

  if (body.title !== undefined) {
    if (!Array.isArray(body.title)) {
      throw new BadRequestError("title must be an array");
    }

    renderRequest.title = body.title.map((line) => {
      if (!isRecord(line) || typeof line.text !== "string") {
        throw new BadRequestError("each title line must contain text");
      }

      return {
        text: line.text,
        accent: typeof line.accent === "boolean" ? line.accent : undefined,
      };
    });
  }

  if (body.subtitle !== undefined) {
    if (typeof body.subtitle !== "string") {
      throw new BadRequestError("subtitle must be a string");
    }

    renderRequest.subtitle = body.subtitle;
  }

  return renderRequest;
}

function errorResponse(status: number, code: string, message: string) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

export function GET() {
  return Response.json(
    {
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST /api/render with a JSON request body.",
      },
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    validateGoogleDriveConfiguration();

    const body = await readRenderRequest(req);

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
    console.error("POST /api/render failed", error);

    if (error instanceof BadRequestError) {
      return errorResponse(error.status, error.code, error.message);
    }

    if (error instanceof MissingEnvironmentVariablesError) {
      return Response.json(
        {
          success: false,
          error: {
            code: "MISSING_ENVIRONMENT_VARIABLES",
            message:
              "Server is missing required environment variables for Google Drive upload.",
            missing: error.missing,
          },
        },
        { status: 500 }
      );
    }

    return errorResponse(
      500,
      "RENDER_FAILED",
      "Failed to render and upload image."
    );
  }
}
