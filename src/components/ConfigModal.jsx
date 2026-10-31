import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Database, 
  Copy, 
  Check, 
  RotateCcw, 
  Info, 
  ExternalLink, 
  AlertTriangle,
  RefreshCw,
  Trash2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured, checkFirestoreStatus, firebaseConfig } from '../services/firebase';

export const ConfigModal = ({ isOpen, onClose, onResetTasks, onClearTasks }) => {
  const { users = [] } = useAuth();
  const [copiedRules, setCopiedRules] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const runHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await checkFirestoreStatus();
      setHealthStatus(res);
    } catch {
      setHealthStatus({
        status: 'offline',
        label: 'Offline Mode',
        details: 'Tidak dapat menghubungi server Firebase.',
        projectId: firebaseConfig.projectId
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const projectId = firebaseConfig?.projectId || 'jira-499ea';
  const firestoreConsoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore`;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kanban Tasks
    match /tasks/{taskId} {
      allow read, write: if true;
    }
    // Autentikasi Pengguna & Profil
    match /system_users/{userId} {
      allow read, write: if true;
    }
    // Live Team Chat & Attachment
    match /chat_messages/{messageId} {
      allow read, write: if true;
    }
    // Board Initialization & Settings
    match /system_settings/{settingId} {
      allow read, write: if true;
    }
    // Akses fallback dokumen
    match /{document=**} {
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
            background: healthStatus?.status === 'connected'
              ? 'rgba(16, 185, 129, 0.12)'
              : healthStatus?.status === 'not_created'
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(249, 115, 22, 0.12)',
            border: `1px solid ${
              healthStatus?.status === 'connected'
                ? 'rgba(16, 185, 129, 0.3)'
                : healthStatus?.status === 'not_created'
                  ? 'rgba(239, 68, 68, 0.35)'
                  : 'rgba(249, 115, 22, 0.3)'
            }`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            {healthStatus?.status === 'connected' ? (
              <ShieldCheck size={22} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
            ) : healthStatus?.status === 'not_created' ? (
              <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
            ) : (
              <Info size={22} color="#f97316" style={{ flexShrink: 0, marginTop: 2 }} />
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: healthStatus?.status === 'connected'
                    ? '#10b981'
                    : healthStatus?.status === 'not_created'
                      ? '#ef4444'
                      : '#f97316'
                }}>
                  {healthStatus?.label || (isFirebaseConfigured ? 'Mengecek Firestore...' : 'Local Sandbox Mode')}
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={runHealthCheck}
                  disabled={isCheckingHealth}
                  style={{ height: 24, fontSize: '0.7rem', padding: '0 6px', gap: 4 }}
                  title="Cek ulang koneksi"
                >
                  <RefreshCw size={11} className={isCheckingHealth ? 'spin' : ''} />
                  <span>{isCheckingHealth ? 'Checking...' : 'Recheck'}</span>
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                {healthStatus?.details || 'Memeriksa status Cloud Firestore...'}
              </div>

              {/* Action guidance if database is not created */}
              {healthStatus?.status === 'not_created' && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Solusi: Aktifkan Cloud Firestore di Firebase Console
                  </div>
                  <ol style={{ paddingLeft: '1.2rem', margin: 0, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                    <li>Buka link Firebase Console di bawah.</li>
                    <li>Klik tombol <strong>"Create database"</strong> (Buat database).</li>
                    <li>Pilih lokasi (misal: <code>asia-southeast1</code>) & mode <strong>"Test mode"</strong>.</li>
                    <li>Klik <strong>Enable</strong>, lalu refresh halaman ini.</li>
                  </ol>
                  <a
                    href={firestoreConsoleUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginTop: '0.65rem',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-pill)',
                      background: '#ef4444',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    <span>Buka Firebase Console Firestore</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
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
              <span>Firestore Security Rules</span>
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

          {/* Reset & Clear Board tasks */}
          <div className="form-group" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Kelola Data Board</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kosongkan board untuk mulai dari nol, atau muat data demo</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {onClearTasks && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: '0.75rem', padding: '0 10px', height: 32 }}
                    onClick={() => {
                      if (window.confirm('Hapus SEMUA task di board? Board akan menjadi kosong dan tidak akan diisi data dummy.')) {
                        onClearTasks();
                        onClose();
                      }
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Kosongkan Board</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', fontSize: '0.75rem', padding: '0 10px', height: 32 }}
                  onClick={() => {
                    if (window.confirm('Reset board ke initial demo tasks?')) {
                      onResetTasks();
                      onClose();
                    }
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reset Demo Tasks</span>
                </button>
              </div>
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

