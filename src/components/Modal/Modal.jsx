/**
 * @fileoverview Reusable modal dialog rendered via a React portal.
 * Supports 'alert' (single OK button) and 'confirm' (Cancel + Confirm buttons).
 *
 * Rendering into document.body via createPortal ensures the modal always
 * appears on top of all other content regardless of CSS stacking contexts in
 * the component tree. Keyboard handling (Escape/Enter) is attached as a window
 * listener only while the modal is open so it does not interfere with the editor.
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * Generic modal dialog that supports alert and confirm interaction patterns.
 * Rendered into document.body via a React portal to escape local stacking contexts.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - When false the component returns null; when true the modal is shown.
 * @param {string} props.title - Heading text displayed at the top of the modal box.
 * @param {string} props.message - Body text describing the situation or question.
 * @param {'alert'|'confirm'} [props.type='alert'] - 'alert' shows only the confirm button; 'confirm' adds a cancel button.
 * @param {string} [props.confirmLabel='OK'] - Label for the primary confirm button.
 * @param {string} [props.cancelLabel='Cancel'] - Label for the cancel button (only shown in 'confirm' type).
 * @param {'danger'|'default'} [props.variant='default'] - 'danger' styles the confirm button in red for destructive actions.
 * @param {Function} props.onConfirm - Called when the confirm button is clicked, or Enter is pressed.
 * @param {Function} [props.onCancel] - Called when the cancel button, backdrop, or Escape is activated in 'confirm' type.
 * @returns {JSX.Element|null} The modal portal, or null when closed.
 */
export default function Modal({
  isOpen,
  title,
  message,
  type = 'alert',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) {
  // Keyboard shortcuts: Escape cancels/closes, Enter confirms.
  // The listener is added only while the modal is open to avoid intercepting
  // editor shortcuts (e.g. Ctrl+S) when no modal is displayed.
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') {
        if (type === 'confirm' && onCancel) onCancel();
        else onConfirm();
      }
      if (e.key === 'Enter') onConfirm();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, type, onConfirm, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={type === 'alert' ? onConfirm : onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          {type === 'confirm' && (
            <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            className={`modal-btn modal-btn-confirm${variant === 'danger' ? ' danger' : ''}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
