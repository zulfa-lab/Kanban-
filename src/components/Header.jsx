import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  Sliders, 
  LogOut, 
  Users, 
  ShieldCheck, 
  UserCheck,
  Camera 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({
  searchQuery,
  onSearchChange,
  onCreateIssueClick,
  onOpenConfigClick,
  onOpenUserManagement,
  onOpenEditProfile,
  theme,
  onToggleTheme,
}) => {
  const { user, users, logout, isAdmin } = useAuth();
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
        {/* Admin Manage Users button */}
        {isAdmin && (
          <button
            id="btn-manage-users"
            className="btn-secondary"
            onClick={onOpenUserManagement}
            title="Kelola Pengguna & Hak Akses"
            style={{ height: 36, padding: '0 0.85rem', gap: '0.45rem', borderColor: 'var(--accent-glow)' }}
          >
            <Users size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Kelola User</span>
          </button>
        )}

        <button
          id="btn-create-issue"
          className="btn-primary"
          onClick={onCreateIssueClick}
          title="Create a new task (Hotkey: C)"
        >
          <Plus size={16} />
          <span>Create</span>
        </button>

        {/* Admin Firebase & Architecture Settings */}
        {isAdmin && (
          <button
            className="btn-icon"
            onClick={onOpenConfigClick}
            title="Firebase & Environment Settings (Admin Only)"
            aria-label="Settings"
          >
            <Sliders size={16} />
          </button>
        )}

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
              border: isAdmin ? '1.5px solid var(--accent-primary)' : '1.5px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)'
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || user.username}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: isAdmin 
                    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                    : 'var(--bg-card)',
                  color: isAdmin ? '#ffffff' : 'var(--text-primary)',
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
                width: 260,
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
                  {user?.name || user?.username}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  @{user?.username}
                </div>
                <div style={{
                  marginTop: '0.4rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: isAdmin ? '#f97316' : '#10b981',
                  background: isAdmin ? 'rgba(249, 115, 22, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-pill)',
                  border: isAdmin ? '1px solid rgba(249, 115, 22, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  <ShieldCheck size={11} />
                  <span>{isAdmin ? 'Administrator' : 'Standard User'}</span>
                </div>
              </div>

              {/* Edit Profile / Avatar Button */}
              <div style={{ marginBottom: '0.4rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 500,
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => {
                    onOpenEditProfile();
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <Camera size={14} color="var(--accent-primary)" />
                  <span>Ganti Foto Profil</span>
                </button>
              </div>

              {/* Admin Manage User Option */}
              {isAdmin && (
                <div style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      fontSize: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: 'rgba(249, 115, 22, 0.1)',
                      color: 'var(--accent-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600
                    }}
                    onClick={() => {
                      onOpenUserManagement();
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <Users size={14} />
                    <span>Kelola Pengguna ({users.length})</span>
                  </button>
                </div>
              )}

              {/* Sign Out Button */}
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
                  <span>Sign Out (Keluar)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
