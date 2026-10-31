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
            className="btn-secondary header-admin-btn"
            onClick={onOpenUserManagement}
            title="Kelola Pengguna & Hak Akses"
          >
            <Users size={16} color="var(--accent-primary)" />
            <span className="header-btn-text">Kelola User</span>
          </button>
        )}

        <button
          id="btn-create-issue"
          className="btn-primary"
          onClick={onCreateIssueClick}
          title="Create a new task (Hotkey: C)"
        >
          <Plus size={16} />
          <span className="header-btn-text">Create</span>
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
            className={`header-avatar-btn ${isAdmin ? 'admin-ring' : ''} ${isProfileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            title={user?.name || user?.username}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || user.username}
                style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: isAdmin 
                    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                    : 'var(--neu-base-sunken)',
                  color: isAdmin ? '#ffffff' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>

          {/* Profile Dropdown Menu - Tactile Soft Neumorphic Card */}
          {isProfileMenuOpen && (
            <div className="profile-dropdown-menu">
              {/* Profile Card Header (Matching Reference Image) */}
              <div className="neu-profile-header">
                <div className="neu-profile-avatar-wrap">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || user.username}
                      className="neu-profile-avatar"
                    />
                  ) : (
                    <div className="neu-profile-avatar-initials">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="neu-profile-badge-check" title="Administrator">
                      <ShieldCheck size={12} color="#ffffff" />
                    </div>
                  )}
                </div>

                <div className="neu-profile-info">
                  <div className="neu-profile-name">
                    {user?.name || user?.username}
                  </div>
                  <div className="neu-profile-handle">
                    @{user?.username}
                  </div>
                  <div className="neu-profile-role-pill">
                    {isAdmin ? 'Administrator' : 'Standard User'}
                  </div>
                </div>
              </div>

              {/* Action Buttons as Tactile Raised Plates */}
              <div className="neu-profile-actions">
                <button
                  type="button"
                  className="neu-profile-btn"
                  onClick={() => {
                    onOpenEditProfile();
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <div className="neu-profile-btn-icon orange">
                    <Camera size={15} />
                  </div>
                  <span>Ganti Foto Profil</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    className="neu-profile-btn"
                    onClick={() => {
                      onOpenUserManagement();
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <div className="neu-profile-btn-icon orange">
                      <Users size={15} />
                    </div>
                    <span>Kelola Pengguna ({users.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  className="neu-profile-btn logout"
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <div className="neu-profile-btn-icon red">
                    <LogOut size={15} />
                  </div>
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
