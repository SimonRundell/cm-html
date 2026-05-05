/**
 * @fileoverview Slide-in contextual help drawer.
 * Shows local reference data for the selected keyword and live MDN search results.
 *
 * The drawer is always rendered in the DOM (for CSS transition performance) but
 * is hidden via the `open` class and `aria-hidden` when closed. The search input
 * uses `key={searchQuery}` so React resets its value whenever a new keyword is
 * looked up from the editor, while still allowing the student to type freely.
 */

import { useRef } from 'react';
import { X, Search } from 'lucide-react';
import HelpDrawerContent from './HelpDrawerContent';
import './HelpDrawer.css';

/**
 * Slide-in help drawer rendered as an overlay on the right side of the editor pane.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the open/closed CSS state of the drawer.
 * @param {Function} props.onClose - Called when the student clicks the X button.
 * @param {Object|null} props.helpEntry - Local reference entry to display, or null if none matched.
 * @param {Object[]} props.mdnResults - Live MDN search result objects: { title, summary, url }.
 * @param {boolean} props.isLoading - True while MDN results are being fetched; shows a loading message.
 * @param {string} props.searchQuery - The keyword most recently looked up; used to key and pre-fill the search input.
 * @param {Function} props.onSearch - Called with the search string when the student submits the search form.
 * @returns {JSX.Element}
 */
export default function HelpDrawer({
  isOpen,
  onClose,
  helpEntry,
  mdnResults,
  isLoading,
  searchQuery,
  onSearch,
}) {
  const inputRef = useRef(null);

  /**
   * Reads the current value of the uncontrolled search input and fires the
   * search callback. Using an uncontrolled input with a ref avoids re-rendering
   * the entire drawer on every keystroke while the student types.
   * @param {React.FormEvent} e
   */
  function handleSearchSubmit(e) {
    e.preventDefault();
    const val = inputRef.current?.value.trim();
    if (val) onSearch(val);
  }

  return (
    <div className={`help-drawer${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
      <div className="help-drawer-header">
        <span className="help-drawer-title">Help</span>
        <form className="help-drawer-search" onSubmit={handleSearchSubmit}>
          <Search size={13} className="help-search-icon" />
          <input
            ref={inputRef}
            type="search"
            className="help-search-input"
            placeholder="Search docs…"
            defaultValue={searchQuery}
            key={searchQuery}
          />
        </form>
        <button className="help-drawer-close" onClick={onClose} title="Close help">
          <X size={16} />
        </button>
      </div>

      <div className="help-drawer-body">
        {helpEntry ? (
          <HelpDrawerContent entry={helpEntry} />
        ) : (
          searchQuery && (
            <p className="help-no-local">
              No built-in reference found for <strong>{searchQuery}</strong>.
            </p>
          )
        )}

        {(mdnResults.length > 0 || isLoading) && (
          <div className="help-mdn-section">
            <h4 className="help-mdn-heading">MDN Web Docs</h4>
            {isLoading && <p className="help-loading">Searching MDN…</p>}
            {mdnResults.map(r => (
              <div key={r.url} className="mdn-result">
                <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
                <p>{r.summary}</p>
              </div>
            ))}
          </div>
        )}

        {!helpEntry && !isLoading && mdnResults.length === 0 && !searchQuery && (
          <div className="help-empty">
            <p>Select a word in the editor to look it up, or use the search box above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
