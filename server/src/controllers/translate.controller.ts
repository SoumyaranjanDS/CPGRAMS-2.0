import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { cache } from '../config/redis.js';

const GOOGLE_TRANSLATE_API_KEY =
  env.GOOGLE_TRANSLATE_API_KEY ||
  process.env.GOOGLE_TRANSLATE_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  '';

// In-memory fallback dictionary cache
const inMemoryTranslations: Record<string, string> = {};

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&nbsp;/g, ' ');
}

function getCacheKey(targetLang: string, text: string): string {
  const hash = crypto.createHash('md5').update(text.trim()).digest('hex');
  return `tr:${targetLang}:${hash}`;
}

/**
 * Controller: Batch translate an array of texts into the target Indian language
 * Route: POST /api/v1/translate
 */
export const translateBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { texts, targetLang, sourceLang = 'en' } = req.body;

    if (!targetLang || typeof targetLang !== 'string') {
      res.status(400).json({ success: false, message: 'targetLang is required.' });
      return;
    }

    // If target language is English, return identical mappings immediately
    if (targetLang === 'en' || !texts || !Array.isArray(texts) || texts.length === 0) {
      const identity: Record<string, string> = {};
      if (Array.isArray(texts)) {
        texts.forEach((t) => {
          if (typeof t === 'string') identity[t] = t;
        });
      }
      res.status(200).json({ success: true, targetLang, data: identity });
      return;
    }

    // Filter unique, non-empty, trimmed strings
    const uniqueTexts = Array.from(
      new Set(
        texts
          .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
          .map((t) => t.trim())
      )
    );

    const resultMap: Record<string, string> = {};
    const uncachedTexts: string[] = [];

    // Step 1: Check Redis & Memory Cache
    for (const text of uniqueTexts) {
      // Don't translate pure numbers or specific brand tokens
      if (/^\d+$/.test(text) || text === 'CPGRAMS' || text === 'CPGRAMS 2.0') {
        resultMap[text] = text;
        continue;
      }

      const cacheKey = getCacheKey(targetLang, text);
      let cachedVal: string | null = inMemoryTranslations[cacheKey] || null;

      if (!cachedVal) {
        try {
          cachedVal = await cache.get(cacheKey);
        } catch {}
      }

      if (cachedVal) {
        resultMap[text] = cachedVal;
        inMemoryTranslations[cacheKey] = cachedVal;
      } else {
        uncachedTexts.push(text);
      }
    }

    // Step 2: Fetch uncached texts from Google Cloud Translation API in batches (max 100 per request)
    if (uncachedTexts.length > 0 && GOOGLE_TRANSLATE_API_KEY) {
      const BATCH_SIZE = 80;
      for (let i = 0; i < uncachedTexts.length; i += BATCH_SIZE) {
        const batch = uncachedTexts.slice(i, i + BATCH_SIZE);
        try {
          const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
          const response = await axios.post(googleUrl, {
            q: batch,
            target: targetLang,
            source: sourceLang,
            format: 'text',
          });

          const translations = response.data?.data?.translations || [];
          for (let j = 0; j < batch.length; j++) {
            const original = batch[j];
            const rawTranslated = translations[j]?.translatedText || original;
            const decoded = decodeHtmlEntities(rawTranslated);

            resultMap[original] = decoded;

            // Cache in Redis & in-memory for 7 days (604800s)
            const cacheKey = getCacheKey(targetLang, original);
            inMemoryTranslations[cacheKey] = decoded;
            try {
              await cache.setex(cacheKey, 604800, decoded);
            } catch {}
          }
        } catch (apiError: any) {
          console.error(
            '[TranslateController] Google Translation API error:',
            apiError.response?.data || apiError.message
          );
          // Fallback to original text on API rate limit or error
          batch.forEach((txt) => {
            if (!resultMap[txt]) resultMap[txt] = txt;
          });
        }
      }
    } else if (uncachedTexts.length > 0) {
      // Fallback if no API key configured
      uncachedTexts.forEach((txt) => {
        if (!resultMap[txt]) resultMap[txt] = txt;
      });
    }

    res.status(200).json({
      success: true,
      targetLang,
      data: resultMap,
    });
  } catch (error: any) {
    console.error('[TranslateController] translateBatch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Controller: Translate a single text
 * Route: POST /api/v1/translate/single
 */
export const translateSingle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, targetLang, sourceLang = 'en' } = req.body;

    if (!text || !targetLang) {
      res.status(400).json({ success: false, message: 'text and targetLang are required.' });
      return;
    }

    if (targetLang === 'en') {
      res.status(200).json({ success: true, targetLang, data: { translatedText: text } });
      return;
    }

    const trimmed = text.trim();
    const cacheKey = getCacheKey(targetLang, trimmed);

    let cachedVal: string | null = inMemoryTranslations[cacheKey] || null;
    if (!cachedVal) {
      try {
        cachedVal = await cache.get(cacheKey);
      } catch {}
    }

    if (cachedVal) {
      res.status(200).json({
        success: true,
        targetLang,
        data: { translatedText: cachedVal },
      });
      return;
    }

    if (GOOGLE_TRANSLATE_API_KEY) {
      const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
      const response = await axios.post(googleUrl, {
        q: [trimmed],
        target: targetLang,
        source: sourceLang,
        format: 'text',
      });

      const rawTranslated = response.data?.data?.translations?.[0]?.translatedText || trimmed;
      const decoded = decodeHtmlEntities(rawTranslated);

      inMemoryTranslations[cacheKey] = decoded;
      try {
        await cache.setex(cacheKey, 604800, decoded);
      } catch {}

      res.status(200).json({
        success: true,
        targetLang,
        data: { translatedText: decoded },
      });
      return;
    }

    res.status(200).json({
      success: true,
      targetLang,
      data: { translatedText: trimmed },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
