/**
 * @fileoverview Manages contextual help state.
 * Looks up a selected keyword in bundled reference data, then falls back to MDN.
 * A ref-based LRU cache limits the number of MDN requests that are stored in
 * memory per session, evicting the oldest entry when the limit is reached.
 */

import { useState, useCallback, useRef } from 'react';
import htmlRef from '../data/htmlReference.json';
import cssRef  from '../data/cssReference.json';
import jsRef   from '../data/jsReference.json';
import { searchMdn } from '../utils/mdnApi';

/** @type {Object[]} Combined reference array for fast linear lookup at startup time. */
const allRefs = [...htmlRef, ...cssRef, ...jsRef];

/**
 * Maximum number of MDN result sets to keep in the per-session cache.
 * Using a ref (not module-level state) means the cache resets on page reload.
 * @type {number}
 */
const MDN_CACHE_LIMIT = 20;

/**
 * Finds a reference entry by keyword (case-insensitive, strips punctuation).
 * Punctuation is stripped so that e.g. "<div>" matches "div" in the reference data.
 * @param {string} keyword - Raw keyword string from editor selection.
 * @returns {Object|null} The matching reference entry, or null if not found.
 */
function findLocalRef(keyword) {
  const clean = keyword.toLowerCase().replace(/[^a-z0-9-_.]/g, '');
  return allRefs.find(r => r.keyword.toLowerCase() === clean) || null;
}

/**
 * @typedef {Object} ContextualHelpState
 * @property {boolean} isOpen - Whether the help drawer is visible.
 * @property {Object|null} helpEntry - Matched local reference entry, or null.
 * @property {Object[]} mdnResults - Live MDN search results (may be empty while loading).
 * @property {boolean} isLoading - True while an MDN fetch is in flight.
 * @property {string} searchQuery - The most recently searched keyword, used to key the input.
 * @property {Function} setSearchQuery - Directly update the search query string.
 * @property {Function} lookupKeyword - Trigger a lookup for a given keyword string.
 * @property {Function} manualSearch - Alias for lookupKeyword, called from the search box.
 * @property {Function} openDrawer - Open the help drawer without performing a lookup.
 * @property {Function} closeDrawer - Close the help drawer.
 */

/**
 * useContextualHelp hook. Provides all state and actions needed to drive the
 * HelpDrawer component from anywhere in the tree.
 *
 * @returns {ContextualHelpState}
 */
export function useContextualHelp() {
  const [isOpen, setIsOpen]         = useState(false);
  const [helpEntry, setHelpEntry]   = useState(null);
  const [mdnResults, setMdnResults] = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /** Cache MDN results to avoid repeated API calls for the same keyword. */
  const mdnCache = useRef(new Map());

  /**
   * Looks up a keyword. Opens the drawer immediately with any local reference data,
   * then fetches MDN results asynchronously so the drawer is never blocked on the network.
   * @param {string} keyword - The word or token to look up.
   * @returns {Promise<void>}
   */
  const lookupKeyword = useCallback(async (keyword) => {
    if (!keyword || keyword.trim().length < 2) return;
    const trimmed = keyword.trim();
    setSearchQuery(trimmed);
    setIsOpen(true);

    const local = findLocalRef(trimmed);
    setHelpEntry(local);

    // Serve from cache if available, skipping the network entirely
    if (mdnCache.current.has(trimmed)) {
      setMdnResults(mdnCache.current.get(trimmed));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMdnResults([]);
    try {
      const results = await searchMdn(trimmed, 5);
      // Evict oldest entry if cache is full (simple FIFO eviction)
      if (mdnCache.current.size >= MDN_CACHE_LIMIT) {
        const firstKey = mdnCache.current.keys().next().value;
        mdnCache.current.delete(firstKey);
      }
      mdnCache.current.set(trimmed, results);
      setMdnResults(results);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Perform a manual search triggered from the drawer's search box.
   * Delegates to lookupKeyword so caching and local lookup apply identically.
   * @param {string} query - The search term entered by the student.
   * @returns {Promise<void>}
   */
  const manualSearch = useCallback((query) => {
    lookupKeyword(query);
  }, [lookupKeyword]);

  /** @type {Function} Opens the help drawer without triggering a lookup. */
  const openDrawer  = useCallback(() => setIsOpen(true),  []);

  /** @type {Function} Closes the help drawer. */
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    helpEntry,
    mdnResults,
    isLoading,
    searchQuery,
    setSearchQuery,
    lookupKeyword,
    manualSearch,
    openDrawer,
    closeDrawer,
  };
}
