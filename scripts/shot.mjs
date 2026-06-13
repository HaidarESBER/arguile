import { chromium, devices } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"], hasTouch: true });
const p = await ctx.newPage();
await p.addInitScript(() => {
  localStorage.setItem("nuage_cookie_consent", JSON.stringify({essential:true,analytics:false,marketing:false,timestamp:Date.now()}));
  localStorage.setItem("nuage_age_verified", JSON.stringify({verified:true,timestamp:Date.now()}));
});
const shot=async(u,n,scroll)=>{ await p.goto("http://localhost:3000"+u,{waitUntil:"networkidle"}); await p.waitForTimeout(900); if(scroll){await p.evaluate(s=>window.scrollTo(0,s),scroll); await p.waitForTimeout(500);} await p.screenshot({path:`../screenshots/journey/fix-${n}.png`}); };
await shot("/produits","catalog",560);
await shot("/produits/chicha-crystal-premium","pdp",470);
// seed cart then checkout
await p.goto("http://localhost:3000/produits/charbon-naturel-coco-1kg",{waitUntil:"networkidle"}); await p.waitForTimeout(700);
await p.evaluate(()=>{ const btns=[...document.querySelectorAll("button")].filter(b=>/Ajouter/.test(b.textContent)); if(btns.length) btns[btns.length-1].click(); });
await p.waitForTimeout(700);
await shot("/commande","checkout",0);
// footer overlap on PDP bottom
await p.goto("http://localhost:3000/produits/chicha-crystal-premium",{waitUntil:"networkidle"}); await p.waitForTimeout(700);
await p.evaluate(()=>window.scrollTo(0,100000)); await p.waitForTimeout(700);
await p.screenshot({path:"../screenshots/journey/fix-footer.png"});
await browser.close(); console.log("done");
