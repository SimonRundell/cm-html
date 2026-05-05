/**
 * @fileoverview Debounced auto-save hook.
 * Saves project state to localStorage after a configurable delay on any content change.
 * Using a ref for the timer (rather than state) avoids triggering extra renders
 * when the timeout is cleared and reset.
 */

import { useEffect, useRef } from 'react';
import config from '../config';

/**
 * Triggers an auto-save callback after debouncing.
 *
 * Each time `watchValue` changes the previous timer is cancelled and a new one
 * is started. This prevents saving on every keystroke and instead waits until
 * the student has stopped typing for `delay` milliseconds.
 *
 * @param {Function} saveFn - The function to call to persist state (no arguments).
 * @param {any} watchValue - The value to watch for changes (typically active file content).
 * @param {number} [delay=config.debounceMs] - Debounce delay in milliseconds.
 * @returns {void}
 */
export function useAutoSave(saveFn, watchValue, delay = config.debounceMs) {
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveFn();
    }, delay);

    // Clear the pending save if the component unmounts mid-debounce
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [watchValue]); // eslint-disable-line react-hooks/exhaustive-deps
  // saveFn and delay are intentionally omitted: including them would restart
  // the timer on every render, defeating the debounce.
}
