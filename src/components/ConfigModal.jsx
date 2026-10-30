import React, { useState } from 'react';
import { X, ShieldCheck, Database, Key, Copy, Check, RotateCcw, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';

export const ConfigModal = ({ isOpen, onClose, onResetTasks }) => {
  const { user, whitelistedEmails, switchDemoUser } = useAuth();
  const [copiedRules, setCopiedRules] = useState(false);

  if (!isOpen) return null;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email in [${whitelistedEmails.map(e => `"${e}"`).join(', ')}]);
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

        <div className="modal-body">
          {/* Connection Status Box */}
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
            border: `1px solid ${isFirebaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(249, 115, 22, 0.3)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={20} color={isFirebaseConfigured ? '#10b981' : '#fb923c'} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isFirebaseConfigured ? '#10b981' : '#fb923c' }}>
                {isFirebaseConfigured ? 'Connected to Firebase Project' : 'Running in Zero-Setup Sandbox Mode'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                {isFirebaseConfigured
                  ? 'Your app is authenticated and syncing live with Google Firebase Auth & Cloud Firestore.'
                  : 'Tasks and multi-tab synchronization are powered by reactive WebSockets / BroadcastChannel. To connect your live cloud database, configure your keys in .env.'}
              </div>
            </div>
          </div>

          {/* Whitelisted Emails */}
          <div className="form-group">
            <label className="form-label">
              <span>Security Whitelist (2 Collaborators)</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Configured via VITE_WHITELIST_EMAILS</span>
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {whitelistedEmails.map((email) => (
                <div
                  key={email}
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
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  <span>{email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Persona quick switch */}
          <div className="form-group">
            <label className="form-label">Interactive Persona Switcher (Test Whitelist & Assignees)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  justifyContent: 'center',
                  background: user?.email?.includes('zulfa') ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-surface-elevated)',
                  borderColor: user?.email?.includes('zulfa') ? 'var(--accent-primary)' : 'var(--border-subtle)'
                }}
                onClick={() => switchDemoUser('owner')}
              >
                Lead (Zulfa)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  justifyContent: 'center',
                  background: user?.email?.includes('friend') ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-surface-elevated)',
                  borderColor: user?.email?.includes('friend') ? 'var(--accent-primary)' : 'var(--border-subtle)'
                }}
                onClick={() => switchDemoUser('collaborator')}
              >
                Collaborator (Alex)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  justifyContent: 'center',
                  color: '#ef4444'
                }}
                onClick={() => {
                  switchDemoUser('unauthorized');
                  onClose();
                }}
              >
                Test Intruder 🚫
              </button>
            </div>
          </div>

          {/* Firestore Security Rules Code snippet */}
          <div className="form-group">
            <div className="form-label">
              <span>Cloud Firestore Security Rules (PRD 5.1)</span>
              <button
                type="button"
                onClick={copyRulesToClipboard}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600
                }}
              >
                {copiedRules ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedRules ? 'Copied!' : 'Copy rules'}</span>
              </button>
            </div>
            <pre style={{
              background: '#090d16',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: '#fed7aa',
              overflowX: 'auto',
              lineHeight: 1.5
            }}>
              {firestoreRules}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onResetTasks}
            title="Reset cards back to initial PRD demo data"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Tasks</span>
          </button>

          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
