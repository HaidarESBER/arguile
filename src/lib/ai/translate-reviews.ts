/**
 * AI Review Translation Service
 *
 * Translates customer reviews from external sources to natural French
 * using OpenRouter (free models). Maintains original sentiment and tone.
 */

import {
  getPendingTranslationReviews,
  updateReviewTranslation,
  markReviewTranslationFailed,
} from '@/lib/scraper/review-data';

// Use GPT-4o Mini - cheap, fast, and reliable
const AI_MODEL = 'openai/gpt-4o-mini'; // OpenAI's cheapest model

const TRANSLATION_SYSTEM_PROMPT = `Tu es un traducteur expert specialise dans les avis clients pour produits e-commerce.

Ton objectif:
- Traduire les avis clients en francais naturel et fluide
- Conserver le sentiment original (positif, negatif, neutre)
- Garder le ton authentique et conversationnel
- Adapter les expressions idiomatiques au francais
- Ne jamais inventer ou ajouter du contenu

Regles:
- Traduis TOUJOURS en francais
- Reste fidele au sens original
- Utilise un francais naturel, pas de traduction mot-a-mot
- Conserve les details techniques et noms de produits
- Si l'avis est deja en francais, retourne-le tel quel`;

/**
 * Translate a single review to French
 *
 * @param text - Review text in original language
 * @param language - Original language code (optional)
 * @returns French translation
 */
export async function translateReview(text: string, language?: string | null): Promise<string> {
  // If already in French, return as-is
  if (language === 'fr') {
    return text;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const userPrompt = language
    ? `Traduis cet avis produit du ${language} vers le francais naturel:\n\n${text}`
    : `Traduis cet avis produit en francais naturel:\n\n${text}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nuage.fr', // Optional: for rankings
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 512,
      temperature: 0.3, // Lower temp for more consistent translations
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // AGGRESSIVE DEBUG LOGGING
  console.log('=== OPENROUTER RESPONSE START ===');
  console.log('Full response:', JSON.stringify(data, null, 2));
  console.log('Choices:', data.choices);
  console.log('First choice:', data.choices?.[0]);
  console.log('Message:', data.choices?.[0]?.message);
  console.log('Content:', data.choices?.[0]?.message?.content);
  console.log('=== OPENROUTER RESPONSE END ===');

  // Debug logging
  if (!data.choices || data.choices.length === 0) {
    console.error('OpenRouter API returned no choices:', JSON.stringify(data));
    throw new Error(`OpenRouter API error: ${JSON.stringify(data)}`);
  }

  const translatedText = data.choices?.[0]?.message?.content;

  if (!translatedText || translatedText.trim().length === 0) {
    console.error('OpenRouter returned empty content. Full response:', JSON.stringify(data));
    throw new Error('No text content in AI response');
  }

  return translatedText.trim();
}

/**
 * Batch translate pending reviews
 * Processes up to `limit` reviews with rate limiting
 *
 * @param limit - Maximum number of reviews to translate (default: 10)
 * @returns Object with counts of translated and failed reviews
 */
export async function batchTranslateReviews(
  limit: number = 10
): Promise<{
  translated: number;
  errors: number;
  errorDetails: string[];
}> {
  const result = {
    translated: 0,
    errors: 0,
    errorDetails: [] as string[],
  };

  // Get pending reviews - fetch more than limit to ensure we get image reviews
  const pendingReviews = await getPendingTranslationReviews(limit * 3);

  if (pendingReviews.length === 0) {
    console.log('No pending reviews to translate');
    return result;
  }

  // PRIORITIZE REVIEWS WITH IMAGES - these are most valuable!
  const reviewsWithImages = pendingReviews.filter(r => r.reviewImages && r.reviewImages.length > 0);
  const reviewsWithoutImages = pendingReviews.filter(r => !r.reviewImages || r.reviewImages.length === 0);

  // Process image reviews first, then text-only reviews
  const sortedReviews = [...reviewsWithImages, ...reviewsWithoutImages].slice(0, limit);

  console.log(`🖼️  Translating ${sortedReviews.length} reviews (${reviewsWithImages.length} with images prioritized)...`);

  // Translate each review sequentially with rate limiting
  for (const review of sortedReviews) {
    try {
      // Skip empty reviews (rating-only reviews with no text)
      if (!review.reviewText || review.reviewText.trim().length === 0) {
        console.log(`Skipping empty review ${review.id} (rating-only)`);
        // Mark as translated with empty text (so it doesn't retry)
        await updateReviewTranslation(review.id, '', 'translated');
        result.translated++;
        continue;
      }

      // Translate review
      const translatedText = await translateReview(review.reviewText, review.originalLanguage);

      // Save translation
      await updateReviewTranslation(review.id, translatedText, 'translated');

      result.translated++;

      console.log(`Translated review ${review.id} (${review.rating} stars)`);

      // Rate limiting: 4 seconds between calls (15 RPM for free tier)
      if (sortedReviews.indexOf(review) < sortedReviews.length - 1) {
        await sleep(4000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to translate review ${review.id}:`, errorMessage);

      // Mark as failed
      await markReviewTranslationFailed(review.id, errorMessage);

      result.errors++;
      result.errorDetails.push(`Review ${review.id}: ${errorMessage}`);
    }
  }

  console.log(`Translation complete: ${result.translated} translated, ${result.errors} errors`);

  return result;
}

/**
 * Sleep for given milliseconds (for rate limiting)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
