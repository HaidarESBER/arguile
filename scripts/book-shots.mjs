import { chromium } from "playwright";
const browser = await chromium.launch();
const OUT = "../book/img";
const seed = (p) => p.addInitScript(() => {
  localStorage.setItem("nuage_cookie_consent", JSON.stringify({essential:true,analytics:false,marketing:false,timestamp:Date.now()}));
  localStorage.setItem("nuage_age_verified", JSON.stringify({verified:true,timestamp:Date.now()}));
});
// iPhone 16: 393x852 @ dpr 3
const iphone = { viewport:{width:393,height:852}, deviceScaleFactor:3, isMobile:true, hasTouch:true, userAgent:"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" };

async function capture(label, path, opts={}) {
  // desktop
  const dctx = await browser.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
  const dp = await dctx.newPage(); await seed(dp);
  if (opts.seedCart) { await dp.goto("http://localhost:3000/produits/charbon-naturel-coco-1kg",{waitUntil:"networkidle"}); await dp.waitForTimeout(700); await dp.evaluate(()=>{const b=[...document.querySelectorAll("button")].filter(x=>/Ajouter/.test(x.textContent)); if(b.length)b[b.length-1].click();}); await dp.waitForTimeout(500); }
  await dp.goto("http://localhost:3000"+path,{waitUntil:"networkidle"}); await dp.waitForTimeout(1300);
  await dp.screenshot({ path:`${OUT}/${label}-desktop.png` });
  await dctx.close();
  // iphone
  const mctx = await browser.newContext(iphone);
  const mp = await mctx.newPage(); await seed(mp);
  if (opts.seedCart) { await mp.goto("http://localhost:3000/produits/charbon-naturel-coco-1kg",{waitUntil:"networkidle"}); await mp.waitForTimeout(700); await mp.evaluate(()=>{const b=[...document.querySelectorAll("button")].filter(x=>/Ajouter/.test(x.textContent)); if(b.length)b[b.length-1].click();}); await mp.waitForTimeout(500); }
  await mp.goto("http://localhost:3000"+path,{waitUntil:"networkidle"}); await mp.waitForTimeout(1300);
  await mp.screenshot({ path:`${OUT}/${label}-mobile.png` });
  await mctx.close();
  console.log("captured", label);
}

await capture("accueil","/");
await capture("boutique","/produits");
await capture("produit","/produits/chicha-crystal-premium");
await capture("panier","/panier",{seedCart:true});
await capture("commande","/commande",{seedCart:true});
await capture("journal","/blog");
await capture("histoire","/about");
await capture("contact","/contact");
await browser.close();
console.log("ALL DONE");
