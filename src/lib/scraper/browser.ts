/**
 * Headless browser service using Playwright
 * Provides singleton browser instance for efficient scraping of JavaScript-heavy pages
 */

import type { Browser, Page } from 'playwright';

// =============================================================================
// Browser Instance Management
// =============================================================================

let browserInstance: Browser | null = null;

/**
 * Get or create singleton browser instance
 * Reuses browser across multiple scraping operations for performance
 *
 * Playwright is a devDependency: it is available locally for admin/dev
 * scraping but is not installed in serverless production deployments
 * (Chromium cannot launch there anyway), hence the lazy import.
 */
export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  let chromium: typeof import('playwright').chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error(
      'Playwright is not available in this environment. Scraping must be run locally or from a dedicated worker.'
    );
  }

  // Launch browser with options
  browserInstance = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  return browserInstance;
}

/**
 * Close the browser instance (cleanup)
 * Call this when shutting down the application
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// =============================================================================
// Page Fetching with JavaScript Rendering
// =============================================================================

/**
 * Fetch a page with Playwright (renders JavaScript)
 * Waits for specified selector to ensure content is loaded
 *
 * @param url - URL to fetch
 * @param waitForSelector - CSS selector to wait for (optional, defaults to body)
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns HTML content after JavaScript rendering
 */
export async function fetchWithBrowser(
  url: string,
  waitForSelector: string = 'body',
  timeout: number = 30000
): Promise<string> {
  const browser = await getBrowser();
  const page: Page = await browser.newPage();

  try {
    // Set User-Agent to avoid being blocked
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    // Navigate to page with network idle detection
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout,
    });

    // Wait for specific selector to ensure content is loaded
    try {
      await page.waitForSelector(waitForSelector, { timeout: 5000 });
    } catch {
      // Continue even if selector not found (fallback to network idle)
      console.warn(`Selector "${waitForSelector}" not found on ${url}, continuing anyway`);
    }

    // Get the full HTML content
    const html = await page.content();

    return html;
  } finally {
    // Always close the page to avoid memory leaks
    await page.close();
  }
}

/**
 * Fetch a page and extract data with custom evaluation function
 * Allows running JavaScript in the page context to extract data
 *
 * @param url - URL to fetch
 * @param evaluateFn - Function to run in page context
 * @param timeout - Timeout in milliseconds
 * @returns Result of evaluation function
 */
export async function fetchAndEvaluate<T>(
  url: string,
  evaluateFn: () => T,
  timeout: number = 30000
): Promise<T> {
  const browser = await getBrowser();
  const page: Page = await browser.newPage();

  try {
    // Set User-Agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
    });

    // Navigate to page
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout,
    });

    // Run evaluation function in page context
    const result = await page.evaluate(evaluateFn);

    return result;
  } finally {
    await page.close();
  }
}
