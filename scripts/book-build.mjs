import { chromium } from "playwright";
import { writeFileSync, existsSync } from "fs";

// ----------------------------------------------------------------------------
// Self-contained generator for the Nuage site preview book.
// Produces ../book/book.html (full document) and ../book/Nuage-Apercu-du-site.pdf
// Re-runnable: the HTML is built from scratch here, not patched in place.
// Each section shows a Desktop + iPad tablet + iPhone trio (falls back to
// Desktop + iPhone when a tablet screenshot is missing).
// Device frames use soft brand taupe + a thin gold hairline and NO blurred
// box-shadows — mobile PDF viewers (iOS Books/Quick Look) rasterize big
// blurred shadows as hard dark rectangles ("black windows"), so we avoid them.
// The Playwright PDF embeds all fonts and images, so it is fully portable
// for email — it renders identically on any device.
// ----------------------------------------------------------------------------

const IMG = "../book/img";
const hasTablet = (label) => existsSync(`${IMG}/${label}-tablet.png`);

const sections = [
  {
    n: "01", title: "Accueil", url: "chichanuage.com", label: "accueil",
    caption: "La vitrine de la marque : une vidéo immersive en plein écran, la sélection des meilleures ventes et l'histoire des fondateurs, portées par une direction artistique soignée.",
    features: [
      ["Hero vidéo immersif", "Une mise en scène plein écran dès l'arrivée."],
      ["Meilleures ventes", "Les produits phares mis en avant automatiquement."],
      ["Réassurance", "Livraison, paiement sécurisé et SAV affichés clairement."],
    ],
  },
  {
    n: "02", title: "Boutique", url: "chichanuage.com/produits", label: "boutique",
    caption: "Le catalogue complet, avec filtres par catégorie et par prix, tri dynamique et recherche instantanée pour trouver le produit idéal en quelques secondes.",
    features: [
      ["Filtres & tri", "Par catégorie, prix et popularité."],
      ["Recherche instantanée", "Des résultats en temps réel à la frappe."],
      ["Badges produits", "Promotions et niveaux de stock visibles d'un coup d'œil."],
    ],
  },
  {
    n: "03", title: "Fiche produit", url: "chichanuage.com/produits/chicha-crystal-premium", label: "produit",
    caption: "Galerie d'images interactive, description détaillée, caractéristiques techniques et avis clients vérifiés — avec un bouton d'achat toujours accessible.",
    features: [
      ["Galerie interactive", "Zoom et défilement tactile des visuels."],
      ["Avis vérifiés", "La confiance des clients mise en évidence."],
      ["Achat en un geste", "Un bouton d'ajout au panier persistant."],
    ],
  },
  {
    n: "04", title: "Panier", url: "chichanuage.com/panier", label: "panier",
    caption: "Un récapitulatif clair, la modification des quantités et la livraison offerte dès 50 € matérialisée par une barre de progression motivante.",
    features: [
      ["Livraison offerte dès 50 €", "Une barre de progression incitative."],
      ["Quantités modifiables", "La mise à jour du total est instantanée."],
      ["Codes promo", "Des réductions appliquées en un clic."],
    ],
  },
  {
    n: "05", title: "Commande", url: "chichanuage.com/commande", label: "commande",
    caption: "Un parcours de paiement fluide : commande en tant qu'invité, paiement 100 % sécurisé via Stripe et confirmation immédiate par e-mail.",
    features: [
      ["Paiement Stripe", "Des transactions chiffrées et certifiées."],
      ["Checkout invité", "Aucune création de compte requise."],
      ["Confirmation e-mail", "Un récapitulatif envoyé instantanément."],
    ],
  },
  {
    n: "06", title: "Le Journal", url: "chichanuage.com/blog", label: "journal",
    caption: "Guides d'achat, conseils d'entretien et culture de la chicha : un contenu éditorial riche qui informe les passionnés et nourrit le référencement.",
    features: [
      ["Guides d'experts", "Préparation, entretien et astuces."],
      ["Culture chicha", "Histoire et art de vivre autour du narguilé."],
      ["Articles illustrés", "Une lecture soignée et visuelle."],
    ],
  },
  {
    n: "07", title: "Notre histoire", url: "chichanuage.com/about", label: "histoire",
    caption: "Le récit de deux frères, du Liban à l'Europe : une marque née d'une passion familiale et d'une exigence de qualité sans compromis.",
    features: [
      ["Deux frères, une passion", "L'histoire à l'origine de Nuage."],
      ["Du Liban à l'Europe", "Un héritage et un savoir-faire transmis."],
      ["Sélection exigeante", "Des produits choisis un à un avec soin."],
    ],
  },
  {
    n: "08", title: "Contact", url: "chichanuage.com/contact", label: "contact",
    caption: "Une équipe disponible et réactive : un formulaire simple, une réponse sous 24 à 48 h et un support dédié pour accompagner chaque client.",
    features: [
      ["Formulaire simple", "Une question, une réponse rapide."],
      ["Réponse sous 24–48 h", "Un suivi attentif et humain."],
      ["Support dédié", "Une équipe à votre écoute."],
    ],
  },
];

const total = sections.length;

const featureList = (features) => `
      <ul class="features">
        ${features.map(([h, d]) => `<li><span class="fdot"></span><div><b>${h}</b><span>${d}</span></div></li>`).join("\n        ")}
      </ul>`;

const deviceTrio = (s) => {
  const tablet = hasTablet(s.label)
    ? `
        <figure class="tablet">
          <div class="ipad"><span class="cam"></span><div class="screen"><img src="./img/${s.label}-tablet.png" alt="${s.title} tablette" /></div></div>
          <figcaption>Tablette</figcaption>
        </figure>`
    : "";
  return `
    <div class="mockups${tablet ? "" : " no-tablet"}">
      <figure class="browser">
        <div class="bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span><span class="url">${s.url}</span></div>
        <img src="./img/${s.label}-desktop.png" alt="${s.title} desktop" />
        <figcaption>Desktop</figcaption>
      </figure>
      <div class="devices">${tablet}
        <figure class="phone">
          <div class="frame"><span class="island"></span><div class="screen"><img src="./img/${s.label}-mobile.png" alt="${s.title} mobile" /></div></div>
          <figcaption>Mobile</figcaption>
        </figure>
      </div>
    </div>`;
};

const sectionPages = sections.map((s) => `
  <section class="page">
    <div class="eyebrow">${s.n} &nbsp;·&nbsp; ${s.title}</div>
    <h2 class="title serif">${s.title}</h2>
    <p class="caption">${s.caption}</p>
    ${featureList(s.features)}
    <div class="hr"></div>
    ${deviceTrio(s)}
    <div class="pagenum"><span>Nuage — Aperçu du site</span><span>${s.n} / ${String(total).padStart(2, "0")}</span></div>
  </section>`).join("\n");

const tocRows = sections.map((s) => `
        <li><span class="toc-n">${s.n}</span><span class="toc-t serif">${s.title}</span><span class="toc-dots"></span><span class="toc-u">${s.url}</span></li>`).join("");

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Nuage — Aperçu du site</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Space+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --taupe:#2b251f; --taupe2:#211c17; --card:#37312a; --gold:#d4af37;
    --gold2:#b8941f; --cream:#e8dfd5; --muted:#a89985; --line:rgba(232,223,213,.12);
    /* soft taupe device frames + thin gold hairline (no pure-black bezels, no blurred shadows) */
    --frame:#1a1510; --frame2:#15110c; --goldline:rgba(212,175,55,.42); --island:#0c0a07;
  }
  *{box-sizing:border-box; margin:0; padding:0;}
  @page{ size:A4; margin:0; }
  html,body{ background:var(--taupe); color:var(--cream);
    font-family:"Space Grotesk", -apple-system, system-ui, sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .serif{ font-family:"Cormorant Garamond", Georgia, serif; }

  .page{
    width:210mm; height:297mm; padding:20mm 18mm; position:relative;
    page-break-after:always; overflow:hidden;
    background:radial-gradient(120% 80% at 50% -10%, #342d24 0%, var(--taupe) 55%, var(--taupe2) 100%);
  }
  .page:last-child{ page-break-after:auto; }

  /* ---------- Cover ---------- */
  .cover{ display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
  .cover .rule{ width:60px; height:2px; background:var(--gold); margin:0 auto 30px; }
  .cover .brand{ font-size:104px; font-weight:600; letter-spacing:.18em; color:var(--cream);
    line-height:1; margin-right:-.18em; }
  .cover .tag{ font-style:italic; font-size:30px; color:var(--gold); margin-top:14px; }
  .cover .sub{ margin-top:54px; font-size:13px; letter-spacing:.32em; text-transform:uppercase; color:var(--muted); }
  .cover .meta{ position:absolute; bottom:26mm; left:0; right:0; text-align:center;
    font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:var(--muted); }
  .cover .smoke{ position:absolute; inset:0; opacity:.06;
    background:radial-gradient(50% 40% at 50% 30%, #fff 0%, transparent 70%); }

  /* ---------- Sommaire ---------- */
  .lead{ font-size:16px; line-height:1.7; color:var(--cream); max-width:88%; margin-top:14px; }
  .lead b{ color:var(--gold); font-weight:500; }
  .stats{ display:flex; gap:34px; margin-top:30px; }
  .stats .s b{ display:block; font-family:"Cormorant Garamond",serif; font-size:40px; color:var(--gold); line-height:1; }
  .stats .s span{ font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); }
  .toc{ list-style:none; margin-top:40px; }
  .toc li{ display:flex; align-items:baseline; gap:14px; padding:13px 0; border-bottom:1px solid var(--line); }
  .toc-n{ font-size:12px; letter-spacing:.2em; color:var(--gold); width:30px; }
  .toc-t{ font-size:23px; color:var(--cream); }
  .toc-dots{ flex:1; border-bottom:1px dotted rgba(232,223,213,.2); transform:translateY(-4px); }
  .toc-u{ font-size:11px; letter-spacing:.12em; color:var(--muted); }

  /* ---------- Section header ---------- */
  .eyebrow{ font-size:12px; letter-spacing:.34em; text-transform:uppercase; color:var(--gold); margin-bottom:10px; }
  .title{ font-size:52px; font-weight:600; line-height:1.02; color:var(--cream); }
  .caption{ font-size:14.5px; color:var(--muted); margin-top:12px; max-width:88%; line-height:1.6; }
  .hr{ height:1px; background:var(--line); margin:18px 0 0; }

  /* ---------- Feature bullets ---------- */
  .features{ list-style:none; display:flex; gap:20px; margin-top:18px; }
  .features li{ flex:1; display:flex; gap:9px; align-items:flex-start; }
  .features .fdot{ width:7px; height:7px; border-radius:50%; background:var(--gold); margin-top:6px; flex:none; }
  .features b{ display:block; font-size:12.5px; font-weight:500; color:var(--cream); line-height:1.3; }
  .features span{ display:block; font-size:11px; color:var(--muted); line-height:1.45; margin-top:3px; }

  /* ---------- Device showcase ---------- */
  .mockups{ position:relative; margin-top:26px; height:176mm; }
  figure{ position:relative; }
  figcaption{ text-align:center; font-size:10px; letter-spacing:.26em; text-transform:uppercase; color:var(--muted); margin-top:10px; }

  /* No box-shadows anywhere: a thin gold hairline + the frame fill give depth
     without the dark rectangles mobile PDF viewers produce from blurred shadows. */
  .browser{ position:absolute; top:0; left:50%; transform:translateX(-50%); width:74%;
    border-radius:11px; overflow:hidden; border:1px solid var(--goldline); background:var(--frame); }
  .browser figcaption{ position:absolute; left:0; right:0; bottom:-26px; }
  .browser .bar{ height:30px; display:flex; align-items:center; gap:7px; padding:0 13px;
    background:var(--frame2); border-bottom:1px solid var(--line); }
  .browser .bar .d{ width:9px; height:9px; border-radius:50%; opacity:.85; }
  .browser .bar .d1{ background:#c0573f; } .browser .bar .d2{ background:#caa23c; } .browser .bar .d3{ background:#5a8f5a; }
  .browser .bar .url{ margin-left:10px; flex:1; height:17px; border-radius:9px; background:rgba(20,16,12,.32);
    display:flex; align-items:center; padding:0 12px; font-size:9px; color:var(--muted); letter-spacing:.04em; }
  .browser img{ display:block; width:100%; }

  /* tablet + phone pair, sitting on a shelf below the desktop */
  .devices{ position:absolute; bottom:0; left:50%; transform:translateX(-50%);
    display:flex; align-items:flex-end; justify-content:center; }

  .tablet{ width:46mm; z-index:1; }
  .ipad{ border-radius:16px; background:var(--frame); padding:7px 6px; border:1px solid var(--goldline); }
  .ipad .cam{ position:absolute; top:11px; left:50%; transform:translateX(-50%); width:4px; height:4px;
    border-radius:50%; background:var(--muted); opacity:.5; z-index:2; }
  .ipad .screen{ border-radius:9px; overflow:hidden; }
  .ipad img{ display:block; width:100%; }

  .phone{ width:30mm; margin-left:-9mm; z-index:2; }
  .no-tablet .phone{ margin-left:0; }
  .phone .frame{ border-radius:26px; background:var(--frame); padding:6px; border:1px solid var(--goldline); }
  .phone .screen{ position:relative; border-radius:21px; overflow:hidden; }
  .phone .island{ position:absolute; top:7px; left:50%; transform:translateX(-50%); width:46px; height:13px;
    background:var(--island); border-radius:8px; z-index:2; }
  .phone img{ display:block; width:100%; }

  .pagenum{ position:absolute; bottom:14mm; left:18mm; right:18mm; display:flex; justify-content:space-between;
    font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:var(--muted); }
</style>
</head>
<body>

  <!-- COVER -->
  <section class="page cover">
    <div class="smoke"></div>
    <div class="rule"></div>
    <div class="brand serif">NUAGE</div>
    <div class="tag serif">L'art de la détente</div>
    <div class="sub">Aperçu du site &nbsp;·&nbsp; Desktop · Tablette · Mobile</div>
    <div class="meta">Chichas &amp; accessoires premium &nbsp;—&nbsp; 2026</div>
  </section>

  <!-- SOMMAIRE -->
  <section class="page">
    <div class="eyebrow">Aperçu</div>
    <h2 class="title serif">Le site en un coup d'œil</h2>
    <p class="lead">Nuage est une boutique en ligne dédiée aux <b>chichas et accessoires premium</b>.
      Pensé pour le mobile comme pour le bureau, le site allie une direction artistique soignée à un
      parcours d'achat fluide et 100&nbsp;% sécurisé. Les pages suivantes présentent les écrans clés,
      du premier regard à la commande.</p>
    <div class="stats">
      <div class="s"><b>${total}</b><span>Pages clés</span></div>
      <div class="s"><b>3</b><span>Formats d'écran</span></div>
      <div class="s"><b>50&nbsp;€</b><span>Livraison offerte</span></div>
      <div class="s"><b>24/48h</b><span>Réponse SAV</span></div>
    </div>
    <div class="hr" style="margin-top:34px"></div>
    <ol class="toc">${tocRows}
    </ol>
    <div class="pagenum"><span>Nuage — Aperçu du site</span><span>Sommaire</span></div>
  </section>
${sectionPages}

  <!-- CLOSING -->
  <section class="page cover">
    <div class="smoke"></div>
    <div class="rule"></div>
    <div class="brand serif" style="font-size:72px">Merci</div>
    <div class="tag serif">Découvrez Nuage en ligne</div>
    <div class="sub" style="margin-top:40px">chichanuage.com</div>
    <div class="meta">L'art de la détente &nbsp;—&nbsp; Chichas &amp; accessoires premium</div>
  </section>

</body>
</html>`;

writeFileSync("../book/book.html", html, "utf8");
console.log("book.html written");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file:///C:/Users/haida/chicha/book/book.html", { waitUntil: "networkidle" });
await page.waitForTimeout(2500); // fonts + images
await page.pdf({ path: "../book/Nuage-Apercu-du-site.pdf", format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log("PDF written");
