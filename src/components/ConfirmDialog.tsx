import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isWarning?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  isWarning = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        style={{ maxWidth: '480px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: isDanger
                ? 'rgba(239, 68, 68, 0.15)'
                : isWarning
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(59, 130, 246, 0.15)',
              color: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6',
            }}
          >
            {isDanger ? <AlertTriangle size={24} /> : isWarning ? <AlertCircle size={24} /> : <Info size={24} />}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#fff' }}>{title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.5' }}>{message}</p>
          </div>

          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-faint)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${isDanger ? 'btn-danger' : isWarning ? 'btn-primary' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
