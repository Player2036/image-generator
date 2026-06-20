import { chromium } from "playwright";

export async function renderHtmlToPng(html: string) {
  const browser = await chromium.launch({
    headless: true,
  });

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

    const png = await page.screenshot({
      type: "png",
    });

    return png;
  } finally {
    await browser.close();
  }
}