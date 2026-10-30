import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  Trash2, 
  ShieldCheck, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserManagementModal = ({ isOpen, onClose, onUserAdded }) => {
  const { user: currentUser, users, addUser, deleteUser } = useAuth();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user'); // 'user' | 'admin'

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const usernameClean = newUsername.trim().toLowerCase();
    const nameClean = newName.trim();
    const passwordClean = newPassword.trim();

    if (!usernameClean) {
      setFormError('Nama pengguna (username) wajib diisi.');
      return;
    }
    if (usernameClean.includes(' ')) {
      setFormError('Username tidak boleh mengandung spasi.');
      return;
    }
    if (!nameClean) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }
    if (!passwordClean || passwordClean.length < 3) {
      setFormError('Kata sandi minimal 3 karakter.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addUser({
        username: usernameClean,
        name: nameClean,
        password: passwordClean,
        role: newRole,
      });

      setFormSuccess(`Pengguna @${usernameClean} berhasil ditambahkan!`);
      setNewUsername('');
      setNewName('');
      setNewPassword('');
      setNewRole('user');
      setIsSubmitting(false);

      if (onUserAdded) {
        onUserAdded(`Pengguna @${usernameClean} berhasil dibuat`);
      }

      // Switch to list tab after short delay
      setTimeout(() => {
        setActiveTab('list');
        setFormSuccess('');
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err.message || 'Gagal menambahkan pengguna.');
    }
  };

  const handleDelete = async (u) => {
    if (u.id === currentUser?.id || u.username === currentUser?.username) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (u.username === 'zulfa') {
      alert('Admin utama (zulfa) tidak dapat dihapus.');
      return;
    }

    const confirmDel = window.confirm(`Apakah Anda yakin ingin menghapus pengguna @${u.username} (${u.name})?`);
    if (!confirmDel) return;

    try {
      await deleteUser(u.id);
    } catch (err) {
      alert(err.message || 'Gagal menghapus pengguna.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        style={{ maxWidth: 580 }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Manajemen Pengguna
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(249, 115, 22, 0.15)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(249, 115, 22, 0.3)'
                }}>
                  Admin Only
                </span>
              </div>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          padding: '0.75rem 1.5rem 0',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('list'); setFormError(''); }}
            style={{
              padding: '0.5rem 0.25rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'list' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'list' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              fontWeight: activeTab === 'list' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Users size={15} />
            <span>Daftar Pengguna ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('add'); setFormError(''); }}
            style={{
              padding: '0.5rem 0.25rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'add' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'add' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              fontWeight: activeTab === 'add' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <UserPlus size={15} />
            <span>+ Tambah Pengguna Baru</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'list' ? (
            /* User List Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Pengguna yang terdaftar dapat login menggunakan nama pengguna dan kata sandinya untuk mengakses Kanban board:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id || u.username === currentUser?.username;
                  const isPermanentAdmin = u.username?.toLowerCase() === 'zulfa';

                  return (
                    <div
                      key={u.id || u.username}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: u.role === 'admin' 
                            ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                            : 'var(--bg-card)',
                          color: u.role === 'admin' ? '#ffffff' : 'var(--text-primary)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              {u.name}
                            </span>
                            {isCurrent && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Anda)</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            @{u.username}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: u.role === 'admin' ? 'rgba(249, 115, 22, 0.15)' : 'var(--bg-surface)',
                          color: u.role === 'admin' ? '#fb923c' : 'var(--text-secondary)',
                          border: u.role === 'admin' ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid var(--border-subtle)',
                        }}>
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </span>

                        {!isPermanentAdmin && !isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            title={`Hapus pengguna @${u.username}`}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '5px',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Add User Tab */
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="new-user-username">
                  Nama Pengguna / Username (tanpa spasi) <strong style={{ color: '#ef4444' }}>*</strong>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <UserIcon size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                  <input
                    id="new-user-username"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="Contoh: budi"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-user-name">
                  Nama Lengkap <strong style={{ color: '#ef4444' }}>*</strong>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Tag size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                  <input
                    id="new-user-name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="Contoh: Budi Pratama"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-user-password">
                  Kata Sandi (Password) <strong style={{ color: '#ef4444' }}>*</strong>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                  <input
                    id="new-user-password"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="Contoh: budi123"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Peran Pengguna (Role)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: newRole === 'user' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: newRole === 'user' ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={newRole === 'user'}
                      onChange={() => setNewRole('user')}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>User Biasa</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dapat mengelola Kanban board</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: newRole === 'admin' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: newRole === 'admin' ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={newRole === 'admin'}
                      onChange={() => setNewRole('admin')}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Administrator</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dapat menambah & mengelola user</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                  height: 42,
                  justifyContent: 'center',
                  fontWeight: 700,
                  marginTop: '0.5rem'
                }}
              >
                <UserPlus size={16} />
                <span>{isSubmitting ? 'Menyimpan...' : 'Tambahkan Pengguna'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
