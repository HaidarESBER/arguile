import { chromium } from "playwright";
const browser = await chromium.launch();
const OUT = "../book/img";
const seed = (p) => p.addInitScript(() => {
  localStorage.setItem("nuage_cookie_consent", JSON.stringify({essential:true,analytics:false,marketing:false,timestamp:Date.now()}));
  localStorage.setItem("nuage_age_verified", JSON.stringify({verified:true,timestamp:Date.now()}));
});
// iPad Air portrait 820x1180 @2x, touch
const ipad = { viewport:{width:820,height:1180}, deviceScaleFactor:2, isMobile:false, hasTouch:true };
const pages = [
  ["accueil","/"],["boutique","/produits"],["produit","/produits/chicha-crystal-premium"],
  ["panier","/panier",true],["commande","/commande",true],["journal","/blog"],
  ["histoire","/about"],["contact","/contact"],
];
for (const [label,path,seedCart] of pages) {
  const ctx = await browser.newContext(ipad);
  const p = await ctx.newPage(); await seed(p);
  if (seedCart) { await p.goto("http://localhost:3000/produits/charbon-naturel-coco-1kg",{waitUntil:"networkidle"}); await p.waitForTimeout(700); await p.evaluate(()=>{const b=[...document.querySelectorAll("button")].filter(x=>/Ajouter/.test(x.textContent)); if(b.length)b[b.length-1].click();}); await p.waitForTimeout(500); }
  await p.goto("http://localhost:3000"+path,{waitUntil:"networkidle"}); await p.waitForTimeout(1300);
  await p.screenshot({ path:`${OUT}/${label}-tablet.png` });
  await ctx.close();
  console.log("tablet", label);
}
await browser.close(); console.log("DONE");
