/**
 * AI Translation Service for Nuage Product Curation
 *
 * Takes raw scraped product data and produces brand-consistent premium French copy
 * using OpenRouter (free models). All operations are server-side only.
 */

import { SYSTEM_PROMPT, ENHANCED_SYSTEM_PROMPT, buildTranslationPrompt, buildEnhancedTranslationPrompt, VALID_CATEGORIES, TranslationResult } from './prompts';
import { getDraftById, getDraftsByStatus, updateDraft } from '@/lib/curation';
import { getReviewsByScrapedProduct } from '@/lib/scraper/review-data';

const AI_MODEL = 'openai/gpt-4o-mini'; // OpenAI's cheapest model

/**
 * Translate a raw product into premium French copy using Gemini API
 * Now supports review-enhanced translation for better product descriptions
 *
 * @param rawProduct - Raw product data from scraping
 * @param reviews - Optional array of customer reviews for context
 * @returns Structured translation result with name, description, category, and price
 * @throws Error if API call fails or response cannot be parsed
 */
export async function translateProduct(
  rawProduct: {
    rawName: string;
    rawDescription: string | null;
    rawPriceText: string | null;
    rawSourceName: string | null;
  },
  reviews?: Array<{ text: string; rating: number }>
): Promise<TranslationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  // Use enhanced prompt if reviews are available
  const useEnhanced = reviews && reviews.length > 0;
  const systemPrompt = useEnhanced ? ENHANCED_SYSTEM_PROMPT : SYSTEM_PROMPT;
  const userPrompt = useEnhanced
    ? buildEnhancedTranslationPrompt(rawProduct, reviews)
    : buildTranslationPrompt(rawProduct);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nuage.fr',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1024,
      temperature: 0.3,
      response_format: { type: 'json_object' }, // Request JSON response
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // AGGRESSIVE DEBUG LOGGING FOR PRODUCT TRANSLATION
  console.log('=== PRODUCT TRANSLATION OPENROUTER RESPONSE START ===');
  console.log('Full response:', JSON.stringify(data, null, 2));
  console.log('Choices:', data.choices);
  console.log('First choice:', data.choices?.[0]);
  console.log('Message:', data.choices?.[0]?.message);
  console.log('Content:', data.choices?.[0]?.message?.content);
  console.log('=== PRODUCT TRANSLATION OPENROUTER RESPONSE END ===');

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    console.error('PRODUCT TRANSLATION: No text content! Full data:', JSON.stringify(data));
    throw new Error('No text content in AI response');
  }

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${jsonStr.substring(0, 200)}`);
  }

  // Validate required fields
  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('AI response missing or invalid "name" field');
  }
  if (!parsed.description || typeof parsed.description !== 'string') {
    throw new Error('AI response missing or invalid "description" field');
  }
  if (!parsed.shortDescription || typeof parsed.shortDescription !== 'string') {
    throw new Error('AI response missing or invalid "shortDescription" field');
  }
  if (!parsed.category || typeof parsed.category !== 'string') {
    throw new Error('AI response missing or invalid "category" field');
  }
  if (typeof parsed.suggestedPriceCents !== 'number' || parsed.suggestedPriceCents <= 0) {
    throw new Error('AI response missing or invalid "suggestedPriceCents" field');
  }

  // Validate category is one of the allowed values
  if (!VALID_CATEGORIES.includes(parsed.category as typeof VALID_CATEGORIES[number])) {
    throw new Error(
      `AI response has invalid category "${parsed.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`
    );
  }

  // Validate suggestedPriceCents is a positive integer
  if (!Number.isInteger(parsed.suggestedPriceCents)) {
    throw new Error(
      `AI response has non-integer suggestedPriceCents: ${parsed.suggestedPriceCents}`
    );
  }

  return {
    name: parsed.name,
    description: parsed.description,
    shortDescription: parsed.shortDescription,
    category: parsed.category,
    suggestedPriceCents: parsed.suggestedPriceCents,
  };
}

/**
 * Translate a draft and save the AI results back to the database
 * Now fetches and uses customer reviews to enhance translation quality
 *
 * @param draftId - UUID of the product draft to translate
 * @returns Updated product draft with AI fields populated
 */
export async function translateAndSaveDraft(draftId: string) {
  // Fetch draft
  const draft = await getDraftById(draftId);
  if (!draft) {
    throw new Error(`Draft not found: ${draftId}`);
  }

  // Update status to 'translating'
  await updateDraft(draftId, { status: 'translating' });

  try {
    // FIRST: Translate any pending reviews for this product
    if (draft.scrapedProductId) {
      try {
        console.log(`Translating reviews for scraped product ${draft.scrapedProductId}...`);
        const { batchTranslateReviews } = await import('@/lib/ai/translate-reviews');
        const { getPendingTranslationReviews } = await import('@/lib/scraper/review-data');

        // Get pending reviews for this specific product
        const allPendingReviews = await getPendingTranslationReviews(100);
        const productPendingReviews = allPendingReviews.filter(
          (r) => r.scrapedProductId === draft.scrapedProductId
        );

        if (productPendingReviews.length > 0) {
          console.log(`Found ${productPendingReviews.length} pending reviews to translate`);
          // Translate reviews for this product (limit to 10 to avoid long wait times)
          await batchTranslateReviews(Math.min(productPendingReviews.length, 10));
        }
      } catch (error) {
        console.error('Failed to translate reviews:', error);
        // Continue even if review translation fails
      }
    }

    // THEN: Fetch translated reviews for review-enhanced product translation
    let reviews: Array<{ text: string; rating: number }> = [];
    if (draft.scrapedProductId) {
      try {
        const scrapedReviews = await getReviewsByScrapedProduct(draft.scrapedProductId);
        reviews = scrapedReviews
          .filter((r) => r.translationStatus === 'translated' && r.translatedText && r.rating >= 4) // Only positive, translated reviews with text
          .map((r) => ({ text: r.translatedText!, rating: r.rating }))
          .slice(0, 5); // Top 5 reviews

        if (reviews.length > 0) {
          console.log(`Using ${reviews.length} reviews for enhanced translation of draft ${draftId}`);
        }
      } catch (error) {
        console.error('Failed to fetch reviews for translation:', error);
        // Continue without reviews if fetch fails
      }
    }

    // Call AI translation with reviews
    const result = await translateProduct(
      {
        rawName: draft.rawName,
        rawDescription: draft.rawDescription,
        rawPriceText: draft.rawPriceText,
        rawSourceName: draft.rawSourceName,
      },
      reviews
    );

    // Save AI results
    const updated = await updateDraft(draftId, {
      aiName: result.name,
      aiDescription: result.description,
      aiShortDescription: result.shortDescription,
      aiCategory: result.category,
      aiSuggestedPrice: result.suggestedPriceCents,
      status: 'translated',
      translatedAt: new Date().toISOString(),
      aiModel: AI_MODEL,
      translationError: null,
    });

    return updated;
  } catch (error) {
    // On error: save error message, reset status to pending for retry
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Translation failed for draft ${draftId}:`, errorMessage);

    const updated = await updateDraft(draftId, {
      translationError: errorMessage,
      status: 'pending_translation',
    });

    return updated;
  }
}

/**
 * Batch translate pending drafts with rate limit awareness
 *
 * Processes drafts sequentially with a 4-second delay between calls
 * to stay within Gemini's free tier rate limits (15 RPM).
 *
 * @param limit - Maximum number of drafts to process (default: 5)
 * @returns Summary of batch operation results
 */
export async function batchTranslate(
  limit: number = 5
): Promise<{ translated: number; errors: number; errorDetails: string[] }> {
  const pendingDrafts = await getDraftsByStatus('pending_translation');
  const toProcess = pendingDrafts.slice(0, limit);

  let translated = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (let i = 0; i < toProcess.length; i++) {
    const draft = toProcess[i];

    try {
      await translateAndSaveDraft(draft.id);
      translated++;
    } catch (error) {
      errors++;
      const message = error instanceof Error ? error.message : String(error);
      errorDetails.push(`Draft ${draft.id} (${draft.rawName}): ${message}`);

      // If rate limited (429), stop processing remaining drafts
      if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
        errorDetails.push('Rate limited - stopping batch to avoid further 429 errors');
        break;
      }
    }

    // Add 4-second delay between calls (15 RPM = 4s interval)
    if (i < toProcess.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }

  return { translated, errors, errorDetails };
}
