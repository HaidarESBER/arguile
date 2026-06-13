import { chromium, devices } from "playwright";

const out = process.argv[2] || "../screenshots/audit";
const browser = await chromium.launch();

const seed = (page) =>
  page.addInitScript(() => {
    localStorage.setItem("nuage_cookie_consent", JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: Date.now() }));
    localStorage.setItem("nuage_age_verified", "true");
    localStorage.setItem("age-verification", JSON.stringify({ verified: true, timestamp: Date.now() }));
  });

const pages = [
  ["/", "home"],
  ["/produits", "produits"],
  ["/produits/chicha-crystal-premium", "pdp"],
  ["/panier", "panier"],
  ["/commande", "commande"],
  ["/blog", "blog"],
  ["/contact", "contact"],
  ["/suivi", "suivi"],
  ["/about", "about"],
  ["/cgv", "cgv"],
];

async function shoot(label, device, viewport) {
  const ctx = await browser.newContext(device ? { ...device } : { viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await seed(page);
  for (const [path, name] of pages) {
    try {
      // seed cart for cart/checkout pages
      if (path === "/panier" || path === "/commande") {
        await page.goto("http://localhost:3000/produits/chicha-crystal-premium", { waitUntil: "networkidle" });
        try { await page.getByRole("button", { name: /18 ans ou plus/i }).click({ timeout: 2000 }); } catch {}
        try { await page.getByRole("button", { name: /^Ajouter au panier/i }).first().click({ timeout: 3000 }); } catch {}
        await page.waitForTimeout(400);
      }
      await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
      try { await page.getByRole("button", { name: /18 ans ou plus/i }).click({ timeout: 2000 }); } catch {}
      await page.waitForTimeout(1100);
      await page.screenshot({ path: `${out}/${label}-${name}.png`, fullPage: true });
    } catch (e) {
      console.log(`${label}-${name} FAILED: ${e.message.slice(0, 60)}`);
    }
  }
  await ctx.close();
}

await shoot("m", devices["iPhone 13"]);
await shoot("d", null, { width: 1440, height: 900 });

await browser.close();
console.log("done");
