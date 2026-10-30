import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, taskTitle, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        style={{ maxWidth: 440 }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#ef4444' }}>
            <AlertTriangle size={20} />
            <span>Confirm Deletion</span>
          </div>
          <button className="btn-icon" onClick={onCancel} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Are you sure you want to permanently delete this task?
          </p>
          <div style={{
            padding: '0.75rem',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            "{taskTitle}"
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            This action cannot be undone. The task will be removed from Firestore and all collaborator boards.
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-danger" 
            style={{ background: '#ef4444', color: '#ffffff' }}
            onClick={onConfirm}
          >
            <Trash2 size={14} />
            <span>Delete permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
