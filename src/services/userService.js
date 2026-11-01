import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  setDoc,
  updateDoc,
  deleteDoc, 
  onSnapshot 
} from './firebase';

const USERS_STORAGE_KEY = 'jira_lite_users_v2';
const USERS_SYNC_BUS = 'jira_lite_users_sync_bus';

export const INITIAL_SYSTEM_USERS = [
  {
    id: 'user-zulfa',
    username: 'zulfa',
    password: 'zulfa123',
    name: 'Zulfa',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    color: '#f97316',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'user-mvxipr9r-982',
    username: 'navista',
    password: 'navista123',
    name: 'navista andara',
    role: 'user',
    avatar: null,
    color: '#06b6d4',
    created_at: '2026-11-01T07:38:01.167Z',
  }
];

// BroadcastChannel for instant multi-tab sync
let userSyncChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    userSyncChannel = new BroadcastChannel(USERS_SYNC_BUS);
  } catch (err) {
    console.warn('User BroadcastChannel not supported:', err);
  }
}

// Local storage helpers
export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_SYSTEM_USERS));
      return INITIAL_SYSTEM_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_SYSTEM_USERS));
      return INITIAL_SYSTEM_USERS;
    }
    // Ensure default admin 'zulfa' always exists
    const hasZulfa = parsed.some((u) => u.username?.toLowerCase() === 'zulfa');
    if (!hasZulfa) {
      const merged = [INITIAL_SYSTEM_USERS[0], ...parsed];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading stored users:', err);
    return INITIAL_SYSTEM_USERS;
  }
};

export const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    if (userSyncChannel) {
      userSyncChannel.postMessage({ type: 'USERS_UPDATED', timestamp: Date.now() });
    }
    window.dispatchEvent(new CustomEvent('jira_users_sync', { detail: users }));
  } catch (err) {
    console.error('Error saving stored users:', err);
  }
};

/**
 * Real-time subscription to users collection.
 * Works with Firestore if active, falls back to local storage and BroadcastChannel.
 */
export const subscribeToUsers = (onUsersUpdated) => {
  // If Firestore is available, use Firestore
  if (isFirebaseConfigured && db) {
    try {
      const usersCol = collection(db, 'system_users');
      const unsubscribe = onSnapshot(
        usersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const users = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
            // Ensure default admin is present
            const hasAdmin = users.some((u) => u.username?.toLowerCase() === 'zulfa');
            if (!hasAdmin) {
              const localAdmin = getStoredUsers().find((u) => u.username?.toLowerCase() === 'zulfa') || INITIAL_SYSTEM_USERS[0];
              users.unshift(localAdmin);
            }
            saveStoredUsers(users);
            onUsersUpdated(users);
          } else {
            // First time seeding Firestore: preserve any local changes/custom avatars
            const localUsers = getStoredUsers();
            const usersToSeed = localUsers.length > 0 ? localUsers : INITIAL_SYSTEM_USERS;
            usersToSeed.forEach(async (u) => {
              try {
                await setDoc(doc(db, 'system_users', u.id), u);
              } catch (e) {
                console.warn('Seeding user to Firestore failed:', e);
              }
            });
            onUsersUpdated(usersToSeed);
          }
        },
        (error) => {
          console.warn('Firestore users subscription failed, using local storage:', error);
          onUsersUpdated(getStoredUsers());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Firestore user listener error:', err);
    }
  }

  // Local storage listener
  const initial = getStoredUsers();
  onUsersUpdated(initial);

  const handleStorage = (e) => {
    if (e.key === USERS_STORAGE_KEY) {
      onUsersUpdated(getStoredUsers());
    }
  };

  const handleCustomSync = (e) => {
    onUsersUpdated(e.detail || getStoredUsers());
  };

  const handleBroadcast = (e) => {
    if (e.data?.type === 'USERS_UPDATED') {
      onUsersUpdated(getStoredUsers());
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('jira_users_sync', handleCustomSync);
  if (userSyncChannel) {
    userSyncChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('jira_users_sync', handleCustomSync);
    if (userSyncChannel) {
      userSyncChannel.removeEventListener('message', handleBroadcast);
    }
  };
};

/**
 * Authenticate username and password
 */
export const authenticateUser = (username, password) => {
  const users = getStoredUsers();
  const cleanUser = username?.trim().toLowerCase();
  const cleanPass = password?.trim();

  const matched = users.find(
    (u) => u.username?.toLowerCase() === cleanUser && u.password === cleanPass
  );

  if (!matched) {
    return { success: false, error: 'Username atau kata sandi salah.' };
  }

  // Return public session object (exclude password)
  const sessionUser = {
    id: matched.id,
    username: matched.username,
    name: matched.name,
    role: matched.role || 'user',
    avatar: matched.avatar || null,
    color: matched.color || '#f97316',
    isAdmin: matched.role === 'admin',
  };

  return { success: true, user: sessionUser };
};

/**
 * Add a new user (Admin only)
 */
export const addNewUser = async (newUserData) => {
  const users = getStoredUsers();
  const username = newUserData.username.trim().toLowerCase();

  // Validate unique username
  if (users.some((u) => u.username.toLowerCase() === username)) {
    throw new Error(`Username "${username}" sudah digunakan. Silakan pilih username lain.`);
  }

  const id = `user-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
  const newUser = {
    id,
    username,
    password: newUserData.password.trim(),
    name: newUserData.name.trim(),
    role: newUserData.role || 'user',
    avatar: newUserData.avatar || null,
    color: newUserData.color || '#f97316',
    created_at: new Date().toISOString(),
  };

  // Save to local storage first
  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);

  // Save to Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'system_users', id), newUser);
    } catch (err) {
      console.warn('Firestore setDoc user failed, saved locally:', err);
    }
  }

  return newUser;
};

/**
 * Delete a user (Admin only)
 */
export const deleteUserById = async (userId, currentUserId) => {
  if (userId === currentUserId) {
    throw new Error('Anda tidak dapat menghapus akun Anda sendiri.');
  }

  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);
  if (target?.username?.toLowerCase() === 'zulfa') {
    throw new Error('Admin utama (zulfa) tidak dapat dihapus.');
  }

  // Delete from local storage first
  const updatedUsers = users.filter((u) => u.id !== userId);
  saveStoredUsers(updatedUsers);

  // Delete from Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'system_users', userId));
    } catch (err) {
      console.warn('Firestore delete user failed, deleted locally:', err);
    }
  }
};

/**
 * Update user profile (avatar, name, etc.)
 */
export const updateUserProfile = async (userId, updates) => {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId || u.username === userId);
  if (index === -1) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  const updatedUser = {
    ...users[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  users[index] = updatedUser;

  // Always save to local storage immediately
  saveStoredUsers(users);

  // Save to Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'system_users', updatedUser.id), {
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore updateUserProfile failed, saved locally:', err);
    }
  }

  return updatedUser;
};

