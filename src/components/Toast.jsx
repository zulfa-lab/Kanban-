import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      onDismiss(toasts[0].id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = toast.type === 'danger' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;
        return (
          <div key={toast.id} className={`toast ${toast.type || 'success'}`}>
            <Icon size={16} color={toast.type === 'danger' ? '#ef4444' : toast.type === 'info' ? '#f97316' : '#10b981'} />
            <span style={{ fontWeight: 500 }}>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
