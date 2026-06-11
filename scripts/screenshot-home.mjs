// Dev-only helper: screenshot the running site for visual verification.
import { chromium } from "playwright";

const base = "http://localhost:3000";
const outDir = process.argv[2] || ".";

const browser = await chromium.launch();

async function passAgeGate(page) {
  const btn = page.getByRole("button", { name: /18 ans ou plus/i });
  try {
    await btn.click({ timeout: 5000 });
    await page.waitForTimeout(600);
  } catch {
    // gate not shown (already accepted in this context)
  }
}

async function acceptCookies(page) {
  const btn = page.getByRole("button", { name: /accepter/i }).first();
  try {
    await btn.click({ timeout: 3000 });
    await page.waitForTimeout(600);
  } catch {
    // banner not shown
  }
}

// Desktop, crisp (2x)
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await desktop.goto(base, { waitUntil: "networkidle" });
await passAgeGate(desktop);
await acceptCookies(desktop);
await desktop.waitForTimeout(800);
await desktop.screenshot({ path: `${outDir}/hero.png`, fullPage: false });
await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.35));
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: `${outDir}/mid.png`, fullPage: false });
await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: `${outDir}/bottom.png`, fullPage: false });

// Mobile
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
await mobile.goto(base, { waitUntil: "networkidle" });
await passAgeGate(mobile);
await acceptCookies(mobile);
await mobile.waitForTimeout(800);
await mobile.screenshot({ path: `${outDir}/mobile-hero.png`, fullPage: false });
await mobile.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: `${outDir}/mobile-mid.png`, fullPage: false });

await browser.close();
console.log("Screenshots saved");
