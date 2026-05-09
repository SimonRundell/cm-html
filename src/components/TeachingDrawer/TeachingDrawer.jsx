/**
 * @fileoverview Wide slide-in teaching drawer.
 * Two-column layout: a chapter navigation sidebar on the left, scrollable content on the right.
 * Supports full-text search across chapter titles, intros, and section content.
 *
 * Renders always-in-DOM (like HelpDrawer) so the CSS slide transition plays correctly.
 * Hidden via transform when closed.
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { X, Search, BookOpen, ChevronRight } from 'lucide-react';
import { CHAPTERS } from './teachingContent';
import './TeachingDrawer.css';

// ─── Sub-components ────────────────────────────────────────────

/**
 * Renders a single code block with a copy-to-clipboard button.
 * @param {Object} props
 * @param {string} props.code
 */
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="td-code-wrap">
      <button className="td-copy-btn" onClick={handleCopy} title="Copy code">
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="td-code-block"><code>{code}</code></pre>
    </div>
  );
}

/**
 * Renders a data table from a section's table definition.
 * @param {Object} props
 * @param {{ headers: string[], rows: string[][] }} props.table
 */
function SectionTable({ table }) {
  return (
    <table className="td-table">
      <thead>
        <tr>
          {table.headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>
                {j === 0 ? <code>{cell}</code> : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Renders a single chapter section: title, content, optional code, optional table, optional tips.
 * @param {Object} props
 * @param {Object} props.section - Section data object from teachingContent.js
 */
function Section({ section }) {
  return (
    <div className="td-section">
      <h2 className="td-section-title">{section.title}</h2>
      {section.content && (
        <p className="td-section-content">{section.content}</p>
      )}
      {section.code && <CodeBlock code={section.code} />}
      {section.table && <SectionTable table={section.table} />}
      {section.tips && section.tips.map((tip, i) => (
        <div key={i} className="td-tip">
          <span className="td-tip-icon">💡</span>
          <p>{tip}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────

/**
 * Slide-in teaching reference drawer.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the drawer is visible.
 * @param {Function} props.onClose - Called when the student closes the drawer.
 * @returns {JSX.Element}
 */
export default function TeachingDrawer({ isOpen, onClose }) {
  const [activeChapterId, setActiveChapterId] = useState(CHAPTERS[0].id);
  const [searchQuery, setSearchQuery]         = useState('');
  const contentRef  = useRef(null);
  const searchRef   = useRef(null);

  /** Filter chapters whose title, intro, or section text matches the search query. */
  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CHAPTERS;
    return CHAPTERS.filter(ch =>
      ch.title.toLowerCase().includes(q) ||
      ch.badge.toLowerCase().includes(q) ||
      ch.intro.toLowerCase().includes(q) ||
      ch.sections.some(s =>
        s.title.toLowerCase().includes(q) ||
        (s.content && s.content.toLowerCase().includes(q))
      )
    );
  }, [searchQuery]);

  /** The chapter being shown in the content panel. Falls back gracefully if search has hidden it. */
  const activeChapter =
    CHAPTERS.find(ch => ch.id === activeChapterId) || CHAPTERS[0];

  /** Scroll the content area back to the top whenever the chapter changes. */
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeChapterId]);

  /** Focus the search box when the drawer opens. */
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 300);
    }
  }, [isOpen]);

  /** Handle Escape key to close the drawer. */
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleChapterSelect = useCallback((id) => {
    setActiveChapterId(id);
    setSearchQuery('');
  }, []);

  return (
    <div
      className={`teaching-drawer${isOpen ? ' open' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-label="Teaching Reference"
    >
      {/* ── Left sidebar ─────────────────────────────── */}
      <aside className="td-sidebar">
        <div className="td-sidebar-header">
          <BookOpen size={15} className="td-logo-icon" />
          <span className="td-sidebar-title">Learn</span>
          <button className="td-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={15} />
          </button>
        </div>

        <div className="td-search-wrap">
          <Search size={12} className="td-search-icon" />
          <input
            ref={searchRef}
            type="search"
            className="td-search-input"
            placeholder="Search topics…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <nav className="td-chapter-list">
          {filteredChapters.map(ch => (
            <button
              key={ch.id}
              className={`td-chapter-btn${activeChapterId === ch.id ? ' active' : ''}`}
              onClick={() => handleChapterSelect(ch.id)}
            >
              <span
                className="td-chapter-badge"
                style={{ backgroundColor: ch.color + '33', color: ch.color }}
              >
                {ch.badge}
              </span>
              <span className="td-chapter-name">{ch.title}</span>
              {activeChapterId === ch.id && (
                <ChevronRight size={12} className="td-chapter-arrow" />
              )}
            </button>
          ))}

          {filteredChapters.length === 0 && (
            <p className="td-no-results">
              No topics match <strong>"{searchQuery}"</strong>
            </p>
          )}
        </nav>
      </aside>

      {/* ── Right content area ───────────────────────── */}
      <div className="td-content" ref={contentRef}>
        <div className="td-content-inner">
          {/* Chapter header */}
          <div className="td-chapter-header">
            <span
              className="td-chapter-badge-lg"
              style={{
                backgroundColor: activeChapter.color + '33',
                color: activeChapter.color,
              }}
            >
              {activeChapter.badge}
            </span>
            <h1 className="td-chapter-title">{activeChapter.title}</h1>
          </div>

          <p className="td-chapter-intro">{activeChapter.intro}</p>

          {/* Sections */}
          {activeChapter.sections.map((section, i) => (
            <Section key={i} section={section} />
          ))}

          {/* Key points callout */}
          {activeChapter.keyPoints?.length > 0 && (
            <div className="td-key-points">
              <h3 className="td-key-points-title">Key Points</h3>
              <ul className="td-key-points-list">
                {activeChapter.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Chapter navigation footer */}
          <div className="td-chapter-nav">
            {(() => {
              const idx = CHAPTERS.findIndex(ch => ch.id === activeChapterId);
              const prev = CHAPTERS[idx - 1];
              const next = CHAPTERS[idx + 1];
              return (
                <>
                  {prev ? (
                    <button
                      className="td-nav-btn td-nav-prev"
                      onClick={() => handleChapterSelect(prev.id)}
                    >
                      ← {prev.title}
                    </button>
                  ) : <span />}
                  {next && (
                    <button
                      className="td-nav-btn td-nav-next"
                      onClick={() => handleChapterSelect(next.id)}
                    >
                      {next.title} →
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
