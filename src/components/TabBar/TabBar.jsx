/**
 * @fileoverview Top tab bar switching between Editor, Preview, and Settings panes.
 * Tab definitions are declared as a constant array so adding a new top-level
 * pane only requires a single entry here rather than changes to JSX markup.
 * A separate "Learn" toggle button opens the TeachingDrawer overlay.
 */

import { Monitor, Code, Settings, BookOpen } from 'lucide-react';
import './TabBar.css';

const TABS = [
  { id: 'editor',  label: 'Editor',  Icon: Code },
  { id: 'preview', label: 'Preview', Icon: Monitor },
  { id: 'config',  label: 'Settings', Icon: Settings },
];

/**
 * Horizontal tab bar rendered below the toolbar.
 *
 * @param {Object} props
 * @param {'editor'|'preview'|'config'} props.activeTab - ID of the currently visible pane.
 * @param {Function} props.onTabChange - Called with the tab id string when the student clicks a tab.
 * @param {string} props.activeFileName - Displayed as a sub-label on the Editor tab so the student
 *   can see which file is open without looking at the file tree.
 * @param {boolean} props.isTeachingOpen - Whether the teaching drawer is currently open.
 * @param {Function} props.onTeachingToggle - Called when the student clicks the Learn button.
 * @returns {JSX.Element}
 */
export default function TabBar({ activeTab, onTabChange, activeFileName, isTeachingOpen, onTeachingToggle }) {
  return (
    <nav className="tab-bar">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`tab-bar-tab${activeTab === id ? ' active' : ''}`}
          onClick={() => onTabChange(id)}
        >
          <Icon size={14} />
          <span className="tab-bar-label">{label}</span>
          {id === 'editor' && activeFileName && (
            <span className="tab-bar-sublabel">{activeFileName}</span>
          )}
        </button>
      ))}

      {/* Teaching drawer toggle — visually separated from the pane tabs */}
      <div className="tab-bar-spacer" />
      <button
        className={`tab-bar-tab tab-bar-learn${isTeachingOpen ? ' active' : ''}`}
        onClick={onTeachingToggle}
        title="Open teaching reference"
      >
        <BookOpen size={14} />
        <span className="tab-bar-label">Learn</span>
      </button>
    </nav>
  );
}
