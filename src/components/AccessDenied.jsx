import React from 'react';
import { ShieldAlert, LogOut, RefreshCw, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDenied = () => {
  const { user, logout, switchDemoUser, whitelistedEmails, loginWithGoogle } = useAuth();

  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <div className="access-denied-icon">
          <ShieldAlert size={36} />
        </div>

        <h2 className="access-denied-title">Access Denied</h2>

        <p className="access-denied-desc">
          The signed-in account is not authorized to access this private Jira Kanban board. Only verified project collaborators have read & write permissions.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Attempted login as:</div>
          <div className="access-denied-email">
            {user?.email || 'Unknown User'}
          </div>
        </div>

        <div style={{
          padding: '0.85rem',
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          width: '100%',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Whitelisted Emails:
          </div>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {whitelistedEmails.map((email) => (
              <li key={email} style={{ fontFamily: 'var(--font-mono)' }}>{email}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => switchDemoUser('owner')}
          >
            <KeyRound size={16} />
            <span>Switch to Whitelisted Lead (Demo)</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={loginWithGoogle}
          >
            <RefreshCw size={16} />
            <span>Switch Google Account</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', color: '#ef4444' }}
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
