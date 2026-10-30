import React, { useState } from 'react';
import { X, ShieldCheck, Database, Copy, Check, RotateCcw, Info, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';

export const ConfigModal = ({ isOpen, onClose, onResetTasks }) => {
  const { user, users = [] } = useAuth();
  const [copiedRules, setCopiedRules] = useState(false);

  if (!isOpen) return null;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if true;
    }
    match /system_users/{userId} {
      allow read, write: if true;
    }
  }
}`;

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(firestoreRules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Database size={18} color="#f97316" />
            <span>Firebase & Architecture Setup</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Connection status banner */}
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(249, 115, 22, 0.12)',
            border: `1px solid ${isFirebaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(249, 115, 22, 0.3)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            {isFirebaseConfigured ? <ShieldCheck size={20} color="#10b981" /> : <Info size={20} color="#f97316" />}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isFirebaseConfigured ? '#10b981' : '#f97316' }}>
                {isFirebaseConfigured ? 'Firebase Cloud Connected' : 'Local Fallback / Sandbox Mode'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.45 }}>
                {isFirebaseConfigured
                  ? 'Koneksi ke Firestore aktif. Perubahan tugas dan akun pengguna tersinkronisasi secara real-time antar browser.'
                  : 'Tasks and multi-tab synchronization are powered by reactive WebSockets / BroadcastChannel. To connect your live cloud database, configure your keys in .env.'}
              </div>
            </div>
          </div>

          {/* Registered Users */}
          <div className="form-group">
            <label className="form-label">
              <span>Pengguna Terdaftar ({users.length} Akun)</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Autentikasi Username & Password</span>
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {users.map((u) => (
                <div
                  key={u.id || u.username}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.role === 'admin' ? '#f97316' : '#10b981' }} />
                  <span>@{u.username} ({u.role})</span>
                </div>
              ))}
            </div>
          </div>
          {/* Firestore Security Rules Box */}
          <div className="form-group">
            <div className="form-label">
              <span>Firestore Security Rules (Optional)</span>
              <button
                type="button"
                className="btn-secondary"
                style={{ height: 26, fontSize: '0.72rem', padding: '0 8px' }}
                onClick={copyRulesToClipboard}
              >
                {copiedRules ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedRules ? 'Copied!' : 'Copy Rules'}</span>
              </button>
            </div>
            <pre style={{
              background: 'var(--bg-card)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              overflowX: 'auto',
              lineHeight: 1.5
            }}>
              {firestoreRules}
            </pre>
          </div>

          {/* Reset Demo tasks */}
          <div className="form-group" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reset Board Data</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kembalikan semua task ke data sprint bawaan</div>
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                onClick={() => {
                  if (window.confirm('Reset board ke initial demo tasks?')) {
                    onResetTasks();
                    onClose();
                  }
                }}
              >
                <RotateCcw size={14} />
                <span>Reset Demo Tasks</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
