# 🚀 NUAGE - PLAN D'ACTION IMMÉDIAT
## Que Faire AUJOURD'HUI pour Lancer en 30 Jours

**Date:** 10 février 2026
**Objectif:** Premier client payant d'ici 30 jours maximum

---

## 📋 CHECKLIST SEMAINE 1 (Jours 1-7)

### 🔴 PRIORITÉ ABSOLUE #1: Conformité Légale (Jour 1-2)

**Pourquoi c'est critique:** Un seul problème légal = business fermé

#### ✅ Action 1.1: Compléter les Mentions Légales (30 min)
**Fichier:** `src/app/mentions-legales/page.tsx`

Remplacer tous les `[À compléter]` par vos vraies infos:

```typescript
// Ligne 17-24: Informations société
Nuage SARL (ou votre statut)
Capital social : [Votre capital] €
Siège social : [Votre adresse complète]
RCS : [Numéro RCS] ou "En cours d'immatriculation"
SIRET : [Numéro] ou "En cours"
TVA : [Numéro] ou "FR [À obtenir]"
Email : contact@nuage.fr (ou votre email réel)
Téléphone : [Votre numéro]
Directeur publication : [Votre nom]
```

**Comment obtenir ces infos:**
- Auto-entrepreneur: https://www.autoentrepreneur.urssaf.fr/ (15 min en ligne)
- SARL: https://www.infogreffe.fr/ (48h-7 jours)

**SI PAS ENCORE DE SOCIÉTÉ:** Mettre temporairement:
```
Nuage - Auto-Entrepreneur
SIRET : En cours d'immatriculation
[Votre nom complet]
[Votre adresse]
```

#### ✅ Action 1.2: Ajouter Vérification d'Âge (2h)

**OBLIGATOIRE:** Interdiction vente -18 ans

Créer: `src/components/AgeVerification.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AgeVerification() {
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem("age_verified");
    if (!verified) {
      setShowModal(true);
    } else {
      setIsVerified(true);
    }
  }, []);

  const handleConfirm = () => {
    sessionStorage.setItem("age_verified", "true");
    setIsVerified(true);
    setShowModal(false);
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.com";
  };

  if (isVerified) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg p-8 max-w-md w-full text-center"
          >
            <h2 className="text-3xl font-heading font-bold text-primary mb-4">
              Vérification d'âge
            </h2>
            <p className="text-primary/70 mb-6">
              Vous devez être âgé(e) de 18 ans ou plus pour accéder à ce site.
            </p>
            <p className="text-sm text-primary/50 mb-8">
              En confirmant, vous certifiez avoir l'âge légal requis.
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleDeny}
                className="flex-1 px-6 py-3 border border-primary/20 text-primary rounded-[--radius-button] hover:bg-primary/5 transition-colors"
              >
                J'ai moins de 18 ans
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent transition-colors"
              >
                J'ai 18 ans ou plus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Ajouter dans `src/app/layout.tsx` (ligne ~70):

```typescript
import { AgeVerification } from "@/components/AgeVerification";

// Dans le return, avant {children}:
<AgeVerification />
{children}
```

#### ✅ Action 1.3: Bannière Avertissement Santé (30 min)

Créer: `src/components/HealthWarning.tsx`

```typescript
"use client";

import { useState } from "react";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function HealthWarning() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-900">
            <strong>Avertissement santé :</strong> Fumer est dangereux pour la santé.
            Réservé aux personnes majeures (18+).
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-auto text-amber-600 hover:text-amber-800"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

Ajouter dans `src/components/layout/Header.tsx` (avant le header actuel).

---

### 🟡 PRIORITÉ #2: Photos Produits Réelles (Jour 2-4)

**Problème actuel:** Placeholders = 0% crédibilité

#### Options selon budget:

**Option A: DIY Smartphone (0€, 4h travail)**
1. Acheter ou emprunter 2-3 chichas
2. Setup photo:
   - Fond blanc (drap/papier)
   - Lumière naturelle fenêtre
   - Ou ring light Amazon (25€)
3. Photos nécessaires par produit:
   - Vue face (hero)
   - Vue 45° (détails)
   - Vue détail (texture, finitions)
   - En utilisation (lifestyle)
4. Édition gratuite: Canva.com ou Photopea.com

**Option B: Fiverr (150-300€, 48h)**
- Chercher "product photography" France
- Envoyer produits par Colissimo
- Recevoir 4-5 photos pro/produit
- Lien: https://fr.fiverr.com/categories/graphics-design/product-photographers

**Option C: Photographe Local (500-800€, 1 semaine)**
- Qualité maximale
- 20-30 photos exploitables
- Utilisables pour ads/social

**MA RECOMMANDATION:**
- Semaine 1: Option A (DIY) pour lancer vite
- Mois 2: Option B ou C quand premiers revenus

#### ✅ Action 2.1: Remplacer Placeholders

Après avoir les photos, mettre dans `public/products/`:
```
public/products/
  ├── chicha-crystal-premium-1.jpg
  ├── chicha-crystal-premium-2.jpg
  ├── chicha-classic-noir-1.jpg
  └── ...
```

Mettre à jour `data/products.json`:
```json
"images": [
  "/products/chicha-crystal-premium-1.jpg",
  "/products/chicha-crystal-premium-2.jpg"
]
```

---

### 🟢 PRIORITÉ #3: Stock & Fournisseurs (Jour 3-7)

#### ✅ Action 3.1: Trouver Grossistes Fiables

**Grossistes Recommandés France:**

1. **El-Badia Pro** (https://pro.el-badia.com/)
   - Leader français
   - Remise pro: 30-40%
   - Minimum commande: 300€
   - Délai: 48-72h

2. **Mistersmoke Wholesale** (https://www.mistersmoke.com/espace-professionnels/)
   - Large choix
   - Prix agressifs
   - B2B établi

3. **Ocean Hookah** (contact direct)
   - Haut de gamme
   - Marges meilleures
   - MOQ plus élevé

**Calcul Stock Initial (Budget 5 000€):**

| Produit | Qté | Prix Achat | Prix Vente | Marge | Total Achat |
|---------|-----|------------|------------|-------|-------------|
| Chicha Premium (120-150€) | 8 | 55€ | 129€ | 57% | 440€ |
| Chicha Mid (80-100€) | 15 | 35€ | 89€ | 61% | 525€ |
| Chicha Entrée (50-70€) | 10 | 22€ | 59€ | 63% | 220€ |
| Bols variés | 30 | 8€ | 24€ | 67% | 240€ |
| Tuyaux | 25 | 6€ | 19€ | 68% | 150€ |
| Charbon (boîtes) | 50 | 5€ | 14€ | 64% | 250€ |
| Pinces | 40 | 3€ | 9€ | 67% | 120€ |
| Kits nettoyage | 20 | 6€ | 18€ | 67% | 120€ |
| **TOTAL STOCK** | | | | **62%** | **2 065€** |

**Reste 2 935€ pour:**
- Marketing: 2 000€
- Photos/branding: 500€
- Imprévus: 435€

#### ✅ Action 3.2: Négocier avec Grossiste

Email template:

```
Objet: Demande compte professionnel - E-commerce Chichas Premium

Bonjour,

Je lance Nuage (nuage.fr), une boutique e-commerce spécialisée dans
les chichas haut de gamme en France.

Je souhaite établir un partenariat grossiste pour:
- Commande initiale: 2 000-2 500€
- Objectif: 10 000€/mois d'ici 6 mois
- Focus: produits premium, design moderne

Pourriez-vous m'envoyer:
1. Catalogue grossiste avec tarifs
2. Conditions de paiement
3. Délais de livraison
4. Minimum de commande

Merci,
[Votre nom]
[Numéro]
```

---

## 📋 CHECKLIST SEMAINE 2 (Jours 8-14)

### 🔴 PRIORITÉ #4: Setup TikTok (LE PLUS IMPORTANT)

#### ✅ Action 4.1: Créer Compte TikTok Business (30 min)

1. Télécharger TikTok
2. Créer compte @nuage.detente ou @nuage.chichas
3. Passer en Business Account:
   - Paramètres → Gérer le compte → Passer à un compte professionnel
   - Catégorie: "Shopping & Retail"
4. Bio optimisée:
```
L'art de la détente 🌫️
Chichas premium & accessoires
🇫🇷 Expédition 24-48h
🔞 Réservé aux +18 ans
⬇️ Boutique en ligne
```

5. Lien: votre-site.com (avec UTM: ?utm_source=tiktok&utm_medium=bio)

#### ✅ Action 4.2: Créer 10 Premières Vidéos (Weekend)

**Format gagnant pour chicha TikTok:**

**Vidéo Type 1: ASMR Préparation (3-4 vidéos)**
- 15-30 secondes
- Slow motion: remplir le vase, mettre charbon, première bouffée
- Son: ASMR eau qui bulle, silence ou lofi music
- Texte: "POV: tu prépares ta session détente du soir 🌙"
- Hashtags: #chicha #asmr #detente #satisfying #chill

**Vidéo Type 2: "Deboxing" Produit (2-3 vidéos)**
- Unboxing esthétique de chicha
- Montrer packaging, détails, assemblage
- Texte: "Unboxing de la Crystal Premium ✨ [lien en bio]"
- Hashtags: #unboxing #chicha #luxe #premium #shopping

**Vidéo Type 3: Éducatif (2 vidéos)**
- "3 erreurs qu'on fait TOUS avec sa chicha"
- "Comment choisir sa première chicha"
- Texte overlay + voix off
- Hashtags: #astuce #chicha #tutorial #pourtoi #apprendre

**Vidéo Type 4: Lifestyle (1-2 vidéos)**
- Ambiance: soirée entre amis, terrasse, lounge
- Musique tendance TikTok
- Texte: "Les vrais savent 🌫️"
- Hashtags: #vibe #detente #weekend #friends

**Planning Publication:**
- Lundi 19h: ASMR
- Mercredi 20h: Éducatif
- Vendredi 21h: Lifestyle
- Samedi 18h: Unboxing
- Dimanche 19h: ASMR

**Outils Gratuits:**
- Montage: CapCut (app mobile)
- Musique: TikTok library (royalty-free)
- Voix off: votre voix ou text-to-speech TikTok

#### ✅ Action 4.3: Stratégie Hashtags

**Mix parfait pour chaque vidéo:**
- 2-3 hashtags larges: #chicha #hookah #france
- 2-3 hashtags moyens: #chichatime #shishalife #detente
- 2-3 hashtags petits/niche: #chichaaddict #nuage #artdeladetente
- 1-2 trending: vérifier page "Découvrir" TikTok

**Ne JAMAIS utiliser:**
- #tabac #fumer #weed #cannabis (shadowban automatique)

---

### 🟡 PRIORITÉ #5: Instagram Setup (Jour 10-12)

#### ✅ Action 5.1: Feed Instagram Esthétique

Créer 9 premiers posts (grille 3x3):

**Ligne 1:**
1. Photo hero: Chicha Crystal sur fond élégant
2. Quote card: "L'art de la détente 🌫️"
3. Photo lifestyle: session entre amis

**Ligne 2:**
4. Produit: Bol céramique artisanal (gros plan)
5. Behind the scenes: préparation commande
6. Produit: Tuyau premium détails

**Ligne 3:**
7. Customer photo (si vous en avez) ou recréer
8. Ambiance: fumée, lumières tamisées
9. CTA: "Livraison 24-48h - Lien en bio"

**Palette cohérente:**
- Tons: noir, beige, or, blanc
- Filtres: VSCOcam A6 ou Lightroom preset "Moody"

#### ✅ Action 5.2: Stories Quotidiennes

Template 7 jours:
- Lundi: "Nouvelle semaine, nouveau stock ✨" (vidéo stock)
- Mardi: Sondage "Quelle couleur préférée?" (engagement)
- Mercredi: Customer testimonial (texte + photo)
- Jeudi: "Behind the scenes" (préparation commande)
- Vendredi: "Weekend prêt 🌙" (lifestyle vibe)
- Samedi: Repost story client (UGC)
- Dimanche: "Promo de la semaine" (tease produit)

---

### 🟢 PRIORITÉ #6: Google Business & SEO (Jour 13-14)

#### ✅ Action 6.1: Google My Business (si local showroom futur)

Si vous avez une adresse commerciale:
1. https://business.google.com/create
2. Catégorie: "Magasin de tabac" ou "Boutique en ligne"
3. Photos: 5-10 minimum
4. Horaires, description

**Même sans local physique:**
- Créer profil "Zone de service" (livraison France)

#### ✅ Action 6.2: 3 Articles Blog SEO

Écrire et publier:

**Article 1: "Comment Choisir sa Première Chicha en 2026"** (800 mots)
- Mots-clés: "choisir chicha", "première chicha", "quelle chicha acheter"
- Sections: Types de chichas, tailles, matériaux, budget
- CTA: Voir notre sélection débutants

**Article 2: "Guide Complet Entretien Chicha"** (600 mots)
- Mots-clés: "nettoyer chicha", "entretien narguilé"
- Étapes détaillées avec photos
- CTA: Voir nos kits nettoyage

**Article 3: "Top 5 Erreurs Débutants Chicha (et Comment les Éviter)"** (700 mots)
- Mots-clés: "erreurs chicha", "conseils chicha débutant"
- Format liste numérotée
- CTA: Besoin d'aide? Contactez-nous

**Publier dans:** `src/app/blog/[slug]/page.tsx` (créer la structure)

---

## 📋 CHECKLIST SEMAINE 3-4 (Jours 15-30)

### 🔴 PRIORITÉ #7: Lancement Ads (Jour 15)

#### Budget Test Initial: 500€ répartis

**TikTok Ads (300€):**
1. TikTok Ads Manager: https://ads.tiktok.com/
2. Créer campagne "Conversions"
3. Pixel installé sur site (via Google Tag Manager)
4. Tester 3 créatifs (reprendre vos meilleures vidéos organiques)
5. Audience:
   - Âge: 18-35 ans
   - France
   - Intérêts: lifestyle, détente, décoration, soirées
6. Budget: 30€/jour x 10 jours

**Meta Ads - Instagram/Facebook (200€):**
1. Meta Business Suite
2. Campagne "Trafic" vers site
3. Visuels: vos 3 meilleures photos produits
4. Audience:
   - Lookalike amis/followers actuels
   - Intérêts: chicha, hookah, lounge, lifestyle
5. Budget: 20€/jour x 10 jours

**Objectif semaine 3:** 10-15 commandes minimum

#### ✅ Action 7.1: Installer Pixels Tracking

**TikTok Pixel:**
```typescript
// src/app/layout.tsx - dans <head>
<Script id="tiktok-pixel">
  {`
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;
      var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
      var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
      var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('VOTRE_PIXEL_ID');
      ttq.page();
    }(window, document, 'ttq');
  `}
</Script>
```

**Meta Pixel:** (similaire)

---

### 🟡 PRIORITÉ #8: Premiers Clients & Service (Jour 16-30)

#### ✅ Action 8.1: Packaging Premium

**Matériel nécessaire (100€):**
- Cartons renforcés (20 unités): 30€ Amazon
- Papier bulle: 15€
- Papier de soie blanc/beige: 10€
- Stickers logo "Nuage": 25€ Stickermule.com
- Cartes "Merci" personnalisées: 20€ Moo.com
- Ruban adhésif kraft: 5€

**Checklist chaque colis:**
1. Chicha emballée papier bulle x2
2. Accessoires dans pochette tissus (2€/unité)
3. Papier de soie pour "unboxing" esthétique
4. Carte merci manuscrite + code promo -15% prochain achat
5. Sticker Nuage collé sur carton
6. Assurance Colissimo (si >100€)

**Photo AVANT expédition** → envoyer client par email
**Tracking** → email automatique dès expédition

#### ✅ Action 8.2: Email Post-Achat (Automation)

**Jour 0 (achat):** Confirmation commande
**Jour 1:** Expédition + tracking
**Jour 3:** "Votre colis arrive demain!"
**Jour 7:** "Comment trouvez-vous votre chicha?" + demande review
**Jour 14:** Code promo -15% + invitation Instagram
**Jour 30:** "Besoin de charbon?" + cross-sell consommables

#### ✅ Action 8.3: Demander Reviews

Google Forms simple:
```
https://forms.gle/VOTRE_FORM

Questions:
1. Note /5 ⭐
2. Qu'avez-vous aimé?
3. Qu'améliorer?
4. Recommanderiez-vous? Oui/Non
5. Peut-on partager votre avis? (avec prénom seulement)
```

**Incentive:** -10% sur prochaine commande si review détaillée

Afficher sur homepage: `src/components/home/CustomerReviews.tsx`

---

## 🎯 OBJECTIFS MESURABLES - 30 JOURS

### Métriques Critiques:

| Métrique | Objectif Jour 30 | Comment Mesurer |
|----------|------------------|-----------------|
| **Followers TikTok** | 500-1 000 | TikTok Analytics |
| **Followers Instagram** | 300-600 | Instagram Insights |
| **Visiteurs Site** | 1 500-2 500 | Google Analytics |
| **Commandes** | 15-25 | Votre dashboard |
| **CA** | 1 200-2 000€ | Total ventes |
| **Panier Moyen** | 60-80€ | CA / Commandes |
| **Taux Conversion** | 1-1,5% | Commandes / Visiteurs |
| **CAC** | <50€ | Dépense Ads / Clients |

### Si vous atteignez ces objectifs → VOUS ÊTES LANCÉ ✅

---

## 🚨 SIGNAUX D'ALERTE

### ❌ Arrêtez-vous si (avant d'investir plus):

1. **Après 2 semaines TikTok:**
   - <100 vues moyennes/vidéo → revoir contenu
   - <1% taux engagement → changer format

2. **Après 500€ ads:**
   - 0 vente → problème site/offre/prix
   - CAC >100€ → ciblage mauvais

3. **Après 10 ventes:**
   - >30% retours → problème qualité produits
   - Reviews <3/5 → revoir fournisseur

### ✅ Signes de succès précoce:

- Vidéo TikTok >10K vues organiques
- Taux conversion >1,5% dès semaine 2
- Messages Instagram "Quand vous restockez?"
- CAC <30€ sur TikTok Ads
- Clients redemandent/recommandent

---

## 💰 BUDGET TOTAL 30 PREMIERS JOURS

| Poste | Montant | Timing |
|-------|---------|--------|
| **Immatriculation société** | 0-200€ | Jour 1 |
| **Stock initial** | 2 000€ | Jour 5-7 |
| **Photos produits** | 0-300€ | Jour 3-5 |
| **Packaging** | 100€ | Jour 10 |
| **Ads (TikTok + Meta)** | 500€ | Jour 15-30 |
| **Outils** | 50€ | Jour 1 |
| **Divers/Imprévus** | 150€ | - |
| **TOTAL** | **3 000-3 300€** | |

**ROI Attendu Mois 1:**
- Ventes: 1 500-2 000€
- Perte: -1 300 à -1 800€ (NORMAL)
- **Objectif:** Valider concept, pas encore rentable

---

## 📞 OUTILS ESSENTIELS (Setup Jour 1)

### Gratuits:
- ✅ Google Analytics 4 (analytics.google.com)
- ✅ Google Search Console (search.google.com/search-console)
- ✅ TikTok Analytics (intégré)
- ✅ Meta Business Suite (business.facebook.com)
- ✅ Canva gratuit (canva.com)
- ✅ CapCut (app mobile)

### Payants mais essentiels:
- Shopify Starter (5€/mois) - SI vous migrez (mais Next.js actuel suffit)
- Google Workspace (6€/mois) - email pro contact@nuage.fr
- Sendinblue (gratuit jusqu'à 300 emails/jour) - automation email

### Nice to have (plus tard):
- Hotjar (analytics comportement) - 39€/mois
- Later (planification social) - 18€/mois
- Klaviyo (email avancé) - à partir 20€/mois

---

## 📋 CHECKLIST FINALE - READY TO LAUNCH?

Cochez TOUT avant de lancer ads:

### Légal:
- [ ] Mentions légales complétées
- [ ] CGV avec avertissement "pas de tabac"
- [ ] Vérification âge installée
- [ ] Bannière santé visible
- [ ] RGPD cookie banner

### Produits:
- [ ] Minimum 5 produits en stock
- [ ] Photos réelles (pas placeholders)
- [ ] Descriptions détaillées
- [ ] Prix cohérents concurrence

### Site:
- [ ] Checkout fonctionne (testé)
- [ ] Paiement Stripe/PayPal configuré
- [ ] Confirmation email automatique
- [ ] Mobile responsive (test 3 devices)
- [ ] Vitesse <3s (PageSpeed Insights)

### Marketing:
- [ ] TikTok: 10 vidéos publiées
- [ ] Instagram: 9 posts feed + bio complète
- [ ] Google Analytics installé + testé
- [ ] Pixels TikTok + Meta installés
- [ ] 3 articles blog publiés

### Opérationnel:
- [ ] Fournisseur identifié + compte créé
- [ ] Packaging acheté
- [ ] Contrat transporteur (Colissimo/Chronopost)
- [ ] Process expédition documenté
- [ ] Template emails clients

### 🚀 SI TOUT EST COCHÉ → LANCEZ LES ADS DEMAIN

---

## 🎯 VOTRE MISSION CETTE SEMAINE

**Jour 1 (AUJOURD'HUI):**
- [ ] Lire ce document en entier (30 min)
- [ ] Compléter mentions légales (30 min)
- [ ] Créer compte TikTok Business (15 min)
- [ ] Commander 1-2 chichas pour photos (si pas déjà)

**Jour 2:**
- [ ] Installer vérification âge (2h)
- [ ] Prendre 30-50 photos produits (3h)
- [ ] Créer compte Instagram Business (20 min)

**Jour 3:**
- [ ] Monter 5 premières vidéos TikTok (4h)
- [ ] Designer 9 posts Instagram (2h)
- [ ] Contacter 2 grossistes (30 min)

**Jour 4-5:**
- [ ] Publier premières vidéos TikTok (suivi planning)
- [ ] Publier feed Instagram complet
- [ ] Passer commande stock (2 000€)

**Jour 6-7:**
- [ ] Écrire 3 articles blog (6h)
- [ ] Setup Google Analytics + pixels
- [ ] Préparer créatifs ads

**→ SEMAINE 2:** Continuer contenus + recevoir stock
**→ SEMAINE 3:** Lancer ads + premiers clients
**→ SEMAINE 4:** Optimiser + scaler

---

## 💬 QUESTIONS FRÉQUENTES

**Q: Je n'ai jamais fait de vidéo TikTok, c'est grave?**
R: Non. 90% des créateurs TikTok ont commencé sans expérience. Premières vidéos seront mauvaises = NORMAL. Vous améliorerez en faisant. L'authenticité compte plus que la qualité pro.

**Q: Je peux lancer sans stock (dropshipping)?**
R: Techniquement oui, mais je déconseille fortement pour chicha. Marges trop serrées, qualité incontrôlable, délais longs = clients mécontents. Minimum 2K€ stock.

**Q: Combien de temps avant d'être rentable?**
R: Réaliste: 4-6 mois pour couvrir frais fixes. 8-12 mois pour récupérer investissement initial. E-commerce = marathon.

**Q: Je dois quitter mon job?**
R: NON! Lancez en side-hustle. 15-20h/semaine suffisent mois 1-3. Quittez job seulement si CA stable >3000€/mois pendant 6 mois minimum.

**Q: Et si je n'ai que 1000€ à investir?**
R: Possible mais difficile. Réduire:
- Stock: 800€ (focus 2-3 modèles chichas seulement)
- Photos: DIY (0€)
- Ads: 200€ test (TikTok uniquement)
Risque: rupture stock rapide si succès.

**Q: TikTok est vraiment nécessaire?**
R: Pour votre marché (18-35 ans, lifestyle) = OUI CRITIQUE. Instagram + Google seuls = CAC 3x plus élevé. TikTok organique = 70% de votre growth initial.

---

## 🏁 CONCLUSION

Vous avez maintenant **TOUT** ce qu'il faut pour:

1. ✅ Être 100% conforme légalement
2. ✅ Avoir un site crédible (photos réelles)
3. ✅ Démarrer présence social forte (TikTok + Instagram)
4. ✅ Lancer campagnes ads rentables
5. ✅ Gérer premières commandes comme un pro

### Prochaine étape: EXÉCUTION

**Ne tombez pas dans la paralysie de l'analyse.** Ce plan est solide. Maintenant:

🎯 **ACTION = RÉSULTATS**

Commencez par Jour 1 AUJOURD'HUI. Pas demain. Pas lundi prochain.

Dans 30 jours, vous aurez:
- Un vrai business lancé
- Premiers clients payants
- Traction social media
- Retours concrets pour améliorer

**La différence entre succès et échec = ceux qui exécutent vs ceux qui planifient à l'infini.**

---

**Besoin d'aide sur un point spécifique?**

Dites-moi où vous bloquez et je vous débloquerai. 🚀

*Document créé par Claude Sonnet 4.5 - Février 2026*
