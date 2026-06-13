import { NextRequest, NextResponse } from 'next/server';
import { getSiteKnowledge, getChatbotPersonality } from '@/lib/chatbot/knowledge';
import { createClient } from '@supabase/supabase-js';
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
} from '@/lib/rate-limit';
import { SUPPORT_EMAIL } from '@/lib/support';

// Cheap guards: this route calls the Groq API and loads the whole catalog
// via service-role for anonymous users, so cap conversation size and length.
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

// User-visible fallback/error strings, localized via the "locale" cookie.
const STRINGS = {
  fr: {
    rateLimit: RATE_LIMIT_MESSAGE,
    configError: "Erreur de configuration - clé API manquante. Contactez le support.",
    conversationTooLong: "Conversation trop longue. Merci de rafraîchir la page.",
    invalidMessage: (max: number) =>
      `Message invalide ou trop long (maximum ${max} caractères).`,
    groqError: (email: string) =>
      `Désolé habibi, j'ai un petit souci technique 😅 Réessaie dans quelques secondes ou contacte ${email}`,
    genericError: (email: string) =>
      `Désolé, j'ai un petit problème technique. Peux-tu réessayer ou contacter ${email} ?`,
    languageInstruction:
      "IMPORTANT : Le visiteur utilise le site en français. Réponds TOUJOURS en français.",
  },
  en: {
    rateLimit: "Too many requests. Please try again in a few moments.",
    configError: "Configuration error - API key missing. Contact support.",
    conversationTooLong: "Conversation too long. Please refresh the page.",
    invalidMessage: (max: number) =>
      `Invalid or overly long message (maximum ${max} characters).`,
    groqError: (email: string) =>
      `Sorry habibi, I'm having a little technical hiccup 😅 Try again in a few seconds or contact ${email}`,
    genericError: (email: string) =>
      `Sorry, I'm having a little technical issue. Can you try again or contact ${email}?`,
    languageInstruction:
      "IMPORTANT: The visitor is browsing the site in English. ALWAYS reply in English, while keeping the same warm personality.",
  },
} as const;

/**
 * Get all products from Supabase
 */
async function getAllProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name');

  return products || [];
}

/**
 * Support Chatbot API using Groq
 * Cost: 100% FREE! (Llama 3.3 70B)
 */
export async function POST(request: NextRequest) {
  // Visitor language, set by the middleware/footer switcher
  const v = request.cookies.get("locale")?.value;
  const locale = v === "en" ? "en" : "fr";
  const t = STRINGS[locale];

  try {
    // Rate limit: 10 requests per minute per IP
    const rate = checkRateLimit(`chat-support:${getClientIp(request)}`, 10);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: t.rateLimit, message: t.rateLimit },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSeconds) },
        }
      );
    }

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      console.error('[Chatbot] GROQ_API_KEY not set in environment');
      return NextResponse.json({
        message: t.configError,
        error: true,
      }, { status: 200 });
    }

    const { messages, sessionId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array required' },
        { status: 400 }
      );
    }

    // Cap conversation size and individual message length (cost guard)
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: t.conversationTooLong },
        { status: 400 }
      );
    }
    for (const msg of messages) {
      if (
        !msg ||
        typeof msg.content !== 'string' ||
        msg.content.length > MAX_MESSAGE_LENGTH
      ) {
        return NextResponse.json(
          { error: t.invalidMessage(MAX_MESSAGE_LENGTH) },
          { status: 400 }
        );
      }
    }

    // Fetch ALL products from Supabase
    const products = await getAllProducts();


    // Build system prompt with real products + knowledge base (locale-aware)
    const knowledge = getSiteKnowledge(locale);
    const personality = getChatbotPersonality(locale);
    const productsInfo = products.map(p => {
      const price = typeof p.price === 'number' ? (p.price / 100).toFixed(2) : p.price;
      const comparePrice = p.compare_at_price || p.compareAtPrice;
      const stock = p.stock_level || p.stockLevel || 0;
      const inStock = p.in_stock !== undefined ? p.in_stock : (p.inStock || stock > 0);
      const description = p.short_description || p.shortDescription || p.description || '';

      return `- ${p.name} [slug: ${p.slug}]: ${price}€${comparePrice ? ` (était ${(comparePrice/100).toFixed(2)}€)` : ''} - ${description.substring(0, 100)} ${inStock ? `(${stock} en stock)` : '(RUPTURE DE STOCK)'}`;
    }).join('\n');

    const systemPrompt = `${personality}

PRODUITS RÉELS DU SITE - CATALOGUE COMPLET (${products.length} produits):
Ces produits sont TOUS les produits disponibles. Recommande UNIQUEMENT ceux-ci par leur NOM EXACT.

${productsInfo}

BASE DE CONNAISSANCES NUAGE:

BOUTIQUE:
${JSON.stringify(knowledge.store, null, 2)}

CATÉGORIES GÉNÉRALES:
${JSON.stringify(knowledge.products, null, 2)}

LIVRAISON:
${JSON.stringify(knowledge.shipping, null, 2)}

RETOURS:
${JSON.stringify(knowledge.returns, null, 2)}

PAIEMENT:
${JSON.stringify(knowledge.payment, null, 2)}

SUPPORT:
${JSON.stringify(knowledge.support, null, 2)}

CONSEILS D'UTILISATION:
${JSON.stringify(knowledge.usage, null, 2)}

FAQ:
${knowledge.faq.map(item => `Q: ${item.q}\nR: ${item.a}`).join('\n\n')}

---

${t.languageInstruction}

Réponds maintenant au message du client en utilisant ces informations.
`;

    // Call Groq API (FREE!)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // FREE Llama 3.3 70B!
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 280, // Warm & helpful!
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chatbot] Groq error status:', response.status);
      console.error('[Chatbot] Groq error body:', errorText);

      // Return a friendly error to the user
      return NextResponse.json({
        message: t.groqError(SUPPORT_EMAIL),
        error: true,
      }, { status: 200 }); // Return 200 so UI doesn't break
    }

    const data = await response.json();
    console.log('[Chatbot] Groq response model:', data.model);

    // Extract response
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from AI');
    }

    // Parse product recommendations [PRODUCT:slug]
    const productMatches = assistantMessage.matchAll(/\[PRODUCT:([\w-]+)\]/g);
    const productSlugs = Array.from(productMatches).map(match => (match as RegExpMatchArray)[1]);
    const recommendedProducts = products
      .filter(p => productSlugs.includes(p.slug))
      .map(p => ({
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: Array.isArray(p.images) ? p.images[0] : (p.image_url || p.images || '/placeholder.jpg'),
        url: `/produits/${p.slug}`
      }));

    // Remove [PRODUCT:...] tags from message
    const cleanMessage = assistantMessage
      .replace(/\[PRODUCT:[\w-]+\]/g, '')
      .trim();

    // Check if we should escalate to human (complex issue detection)
    const shouldEscalate = detectEscalation(cleanMessage, messages);

    return NextResponse.json({
      message: cleanMessage,
      products: recommendedProducts,
      escalate: shouldEscalate,
      model: data.model,
      sessionId,
    });

  } catch (error) {
    console.error('[Chatbot] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get response',
        message: t.genericError(SUPPORT_EMAIL),
      },
      { status: 500 }
    );
  }
}

/**
 * Detect if conversation should be escalated to human support
 */
function detectEscalation(aiResponse: string, messages: unknown[]): boolean {
  const escalationTriggers = [
    'parler à un humain',
    'contacter le support',
    'cas complexe',
    'je ne peux pas',
    'je ne sais pas',
    'commande perdue',
    'produit défectueux',
    'remboursement',
    'problème grave',
  ];

  const lowerResponse = aiResponse.toLowerCase();

  // Check if AI suggests escalation
  if (escalationTriggers.some(trigger => lowerResponse.includes(trigger))) {
    return true;
  }

  // Check if customer is frustrated (multiple messages without resolution)
  if (messages.length > 6) {
    return true;
  }

  return false;
}
