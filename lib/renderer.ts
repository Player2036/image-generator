import { chromium, type LaunchOptions } from "playwright-core";
import chromiumServerless from "@sparticuz/chromium";

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

    return await page.screenshot({
      type: "png",
    });
  } finally {
    await browser.close();
  }
}
