/**
 * Chatbot Knowledge Base - Everything about Nuage
 * This gets fed to the AI so it can answer customer questions
 *
 * Bilingual: the knowledge base and personality prompt are keyed by locale
 * ("fr" default + "en"). The French ("fr") content is byte-for-byte identical
 * to the historical single-language version. Use getSiteKnowledge(locale) and
 * getChatbotPersonality(locale) to select the right variant.
 */

import { SUPPORT_EMAIL } from "@/lib/support";

export type ChatbotLocale = "fr" | "en";

export const SITE_KNOWLEDGE = {
  fr: {
    store: {
      name: "Nuage",
      description: "Boutique premium de chichas et accessoires en France",
      specialty: "Chichas artisanales, bols en céramique, tuyaux premium, charbon naturel",
      tagline: "L'Art de la Perfection - Chaque session devient une expérience inoubliable",
      values: [
        "Qualité supérieure",
        "Authenticité des marques",
        "Expédition rapide sous 24h",
        "Support expert connaisseur",
      ],
    },

    products: {
      categories: {
        chicha: {
          name: "Chichas",
          description: "Chichas premium en aluminium aérospatial et cristal bohème",
          priceRange: "50€ - 300€",
          brands: "Marques authentiques importées",
          features: [
            "Design élégant et moderne",
            "Matériaux de qualité supérieure",
            "Tirage parfait et doux",
            "Facile à nettoyer",
          ],
        },
        bol: {
          name: "Bols (Bowls)",
          description: "Bols en céramique artisanale, verre et silicone",
          priceRange: "15€ - 80€",
          features: [
            "Céramique artisanale premium",
            "Chaleur optimale pour le tabac",
            "Longue durée de vie",
            "Compatible avec la plupart des chichas",
          ],
        },
        tuyau: {
          name: "Tuyaux",
          description: "Tuyaux en silicone médical et cuir premium",
          priceRange: "20€ - 100€",
          features: [
            "Silicone médical sans goût",
            "Cuir véritable pour certains modèles",
            "Tirage parfait",
            "Facile à laver",
            "Longueurs variées disponibles",
          ],
        },
        charbon: {
          name: "Charbon",
          description: "Charbon naturel et auto-allumant premium",
          priceRange: "8€ - 25€",
          types: [
            "Charbon naturel (cocotier) - Combustion longue, pas de goût",
            "Charbon auto-allumant - Allumage rapide et facile",
          ],
          features: [
            "Combustion régulière et longue durée",
            "Pas d'odeur ni de goût",
            "Cendres minimales",
          ],
        },
        accessoire: {
          name: "Accessoires",
          description: "Tout pour entretenir et améliorer votre chicha",
          items: [
            "Pinces à charbon",
            "Embouts hygiéniques",
            "Brosses de nettoyage",
            "Grilles pour bol",
            "Filtres",
            "Allume-charbon",
          ],
        },
      },
    },

    shipping: {
      france: {
        cost: "Livraison gratuite à partir de 50€",
        standard: "4,90€ pour commandes < 50€",
        time: "Expédition sous 24h en jours ouvrés",
        delivery: "2-3 jours ouvrés en France métropolitaine",
        carrier: "Colissimo / Chronopost",
      },
      international: {
        available: "UE et certains pays hors UE",
        time: "5-10 jours ouvrés",
        cost: "Calculé à la caisse selon destination",
      },
      tracking: {
        provided: true,
        info: "Numéro de suivi envoyé par email dès expédition",
      },
    },

    returns: {
      period: "14 jours pour retourner un produit",
      conditions: [
        "Produit non utilisé et dans son emballage d'origine",
        "Accessoires et documentation complets",
        "Frais de retour à la charge du client",
      ],
      refund: "Remboursement sous 5-7 jours après réception du retour",
      damaged: "Photos requises pour produits endommagés, remplacement gratuit",
    },

    payment: {
      methods: ["Carte bancaire (Visa, Mastercard, Amex)", "Apple Pay", "Google Pay"],
      security: "Paiement 100% sécurisé via Stripe",
      billing: "Facture envoyée par email après commande",
    },

    support: {
      hours: "Lun-Ven 9h-18h, Sam 10h-16h",
      responseTime: "Réponse sous 24h maximum",
      contact: {
        email: SUPPORT_EMAIL,
        chat: "Chat en direct sur le site",
      },
    },

    usage: {
      beginnerTips: [
        "Commencez avec un charbon naturel pour une meilleure expérience",
        "Remplissez le vase avec de l'eau jusqu'à 2-3cm au-dessus du plongeur",
        "Ne tassez pas trop le tabac dans le bol",
        "Attendez 5-10 minutes que le charbon chauffe bien",
        "Tirez doucement pour un meilleur goût",
      ],
      cleaning: [
        "Nettoyez après chaque utilisation",
        "Utilisez de l'eau tiède et une brosse",
        "Changez l'eau du vase régulièrement",
        "Nettoyez le tuyau en silicone à l'eau",
      ],
      troubleshooting: {
        "Pas de fumée": "Vérifiez l'étanchéité, le charbon bien allumé, et que le bol n'est pas trop tassé",
        "Fumée âcre": "Charbon trop près du tabac, éloignez-le ou retirez un charbon",
        "Difficile à tirer": "Vérifiez les joints, nettoyez le tuyau et le plongeur",
        "Eau qui remonte": "Trop d'eau dans le vase, videz un peu",
      },
    },

    faq: [
      {
        q: "Quelle chicha pour débuter ?",
        a: "Pour débuter, nous recommandons une chicha de taille moyenne (40-60cm) avec un bon rapport qualité-prix. Les modèles entre 80€ et 150€ sont parfaits pour commencer.",
      },
      {
        q: "Quel charbon choisir ?",
        a: "Le charbon naturel (cocotier) est recommandé pour une meilleure expérience : pas de goût chimique, combustion longue et régulière. Le charbon auto-allumant est pratique pour l'extérieur.",
      },
      {
        q: "Comment nettoyer ma chicha ?",
        a: "Nettoyez après chaque usage avec de l'eau tiède et une brosse. Pour le tuyau en silicone, passez-le à l'eau. Changez l'eau du vase à chaque session.",
      },
      {
        q: "La livraison est gratuite ?",
        a: "Oui, livraison gratuite en France métropolitaine pour toute commande de 50€ ou plus. Sinon 4,90€.",
      },
      {
        q: "Je peux suivre ma commande ?",
        a: "Oui ! Vous recevrez un email avec le numéro de suivi dès l'expédition de votre commande (sous 24h).",
      },
      {
        q: "Vous livrez en Belgique/Suisse ?",
        a: "Oui, nous livrons dans toute l'UE et certains pays hors UE. Les frais et délais sont calculés à la caisse.",
      },
      {
        q: "Je peux retourner un produit ?",
        a: "Oui, vous avez 14 jours pour retourner un produit non utilisé dans son emballage d'origine. Frais de retour à votre charge.",
      },
      {
        q: "Les produits sont authentiques ?",
        a: "Absolument ! Nous travaillons uniquement avec des marques premium authentiques. Pas de contrefaçons chez Nuage.",
      },
    ],
  },

  en: {
    store: {
      name: "Nuage",
      description: "Premium shisha and accessories shop in France",
      specialty: "Handcrafted shishas, ceramic bowls, premium hoses, natural charcoal",
      tagline: "The Art of Perfection - Every session becomes an unforgettable experience",
      values: [
        "Superior quality",
        "Authentic brands",
        "Fast shipping within 24h",
        "Expert, knowledgeable support",
      ],
    },

    products: {
      categories: {
        chicha: {
          name: "Shishas",
          description: "Premium shishas in aerospace aluminium and Bohemian crystal",
          priceRange: "€50 - €300",
          brands: "Authentic imported brands",
          features: [
            "Elegant, modern design",
            "Superior-quality materials",
            "Perfect, smooth draw",
            "Easy to clean",
          ],
        },
        bol: {
          name: "Bowls",
          description: "Bowls in handcrafted ceramic, glass and silicone",
          priceRange: "€15 - €80",
          features: [
            "Premium handcrafted ceramic",
            "Optimal heat for the tobacco",
            "Long lifespan",
            "Compatible with most shishas",
          ],
        },
        tuyau: {
          name: "Hoses",
          description: "Hoses in medical-grade silicone and premium leather",
          priceRange: "€20 - €100",
          features: [
            "Tasteless medical-grade silicone",
            "Genuine leather on some models",
            "Perfect draw",
            "Easy to wash",
            "Various lengths available",
          ],
        },
        charbon: {
          name: "Charcoal",
          description: "Premium natural and quick-light charcoal",
          priceRange: "€8 - €25",
          types: [
            "Natural charcoal (coconut) - Long burn, no taste",
            "Quick-light charcoal - Fast and easy to light",
          ],
          features: [
            "Steady, long-lasting burn",
            "No smell or taste",
            "Minimal ash",
          ],
        },
        accessoire: {
          name: "Accessories",
          description: "Everything to maintain and upgrade your shisha",
          items: [
            "Charcoal tongs",
            "Hygienic mouth tips",
            "Cleaning brushes",
            "Bowl screens",
            "Filters",
            "Charcoal burners",
          ],
        },
      },
    },

    shipping: {
      france: {
        cost: "Free shipping on orders of €50 or more",
        standard: "€4.90 for orders < €50",
        time: "Shipped within 24h on business days",
        delivery: "2-3 business days in mainland France",
        carrier: "Colissimo / Chronopost",
      },
      international: {
        available: "EU and select non-EU countries",
        time: "5-10 business days",
        cost: "Calculated at checkout based on destination",
      },
      tracking: {
        provided: true,
        info: "Tracking number sent by email as soon as the order ships",
      },
    },

    returns: {
      period: "14 days to return a product",
      conditions: [
        "Product unused and in its original packaging",
        "Complete accessories and documentation",
        "Return shipping at the customer's expense",
      ],
      refund: "Refund within 5-7 days after the return is received",
      damaged: "Photos required for damaged products, free replacement",
    },

    payment: {
      methods: ["Credit card (Visa, Mastercard, Amex)", "Apple Pay", "Google Pay"],
      security: "100% secure payment via Stripe",
      billing: "Invoice sent by email after the order",
    },

    support: {
      hours: "Mon-Fri 9am-6pm, Sat 10am-4pm",
      responseTime: "Reply within 24h maximum",
      contact: {
        email: SUPPORT_EMAIL,
        chat: "Live chat on the site",
      },
    },

    usage: {
      beginnerTips: [
        "Start with natural charcoal for a better experience",
        "Fill the base with water until 2-3cm above the downstem",
        "Don't pack the tobacco too tightly in the bowl",
        "Wait 5-10 minutes for the charcoal to heat up properly",
        "Draw gently for a better taste",
      ],
      cleaning: [
        "Clean after each use",
        "Use lukewarm water and a brush",
        "Change the base water regularly",
        "Rinse the silicone hose with water",
      ],
      troubleshooting: {
        "No smoke": "Check the airtightness, that the charcoal is well lit, and that the bowl isn't packed too tightly",
        "Harsh smoke": "Charcoal too close to the tobacco, move it away or remove a piece of charcoal",
        "Hard to draw": "Check the seals, clean the hose and the downstem",
        "Water rising up": "Too much water in the base, pour some out",
      },
    },

    faq: [
      {
        q: "Which shisha for a beginner?",
        a: "To get started, we recommend a medium-sized shisha (40-60cm) with good value for money. Models between €80 and €150 are perfect to begin with.",
      },
      {
        q: "Which charcoal should I choose?",
        a: "Natural charcoal (coconut) is recommended for a better experience: no chemical taste, long and steady burn. Quick-light charcoal is handy for outdoors.",
      },
      {
        q: "How do I clean my shisha?",
        a: "Clean after each use with lukewarm water and a brush. Rinse the silicone hose with water. Change the base water every session.",
      },
      {
        q: "Is shipping free?",
        a: "Yes, free shipping in mainland France on any order of €50 or more. Otherwise €4.90.",
      },
      {
        q: "Can I track my order?",
        a: "Yes! You'll receive an email with the tracking number as soon as your order ships (within 24h).",
      },
      {
        q: "Do you ship to Belgium/Switzerland?",
        a: "Yes, we ship throughout the EU and to select non-EU countries. Costs and times are calculated at checkout.",
      },
      {
        q: "Can I return a product?",
        a: "Yes, you have 14 days to return an unused product in its original packaging. Return shipping is at your expense.",
      },
      {
        q: "Are the products authentic?",
        a: "Absolutely! We work only with authentic premium brands. No counterfeits at Nuage.",
      },
    ],
  },
} as const;

/**
 * Select the knowledge base for the given locale (defaults to "fr").
 */
export function getSiteKnowledge(locale: ChatbotLocale = "fr") {
  return SITE_KNOWLEDGE[locale];
}

export const CHATBOT_PERSONALITY_OLD = `Tu es Habibi Chichbot, l'assistant virtuel de Nuage, boutique premium de chichas en France.

TON NOM: Habibi Chichbot (habibi = "mon ami" en arabe)

PERSONNALITÉ:
- Chaleureux et amical comme un bon habibi
- Expert passionné en chichas/hookahs
- Parle en français naturel avec un ton convivial
- Utilise des emojis chicha appropriés (🔥 💨 ✨ 💯)
- Passionné par la qualité et l'expérience client
- Parfois tu peux dire "habibi" quand c'est naturel

TON RÔLE:
- Aider les clients à choisir leurs produits
- Répondre aux questions sur les commandes, livraison, retours
- Donner des conseils d'utilisation et d'entretien
- Résoudre les problèmes rapidement
- Escalader vers un humain si nécessaire

RÈGLES:
1. Sois précis et utilise les informations de la base de connaissances
2. Si tu ne sais pas, dis-le honnêtement et propose de contacter le support
3. Pour les problèmes complexes (commande perdue, produit défectueux), propose de parler à un humain
4. Recommande des produits basés sur les besoins du client
5. Reste positif même si le client est frustré
6. Ne jamais inventer des informations (prix, délais, policies)

EXEMPLES DE TON STYLE:
- "Salut habibi ! 👋 Comment puis-je t'aider aujourd'hui ?"
- "Excellente question ! Pour débuter, je te recommande..."
- "Ah habibi, je comprends ta frustration. Laisse-moi voir ce que je peux faire pour toi."
- "🔥 Super choix ! Ce bol est parfait pour des sessions exceptionnelles 💨"
- "Écoute habibi, pour une chicha parfaite, il faut..."
`;

export const CHATBOT_PERSONALITY = {
  fr: `Tu es Habibi Chichbot, l'ami chicha du client. Sois chaleureux, à l'écoute, et conseille selon ses besoins.

APPROCHE:
- D'abord ÉCOUTE et COMPRENDS les besoins (pose des questions)
- Ne recommande pas de produit tout de suite - d'abord apprends ce qu'il cherche
- Sois conversationnel, pas vendeur
- 2-3 phrases max, naturelles

QUAND RECOMMANDER UN PRODUIT:
- SEULEMENT après avoir compris les besoins du client
- SEULEMENT si le client demande explicitement une recommandation ou semble prêt
- Sinon, reste dans le conseil général et pose des questions

RECOMMANDATIONS PRODUITS (si approprié):
- Tu as accès à TOUT le catalogue (voir liste PRODUITS RÉELS ci-dessous)
- Recommande des produits RÉELS de la liste avec leur NOM EXACT
- JAMAIS inventer des produits
- À la fin de ta réponse, ajoute: [PRODUCT:slug-du-produit]
- Exemple: "La Chicha Classic Noir serait parfaite pour toi 🔥 [PRODUCT:chicha-classic-noir]"
- Maximum 1-2 produits par message
- Ne recommande pas les produits en RUPTURE DE STOCK

STYLE:
- "Habibi" régulièrement, chaleureux
- Emojis: 🔥 💨 ✨ 📦 🚚
- Écoute active, recommandations personnalisées


EXEMPLES:
- "Habibi ! Pour débuter je te conseille la Chicha Classic Noir à 89.99€, super qualité 🔥 [PRODUCT:chicha-classic-noir]"
- "Le Bol Céramique Artisanal est parfait habibi, fait main et unique ✨ [PRODUCT:bol-ceramique-artisanal]"
`,
  en: `You are Habibi Chichbot, the customer's shisha friend. Be warm, attentive, and advise based on their needs.

APPROACH:
- First LISTEN and UNDERSTAND the needs (ask questions)
- Don't recommend a product right away - first learn what they're looking for
- Be conversational, not salesy
- 2-3 sentences max, natural

WHEN TO RECOMMEND A PRODUCT:
- ONLY after understanding the customer's needs
- ONLY if the customer explicitly asks for a recommendation or seems ready
- Otherwise, stay with general advice and ask questions

PRODUCT RECOMMENDATIONS (if appropriate):
- You have access to the ENTIRE catalog (see the REAL PRODUCTS list below)
- Recommend REAL products from the list using their EXACT NAME
- NEVER invent products
- At the end of your reply, add: [PRODUCT:product-slug]
- Example: "The Chicha Classic Noir would be perfect for you 🔥 [PRODUCT:chicha-classic-noir]"
- Maximum 1-2 products per message
- Don't recommend OUT-OF-STOCK products

STYLE:
- "Habibi" regularly, warm
- Emojis: 🔥 💨 ✨ 📦 🚚
- Active listening, personalized recommendations


EXAMPLES:
- "Habibi! To get started I'd suggest the Chicha Classic Noir at €89.99, great quality 🔥 [PRODUCT:chicha-classic-noir]"
- "The Bol Céramique Artisanal is perfect habibi, handmade and unique ✨ [PRODUCT:bol-ceramique-artisanal]"
`,
} as const;

/**
 * Select the chatbot personality prompt for the given locale (defaults to "fr").
 */
export function getChatbotPersonality(locale: ChatbotLocale = "fr") {
  return CHATBOT_PERSONALITY[locale];
}
