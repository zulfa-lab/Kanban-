import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = () => {
  const { login, authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Silakan masukkan nama pengguna (username).');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi.');
      return;
    }

    setIsSubmitting(true);
    const result = login(username.trim(), password.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Username atau kata sandi tidak cocok.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 25%, rgba(249, 115, 22, 0.16) 0%, var(--bg-app) 75%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute',
        width: 380,
        height: 380,
        borderRadius: '50%',
        background: 'rgba(249, 115, 22, 0.12)',
        filter: 'blur(90px)',
        top: '15%',
        left: '20%',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: 420,
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Brand Emblem */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
          <div className="brand-logo" style={{ width: 56, height: 56, borderRadius: 14 }}>
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="9" fill="url(#loginG)" />
              <path d="M12 28V12L20 20L12 28Z" fill="#ffffff" />
              <path d="M28 12V28L20 20L28 12Z" fill="#fb923c" />
              <defs>
                <linearGradient id="loginG" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f97316" />
                  <stop offset="1" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
              Masuk ke Aura Jira
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Silakan login menggunakan akun pengguna Anda
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {(errorMessage || authError) && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'fadeIn 150ms ease-out'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage || authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Username Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Nama Pengguna (Username)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                id="login-username"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Contoh: zulfa"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Kata Sandi (Password)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{
              width: '100%',
              justifyContent: 'center',
              height: 44,
              fontSize: '0.9rem',
              fontWeight: 700,
              marginTop: '0.4rem'
            }}
          >
            <LogIn size={16} />
            <span>{isSubmitting ? 'Memeriksa Akun...' : 'Masuk ke Workspace'}</span>
          </button>
        </form>

        {/* Security / Production Footer Note */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.75rem'
        }}>
          Gunakan nama pengguna & kata sandi yang telah didaftarkan oleh Administrator.
        </div>
      </div>
    </div>
  );
};
