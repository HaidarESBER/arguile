// Dev-only helper: mobile screenshots of key pages.
import { chromium } from "playwright";

const base = "http://localhost:3000";
const outDir = process.argv[2] || ".";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});

const page = await ctx.newPage();
await page.goto(base, { waitUntil: "networkidle" });
try { await page.getByRole("button", { name: /18 ans ou plus/i }).click({ timeout: 4000 }); } catch {}
try { await page.getByRole("button", { name: /accepter/i }).first().click({ timeout: 3000 }); } catch {}
await page.waitForTimeout(500);

const shots = [
  ["/produits", "m-produits"],
  ["/panier", "m-panier"],
  ["/contact", "m-contact"],
  ["/compte", "m-compte"],
  ["/blog", "m-blog"],
  ["/suivi", "m-suivi"],
];

for (const [path, name] of shots) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
}

// Mobile menu open (hamburger)
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
try {
  const burger = page.locator("header button").last();
  await burger.click({ timeout: 4000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${outDir}/m-menu.png`, fullPage: false });
} catch (e) {
  console.log("menu open failed:", e.message);
}

await browser.close();
console.log("done");
