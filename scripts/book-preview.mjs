import { chromium } from "playwright";
const browser = await chromium.launch();
// A4 at ~96dpi = 794x1123; use 2x for crisp preview
const p = await browser.newPage({ viewport:{width:794,height:1123}, deviceScaleFactor:2 });
await p.goto("file:///C:/Users/haida/chicha/book/book.html",{waitUntil:"networkidle"});
await p.waitForTimeout(2500);
const pages = await p.locator("section.page").all();
// cover (0), accueil (1), produit (3)
for (const [i,name] of [[0,"cover"],[1,"sec-accueil"],[3,"sec-produit"]]) {
  await pages[i].scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await pages[i].screenshot({ path:`../screenshots/book-${name}.png` });
}
await browser.close(); console.log("previews done");
