/**
 * Chatbot Knowledge Base - Everything about Nuage
 * This gets fed to the AI so it can answer customer questions
 */

import { SUPPORT_EMAIL } from "@/lib/support";

export const SITE_KNOWLEDGE = {
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
};

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

export const CHATBOT_PERSONALITY = `Tu es Habibi Chichbot, l'ami chicha du client. Sois chaleureux, à l'écoute, et conseille selon ses besoins.

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
`;

