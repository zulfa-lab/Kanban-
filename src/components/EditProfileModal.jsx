import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Curated avatar presets for 1-click selection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
];

export const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'preset' | 'url'
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Process file upload and optimize with canvas
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 5MB.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress and crop to square 192x192
        const canvas = document.createElement('canvas');
        const size = 192;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Center crop math
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setSelectedAvatar(urlInput.trim());
    setUrlInput('');
    setErrorMsg('');
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar('');
    setErrorMsg('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await updateProfile({ avatar: selectedAvatar });
      setIsSaving(false);
      if (onProfileUpdated) {
        onProfileUpdated('Foto profil berhasil diperbarui');
      }
      onClose();
    } catch (err) {
      setIsSaving(false);
      setErrorMsg(err.message || 'Gagal menyimpan foto profil.');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.username ? user.username[0].toUpperCase() : 'U';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        style={{ maxWidth: 480 }} 
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
              <Camera size={17} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Ganti Foto Profil
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                @{user?.username} ({user?.name})
              </div>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.8rem'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Live Preview */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            gap: '0.75rem'
          }}>
            <div style={{ position: 'relative' }}>
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="Preview Avatar"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--accent-primary)',
                    boxShadow: '0 4px 20px var(--accent-glow)'
                  }}
                  onError={() => {
                    setErrorMsg('Gagal memuat preview gambar. Periksa URL atau file Anda.');
                  }}
                />
              ) : (
                <div style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: user?.role === 'admin' 
                    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                    : 'var(--bg-card)',
                  color: user?.role === 'admin' ? '#ffffff' : 'var(--text-primary)',
                  border: '3px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {initials}
                </div>
              )}

              {selectedAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  title="Hapus foto dan gunakan inisial"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: '2px solid var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedAvatar ? 'Preview Foto Terpilih' : 'Menggunakan Inisial Default'}
            </div>
          </div>

          {/* Option Tabs */}
          <div>
            <div className="neu-segmented-slider" style={{ marginBottom: '1.25rem' }}>
              <div 
                className="neu-slider-pill" 
                style={{ transform: `translateX(${['upload', 'preset', 'url'].indexOf(activeTab) * 100}%)` }}
              />
              <button
                type="button"
                className={`neu-slider-btn ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <Upload size={14} />
                <span>Upload</span>
              </button>

              <button
                type="button"
                className={`neu-slider-btn ${activeTab === 'preset' ? 'active' : ''}`}
                onClick={() => setActiveTab('preset')}
              >
                <Sparkles size={14} />
                <span>Pilih Koleksi</span>
              </button>

              <button
                type="button"
                className={`neu-slider-btn ${activeTab === 'url' ? 'active' : ''}`}
                onClick={() => setActiveTab('url')}
              >
                <LinkIcon size={14} />
                <span>URL Link</span>
              </button>
            </div>

            {/* Tab 1: Upload */}
            {activeTab === 'upload' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-surface-elevated)',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                >
                  <Upload size={24} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Pilih Foto dari Perangkat
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Mendukung JPG, PNG, atau WebP (otomatis disesuaikan)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Preset */}
            {activeTab === 'preset' && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Pilih salah satu avatar favorit untuk profilmu:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.65rem'
                }}>
                  {AVATAR_PRESETS.map((preset, index) => {
                    const isPicked = selectedAvatar === preset;
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedAvatar(preset)}
                        style={{
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '50%',
                          padding: 2,
                          border: isPicked ? '2px solid var(--accent-primary)' : '2px solid transparent',
                          boxShadow: isPicked ? '0 0 10px var(--accent-glow)' : 'none',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <img
                          src={preset}
                          alt={`Preset ${index + 1}`}
                          style={{
                            width: '100%',
                            aspectRatio: '1/1',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        {isPicked && (
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: 'var(--accent-primary)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Check size={11} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: URL Link */}
            {activeTab === 'url' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="avatar-url-input">
                    Tautan URL Gambar
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      id="avatar-url-input"
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/avatar.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleApplyUrl}
                      style={{ height: 38 }}
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isSaving}>
            Batal
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={isSaving}
            style={{ fontWeight: 700 }}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Foto Profil'}
          </button>
        </div>
      </div>
    </div>
  );
};
