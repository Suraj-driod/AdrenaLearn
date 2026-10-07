/**
 * SerpApi Search & Live Website Scanner Service
 *
 * Responsibilities:
 * 1. Query SerpApi Google Search endpoint
 * 2. Parse organic_results
 * 3. Manually filter out social media / non-educational links (instagram, youtube, facebook, reddit, X/twitter)
 * 4. Extract top 3 valid website items (link, title, snippet)
 * 5. Fetch and scan the 3 websites directly to extract clean, readable text
 * 6. Fallback gracefully to SerpApi's search snippet if a site times out or blocks requests
 * 7. Format scanned website context for Gemini Flash 3.5 Lite
 */

const EXCLUDED_PATTERNS = [
  /instagram(\.com)?/i,
  /youtube(\.com)?|youtu\.be/i,
  /facebook(\.com)?|fb\.com/i,
  /reddit(\.com)?/i,
  /(^|\.)x\.com(\/|$)|twitter(\.com)?/i,
];

/**
 * Manually check if a link belongs to an excluded social platform
 * (instagram, youtube, facebook, reddit, X)
 */
export function isExcludedLink(url) {
  if (!url || typeof url !== 'string') return true;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();
    const full = url.toLowerCase();

    // Check excluded domains and patterns
    for (const pattern of EXCLUDED_PATTERNS) {
      if (pattern.test(hostname) || pattern.test(pathname) || pattern.test(full)) {
        return true;
      }
    }

    // Specific check for 'x.com'
    if (hostname === 'x.com' || hostname.endsWith('.x.com')) {
      return true;
    }

    return false;
  } catch (err) {
    return true;
  }
}

/**
 * Clean raw HTML into concise, readable plain text for AI scanning
 */
export function extractTextFromHtml(html) {
  if (!html || typeof html !== 'string') return '';

  return html
    // Remove scripts and inline code
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    // Remove stylesheet blocks
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    // Remove svg vector icons
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    // Remove noscript elements
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    // Remove navigation headers, footers, sidebars that add noise
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    // Replace html tags with spaces
    .replace(/<[^>]+>/g, ' ')
    // Decode common entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Collapse excess whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch and scan a single website URL directly, extracting its readable content.
 * If the website times out or blocks scraping, seamlessly falls back to the SerpApi snippet.
 */
export async function scanWebsite(url, fallbackSnippet = '', maxChars = 3500) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        Connection: 'close',
      },
      signal: AbortSignal.timeout(10000), // 10-second timeout as requested
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html') || contentType.includes('text/plain')) {
        let html = '';
        if (res.body && typeof res.body.getReader === 'function') {
          const reader = res.body.getReader();
          const decoder = new TextDecoder('utf-8');
          while (html.length < 100000) {
            const { done, value } = await reader.read();
            if (done) break;
            html += decoder.decode(value, { stream: true });
          }
          try { reader.cancel(); } catch (_) {}
        } else {
          html = await res.text();
        }

        const cleanText = extractTextFromHtml(html);

        if (cleanText && cleanText.length > 50) {
          return {
            url,
            content: cleanText.slice(0, maxChars),
            isFullScan: true,
          };
        }
      }
    }
  } catch (err) {
    // Graceful fallback without alarming console errors when external sites are slow or protected
  }

  // Fallback to SerpApi snippet if site timed out or rejected fetch
  return {
    url,
    content: fallbackSnippet || '',
    isFullScan: false,
  };
}

/**
 * Execute SerpApi search, extract organic_results, manually filter out excluded platforms,
 * and return top 3 clean website items (link, title, snippet)
 */
export async function fetchSerpApiItems(query) {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    console.warn('[SerpApi] No SERPAPI_API_KEY found in environment.');
    return [];
  }

  const endpoint = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    query
  )}&api_key=${apiKey}`;

  console.log(`\n================== [SerpApi SEARCH] ==================`);
  console.log(`[SerpApi] Initiating Google search for: "${query}"`);

  const res = await fetch(endpoint, {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error(`[SerpApi] Request failed (${res.status}):`, errText);
    return [];
  }

  const data = await res.json();
  const organicResults = Array.isArray(data.organic_results) ? data.organic_results : [];

  console.log(`[SerpApi] Total raw organic results returned: ${organicResults.length}`);
  organicResults.forEach((item, idx) => {
    console.log(`  [Result ${idx + 1}] Title: ${item.title}`);
    console.log(`             Link:  ${item.link}`);
    console.log(`             Snippet: ${item.snippet ? item.snippet.slice(0, 100) + '...' : '(no snippet)'}`);
  });

  // Manually filter links: remove instagram, youtube, facebook, reddit, X
  const filteredItems = [];
  for (const item of organicResults) {
    const link = item?.link;
    if (link && !isExcludedLink(link)) {
      filteredItems.push({
        link,
        title: item.title || '',
        snippet: item.snippet || '',
      });
      if (filteredItems.length === 3) {
        break;
      }
    }
  }

  console.log(`[SerpApi] Filtered items (excluding social/video platforms): ${filteredItems.length}`);

  // Fallback: If user searched specifically for a creator, channel, or community topic
  // where ALL results are on social/video platforms, fall back to top 3 organic results with snippets
  if (filteredItems.length === 0 && organicResults.length > 0) {
    console.log(`[SerpApi] Note: All results matched social filter (likely a creator, YouTube, or community query).`);
    console.log(`[SerpApi] Falling back to top ${Math.min(3, organicResults.length)} organic results using Google search snippets.`);
    for (const item of organicResults.slice(0, 3)) {
      if (item?.link) {
        filteredItems.push({
          link: item.link,
          title: item.title || '',
          snippet: item.snippet || '',
          useSnippetOnly: true,
        });
      }
    }
  }

  console.log(`[SerpApi] Final selected items for knowledge scan:`, filteredItems.map(f => f.link));
  console.log(`=======================================================\n`);

  return filteredItems;
}

/**
 * Convenience helper returning only the filtered links
 */
export async function fetchSerpApiLinks(query) {
  const items = await fetchSerpApiItems(query);
  return items.map((i) => i.link);
}

/**
 * Complete workflow:
 * 1. Search SerpApi for query
 * 2. Manually filter links (exclude instagram, youtube, facebook, reddit, X)
 * 3. Scan the 3 websites directly (with graceful snippet fallback if site times out)
 * 4. Format context for Gemini Flash
 */
export async function getWebDataForQuery(query) {
  try {
    const items = await fetchSerpApiItems(query);

    if (!items || items.length === 0) {
      console.log(`[SerpScanner] No web items available for query "${query}".`);
      return {
        links: [],
        scannedSites: [],
        scannedContext: '',
        hasWebData: false,
      };
    }

    const links = items.map((item) => item.link);

    // Scan all filtered websites in parallel, with snippet fallback if a site is slow or restricted
    const scanPromises = items.map((item) => {
      const fallbackSnippet = `${item.title ? item.title + ': ' : ''}${item.snippet || ''}`;
      // If marked to use snippet only (e.g. YouTube video or Reddit thread), avoid scanning heavy JS/video page
      if (item.useSnippetOnly) {
        return Promise.resolve({
          url: item.link,
          content: fallbackSnippet,
          isFullScan: false,
        });
      }
      return scanWebsite(item.link, fallbackSnippet);
    });

    const scanResults = await Promise.allSettled(scanPromises);

    const scannedSites = [];
    for (let i = 0; i < scanResults.length; i++) {
      const res = scanResults[i];
      if (res.status === 'fulfilled' && res.value && res.value.content) {
        scannedSites.push(res.value);
        console.log(`[SerpScanner] Source ${i + 1} (${res.value.url}): ${res.value.isFullScan ? 'Full page scanned' : 'Google snippet used'} (${res.value.content.length} chars)`);
      } else {
        const fallbackText = `${items[i].title ? items[i].title + ': ' : ''}${items[i].snippet}`;
        if (fallbackText.trim()) {
          scannedSites.push({
            url: items[i].link,
            content: fallbackText,
            isFullScan: false,
          });
          console.log(`[SerpScanner] Source ${i + 1} (${items[i].link}): Fallback snippet used`);
        }
      }
    }

    // Format context for prompt
    let scannedContext = '';
    if (scannedSites.length > 0) {
      scannedContext = scannedSites
        .map(
          (site, idx) =>
            `[Website ${idx + 1}: ${site.url}]\n${site.content}`
        )
        .join('\n\n---\n\n');
    }

    return {
      links,
      scannedSites,
      scannedContext,
      hasWebData: scannedSites.length > 0,
    };
  } catch (error) {
    console.error('[SerpApi] getWebDataForQuery error:', error);
    return {
      links: [],
      scannedSites: [],
      scannedContext: '',
      hasWebData: false,
    };
  }
}

/**
 * Query SerpApi Google Images API, limiting results (default 2)
 * Returns array of { thumbnail, title, link }
 */
export async function fetchGoogleImages(query, limit = 2) {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    console.warn('[SerpApi Images] No SERPAPI_API_KEY found in environment.');
    return [];
  }

  const endpoint = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(
    query
  )}&api_key=${apiKey}`;

  console.log(`\n================== [SerpApi GOOGLE IMAGES SEARCH] ==================`);
  console.log(`[SerpApi Images] Fetching images for: "${query}" (limit ${limit})`);

  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[SerpApi Images] Request failed (${res.status}):`, errText);
      return [];
    }

    const data = await res.json();
    const results = Array.isArray(data.images_results) ? data.images_results : [];

    const limited = results.slice(0, limit).map((img) => ({
      thumbnail: img.thumbnail || '',
      title: img.title || '',
      link: img.link || '',
    }));

    console.log(`[SerpApi Images] Found ${results.length} total images, returning top ${limited.length}:`, limited);
    console.log(`===================================================================\n`);

    return limited;
  } catch (err) {
    console.error('[SerpApi Images] Fetch error:', err.message);
    return [];
  }
}

