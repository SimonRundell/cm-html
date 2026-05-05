/**
 * @fileoverview Renders a single reference entry from the bundled JSON data.
 * Conditionally displays only the sections that are present in the entry object
 * (syntax, attributes, values, parameters, returns, example, mdnPath) so the
 * same component works for HTML, CSS, and JS reference entries without branching.
 */

/**
 * @typedef {Object} ReferenceAttribute
 * @property {string} name - Attribute or parameter name.
 * @property {string} description - Human-readable description.
 */

/**
 * @typedef {Object} ReferenceEntry
 * @property {string} keyword - The lookup keyword (e.g. "div", "flex-direction").
 * @property {string} title - Display title shown in the drawer header.
 * @property {'html'|'css'|'js'} type - Language category; controls the badge colour.
 * @property {string} summary - One-paragraph description of the element/property/method.
 * @property {string} [syntax] - Optional syntax example shown in a code block.
 * @property {ReferenceAttribute[]} [attributes] - Optional list of HTML attributes.
 * @property {ReferenceAttribute[]} [values] - Optional list of accepted CSS values.
 * @property {ReferenceAttribute[]} [parameters] - Optional list of JS function parameters.
 * @property {string} [returns] - Optional return value description for JS methods.
 * @property {string} [example] - Optional code example shown in a code block.
 * @property {string} [mdnPath] - Optional MDN docs path suffix appended to the base MDN URL.
 */

/**
 * Displays the full detail view for a matched local reference entry.
 *
 * @param {Object} props
 * @param {ReferenceEntry} props.entry - The reference entry to display.
 * @returns {JSX.Element}
 */
export default function HelpDrawerContent({ entry }) {
  const typeBadgeClass = `help-badge help-badge-${entry.type}`;

  return (
    <div className="help-entry">
      <div className="help-entry-header">
        <h2 className="help-entry-title">{entry.title}</h2>
        <span className={typeBadgeClass}>{entry.type.toUpperCase()}</span>
      </div>

      <p className="help-entry-summary">{entry.summary}</p>

      {entry.syntax && (
        <div className="help-entry-section">
          <h4 className="help-entry-section-label">Syntax</h4>
          <pre className="help-code-block"><code>{entry.syntax}</code></pre>
        </div>
      )}

      {entry.attributes?.length > 0 && (
        <div className="help-entry-section">
          <h4 className="help-entry-section-label">Attributes</h4>
          <dl className="help-def-list">
            {entry.attributes.map(attr => (
              <div key={attr.name} className="help-def-row">
                <dt>{attr.name}</dt>
                <dd>{attr.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {entry.values?.length > 0 && (
        <div className="help-entry-section">
          <h4 className="help-entry-section-label">Values</h4>
          <dl className="help-def-list">
            {entry.values.map(v => (
              <div key={v.value} className="help-def-row">
                <dt>{v.value}</dt>
                <dd>{v.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {entry.parameters?.length > 0 && (
        <div className="help-entry-section">
          <h4 className="help-entry-section-label">Parameters</h4>
          <dl className="help-def-list">
            {entry.parameters.map(p => (
              <div key={p.name} className="help-def-row">
                <dt>{p.name}</dt>
                <dd>{p.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {entry.returns && (
        <div className="help-entry-section">
          <h4 className="help-entry-section-label">Returns</h4>
          <p className="help-entry-returns">{entry.returns}</p>
        </div>
      )}

      {entry.example && (
        <div className="help-entry-section">
          <h4 className="help-entry-section-label">Example</h4>
          <pre className="help-code-block help-code-example"><code>{entry.example}</code></pre>
        </div>
      )}

      {entry.mdnPath && (
        <div className="help-entry-mdn">
          <a
            href={`https://developer.mozilla.org/en-US/docs/Web/${entry.mdnPath}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on MDN →
          </a>
        </div>
      )}


    <div className="spr-credits">Created by Simon Rundell, Exeter College, Creative Commons BY-NC-SA 4.0 2026</div>
    </div>
  );
}
