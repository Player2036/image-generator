import { chromium, type LaunchOptions, type Page } from "playwright-core";
import chromiumServerless from "@sparticuz/chromium";

const REQUIRED_FONTS = [
  '800 76px "MontserratCustom"',
  '400 32px "InterCustom"',
] as const;

export type RenderDiagnostics = {
  computedFontFamilies: {
    subtitle: string;
    title: string;
  };
  documentFonts: Array<{
    family: string;
    status: string;
    style: string;
    weight: string;
  }>;
  fontChecks: Record<string, boolean>;
  fontFaceRules: Array<{
    family: string;
    hasDataSource: boolean;
    sourceLength: number;
    style: string;
    weight: string;
  }>;
  fontStatus: string;
  navigatorUserAgent: string;
  requests: Array<{
    method: string;
    resourceType: string;
    url: string;
  }>;
  requestFailures: Array<{
    errorText: string;
    resourceType: string;
    url: string;
  }>;
  responses: Array<{
    contentType: string;
    resourceType: string;
    status: number;
    url: string;
  }>;
};

export type RenderHtmlToPngResult = {
  diagnostics?: RenderDiagnostics;
  png: Buffer;
};

type RenderHtmlToPngOptions = {
  debug?: boolean;
};

async function getChromiumLaunchOptions(): Promise<LaunchOptions> {
  if (process.env.VERCEL) {
    const executablePath = await chromiumServerless.executablePath();

    if (!executablePath) {
      throw new Error("Serverless Chromium executable path was not resolved");
    }

    return {
      args: chromiumServerless.args,
      chromiumSandbox: false,
      executablePath,
      headless: true,
    };
  }

  return {
    headless: true,
  };
}

async function waitForRequiredFonts(page: Page) {
  const missingFonts = await page.evaluate(async (fontsToCheck) => {
    await document.fonts.ready;

    return fontsToCheck.filter((font) => !document.fonts.check(font));
  }, [...REQUIRED_FONTS]);

  if (missingFonts.length > 0) {
    throw new Error(`Required fonts failed to load: ${missingFonts.join(", ")}`);
  }
}

async function collectRenderDiagnostics(page: Page): Promise<RenderDiagnostics> {
  return page.evaluate((fontsToCheck) => {
    const fontFaceRules: RenderDiagnostics["fontFaceRules"] = [];

    for (const sheet of [...document.styleSheets]) {
      let rules: CSSRuleList;

      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      for (const rule of [...rules]) {
        if (rule instanceof CSSFontFaceRule) {
          const source = rule.style.getPropertyValue("src");

          fontFaceRules.push({
            family: rule.style.getPropertyValue("font-family"),
            hasDataSource: source.includes("data:font/ttf;base64,"),
            sourceLength: source.length,
            style: rule.style.getPropertyValue("font-style"),
            weight: rule.style.getPropertyValue("font-weight"),
          });
        }
      }
    }

    const title = document.querySelector("h1");
    const subtitle = document.querySelector(".subtitle");

    return {
      computedFontFamilies: {
        subtitle: subtitle ? getComputedStyle(subtitle).fontFamily : "",
        title: title ? getComputedStyle(title).fontFamily : "",
      },
      documentFonts: [...document.fonts].map((font) => ({
        family: font.family,
        status: font.status,
        style: font.style,
        weight: font.weight,
      })),
      fontChecks: Object.fromEntries(
        fontsToCheck.map((font) => [font, document.fonts.check(font)])
      ),
      fontFaceRules,
      fontStatus: document.fonts.status,
      navigatorUserAgent: navigator.userAgent,
      requests: [],
      requestFailures: [],
      responses: [],
    };
  }, [...REQUIRED_FONTS]);
}

function summarizeUrl(url: string) {
  if (url.startsWith("data:")) {
    return `${url.slice(0, 32)}...length=${url.length}`;
  }

  return url;
}

export async function renderHtmlToPng(
  html: string,
  options: RenderHtmlToPngOptions = {}
): Promise<Buffer | RenderHtmlToPngResult> {
  const browser = await chromium.launch(await getChromiumLaunchOptions());
  const requests: RenderDiagnostics["requests"] = [];
  const requestFailures: RenderDiagnostics["requestFailures"] = [];
  const responses: RenderDiagnostics["responses"] = [];

  try {
    const page = await browser.newPage({
      viewport: {
        width: 1080,
        height: 1350,
      },
    });

    if (options.debug) {
      page.on("request", (request) => {
        requests.push({
          method: request.method(),
          resourceType: request.resourceType(),
          url: summarizeUrl(request.url()),
        });
      });

      page.on("response", (response) => {
        responses.push({
          contentType: response.headers()["content-type"] ?? "",
          resourceType: response.request().resourceType(),
          status: response.status(),
          url: summarizeUrl(response.url()),
        });
      });

      page.on("requestfailed", (request) => {
        requestFailures.push({
          errorText: request.failure()?.errorText ?? "unknown",
          resourceType: request.resourceType(),
          url: summarizeUrl(request.url()),
        });
      });
    }

    await page.setContent(html, {
      waitUntil: "load",
    });

    await waitForRequiredFonts(page);

    const png = await page.screenshot({
      type: "png",
    });

    if (!options.debug) {
      return png;
    }

    const diagnostics = await collectRenderDiagnostics(page);
    diagnostics.requests = requests;
    diagnostics.requestFailures = requestFailures;
    diagnostics.responses = responses;

    console.log(
      "render diagnostics",
      JSON.stringify({
        ...diagnostics,
        requests: diagnostics.requests.slice(0, 50),
        responses: diagnostics.responses.slice(0, 50),
      })
    );

    return {
      diagnostics,
      png,
    };
  } finally {
    await browser.close();
  }
}
