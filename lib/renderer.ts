import { chromium } from "playwright-core";
import chromiumServerless from "@sparticuz/chromium";

export async function renderHtmlToPng(html: string) {
  const isVercel = !!process.env.VERCEL;

  const browser = await chromium.launch(
    isVercel
      ? {
          args: chromiumServerless.args,
          executablePath: await chromiumServerless.executablePath(),
          headless: true,
        }
      : {
          headless: true,
          executablePath: undefined,
        }
  );

  try {
    const page = await browser.newPage({
      viewport: {
        width: 1080,
        height: 1350,
      },
    });

    await page.setContent(html, {
      waitUntil: "networkidle",
    });

    return await page.screenshot({
      type: "png",
    });
  } finally {
    await browser.close();
  }
}