import { chromium, devices } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"], hasTouch: true });
const p = await ctx.newPage();
const out = "../screenshots/journey";
const shot = async (n) => { await p.waitForTimeout(700); await p.screenshot({ path: `${out}/${n}.png` }); };

// 1. Land — age gate should appear
await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
await p.waitForTimeout(1000);
await shot("01-landing-agegate");
// pass age gate
try { await p.getByRole("button", { name: /18 ans ou plus/i }).click({ timeout: 4000 }); } catch {}
await p.waitForTimeout(800);
await shot("02-home-cookie");
// accept cookies
try { await p.getByRole("button", { name: /^Accepter/i }).first().click({ timeout: 3000 }); } catch {}
await shot("03-home-hero");
// scroll the home
await p.evaluate(() => window.scrollTo(0, 700)); await shot("04-home-mid");
// open mobile menu
try { await p.getByRole("button", { name: /Ouvrir le menu/i }).click({ timeout: 3000 }); await shot("05-menu"); await p.keyboard.press("Escape"); } catch { console.log("menu fail"); }
// open search
try { await p.getByRole("button", { name: "Rechercher", exact: true }).click({ timeout: 3000 }); await p.waitForTimeout(500); await p.getByLabel("Rechercher des produits").fill("chicha"); await p.waitForTimeout(1200); await shot("06-search"); await p.keyboard.press("Escape"); } catch { console.log("search fail"); }
// go to products
await p.goto("http://localhost:3000/produits", { waitUntil: "networkidle" }); await shot("07-catalog");
// tap a product
try { await p.locator("a[href^='/produits/']").first().click({ timeout: 4000 }); await p.waitForTimeout(1200); } catch { await p.goto("http://localhost:3000/produits/chicha-crystal-premium", { waitUntil:"networkidle" }); }
await shot("08-pdp-top");
await p.evaluate(() => window.scrollTo(0, 500)); await shot("09-pdp-mid");
// add to cart via sticky bar
try { await p.getByRole("button", { name: /^Ajouter$/ }).first().click({ timeout: 3000 }); } catch {}
await p.waitForTimeout(800); await shot("10-pdp-added");
// go to cart
await p.goto("http://localhost:3000/panier", { waitUntil: "networkidle" }); await shot("11-cart");
// checkout
try { await p.getByRole("link", { name: /Commander|Finaliser|Procéder|paiement/i }).first().click({ timeout: 3000 }); } catch { await p.goto("http://localhost:3000/commande", { waitUntil:"networkidle" }); }
await p.waitForTimeout(1200); await shot("12-checkout-top");
await p.evaluate(() => window.scrollTo(0, 900)); await shot("13-checkout-mid");
await p.evaluate(() => window.scrollTo(0, 100000)); await shot("14-checkout-bottom");
await browser.close(); console.log("journey done");
