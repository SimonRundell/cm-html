/**
 * @fileoverview Fetches search results and summaries from the MDN Web Docs API.
 * Used by the help drawer for live documentation lookup.
 *
 * Results are cached at module scope so repeated lookups for the same query
 * during a session do not generate additional network requests. The cache is
 * bounded by MAX_CACHE_SIZE using simple FIFO eviction.
 */

import config from '../config';

/**
 * Module-level cache for recent MDN search results, keyed by "query:limit".
 * Stored at module scope so it persists across component mounts/unmounts
 * for the lifetime of the browser session.
 * @type {Map<string, Object[]>}
 */
const mdnCache = new Map();

/** @type {number} Maximum number of distinct query results to keep in memory. */
const MAX_CACHE_SIZE = 20;

/**
 * Searches MDN for a given keyword and returns the top results.
 * Results are cached to avoid repeated API calls and to be respectful of
 * MDN's rate limits for unauthenticated requests.
 *
 * @param {string} query - The keyword or phrase to search (e.g. 'flex-direction').
 * @param {number} [limit=5] - Maximum number of results to return.
 * @returns {Promise<Array<{title: string, summary: string, url: string}>>}
 *   Array of result objects. Returns an empty array on network or API error.
 */
export async function searchMdn(query, limit = 5) {
  const cacheKey = `${query}:${limit}`;

  // Return cached result if available, avoiding a network round-trip
  if (mdnCache.has(cacheKey)) {
    return mdnCache.get(cacheKey);
  }

  try {
    const params = new URLSearchParams({
      q: query,
      locale: 'en-US',
      size: limit,
    });
    const response = await fetch(`${config.mdnSearchBase}?${params}`);
    if (!response.ok) throw new Error('MDN API error');
    const data = await response.json();

    const results = (data.documents || []).slice(0, limit).map(doc => ({
      title: doc.title,
      summary: doc.summary,
      url: `https://developer.mozilla.org${doc.mdn_url}`,
    }));

    // Evict oldest entry if the cache has reached capacity (FIFO)
    if (mdnCache.size >= MAX_CACHE_SIZE) {
      const firstKey = mdnCache.keys().next().value;
      mdnCache.delete(firstKey);
    }
    mdnCache.set(cacheKey, results);

    return results;
  } catch (err) {
    // Log so developers can diagnose MDN connectivity or API changes
    console.error('MDN search failed:', err); // eslint-disable-line no-console
    return [];
  }
}

/**
 * Builds the full MDN documentation URL for a given keyword and language type.
 * Returns a best-guess URL which the user can follow in a new tab. The URL
 * may not exist for every keyword — it is a convenience starting point.
 *
 * @param {string} keyword - The topic to link to (e.g. 'display', 'flex', 'querySelector').
 * @param {'css'|'html'|'js'} [type='html'] - The language context, used to select the correct MDN path prefix.
 * @returns {string} A full MDN documentation URL.
 */
export function mdnUrl(keyword, type = 'html') {
  const paths = {
    css: `CSS/${keyword}`,
    html: `HTML/Element/${keyword}`,
    js: `JavaScript/Reference/Global_Objects/${keyword}`,
  };
  return `${config.mdnPageBase}/${paths[type] || `HTML/Element/${keyword}`}`;
}
