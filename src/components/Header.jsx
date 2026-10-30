import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  Sliders, 
  LogOut, 
  Check, 
  UserCheck, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({
  searchQuery,
  onSearchChange,
  onCreateIssueClick,
  onOpenConfigClick,
  theme,
  onToggleTheme,
}) => {
  const { user, logout, isFirebaseConfigured, switchDemoUser } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Global keyboard shortcut: '/' or 'Ctrl+K' or 'c' to create
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onCreateIssueClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCreateIssueClick]);

  return (
    <header className="app-header">
      {/* Brand logo & title */}
      <div className="brand-section">
        <div className="brand-logo">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="9" fill="url(#headerG)" />
            <path d="M12 28V12L20 20L12 28Z" fill="#ffffff" />
            <path d="M28 12V28L20 20L28 12Z" fill="#fb923c" />
            <defs>
              <linearGradient id="headerG" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f97316" />
                <stop offset="1" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="brand-info">
          <div className="brand-title">
            <span>Aura Jira</span>
            <span className="brand-badge">Lite</span>
          </div>
        </div>
      </div>

      {/* Global Search bar */}
      <div className="header-center">
        <div className="search-bar-wrapper">
          <Search size={15} className="search-icon-left" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search tasks, descriptions, or keys..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <kbd className="search-kbd">⌘K</kbd>
        </div>
      </div>

      {/* Action buttons */}
      <div className="header-actions">
        <button
          id="btn-create-issue"
          className="btn-primary"
          onClick={onCreateIssueClick}
          title="Create a new task (Hotkey: C)"
        >
          <Plus size={16} />
          <span>Create</span>
        </button>

        <button
          className="btn-icon"
          onClick={onOpenConfigClick}
          title="Firebase & Environment Settings"
          aria-label="Settings"
        >
          <Sliders size={16} />
        </button>

        <button
          className="btn-icon"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User avatar & dropdown */}
        <div className="assignee-avatar-wrap" ref={profileRef} style={{ cursor: 'pointer' }}>
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)'
            }}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name || 'User'}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 250,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.75rem',
                zIndex: 60,
                animation: 'slideUp 150ms ease-out'
              }}
            >
              <div style={{ marginBottom: '0.65rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {user?.name || 'Collaborator'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {user?.email}
                </div>
                <div style={{
                  marginTop: '0.4rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  <ShieldCheck size={11} />
                  <span>Whitelisted Member</span>
                </div>
              </div>

              {/* Demo user switchers */}
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Switch Test Persona:
                </div>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: user?.email?.includes('zulfa') ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => {
                    switchDemoUser('owner');
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <span>👤 Zulfa (Project Lead)</span>
                  {user?.email?.includes('zulfa') && <Check size={12} color="#f97316" />}
                </button>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: user?.email?.includes('friend') ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => {
                    switchDemoUser('collaborator');
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <span>👥 Alex (Collaborator)</span>
                  {user?.email?.includes('friend') && <Check size={12} color="#f97316" />}
                </button>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => {
                    switchDemoUser('unauthorized');
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <span>🚫 Test "Access Denied"</span>
                </button>
              </div>

              <div style={{ paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
