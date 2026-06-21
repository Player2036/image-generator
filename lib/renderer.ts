import { chromium, type LaunchOptions, type Page } from "playwright-core";
import chromiumServerless from "@sparticuz/chromium";

const REQUIRED_FONTS = [
  '800 76px "MontserratCustom"',
  '400 32px "InterCustom"',
] as const;

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

export async function renderHtmlToPng(html: string) {
  const browser = await chromium.launch(await getChromiumLaunchOptions());

  try {
    const page = await browser.newPage({
      viewport: {
        width: 1080,
        height: 1350,
      },
    });

    await page.setContent(html, {
      waitUntil: "load",
    });

    await waitForRequiredFonts(page);

    return await page.screenshot({
      type: "png",
    });
  } finally {
    await browser.close();
  }
}
