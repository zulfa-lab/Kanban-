import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeToUsers, 
  authenticateUser, 
  addNewUser, 
  deleteUserById, 
  getStoredUsers 
} from '../services/userService';
import { isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = 'jira_auth_session_v2';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(getStoredUsers());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Subscribe to real-time users collection
  useEffect(() => {
    const unsubscribe = subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);

      // Verify if currently logged in session user is still valid in system
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          const validUser = updatedUsers.find((u) => u.id === parsed.id || u.username === parsed.username);
          if (validUser) {
            setUser({
              id: validUser.id,
              username: validUser.username,
              name: validUser.name,
              role: validUser.role || 'user',
              avatar: validUser.avatar || null,
              color: validUser.color || '#f97316',
              isAdmin: validUser.role === 'admin',
            });
          } else {
            // User was removed by admin
            localStorage.removeItem(SESSION_STORAGE_KEY);
            setUser(null);
          }
        } catch {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          setUser(null);
        }
      }
    });

    // Check existing session once on mount
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setUser(null);
      }
    } else {
      // In incognito or first visit: user is explicitly null (must log in!)
      setUser(null);
    }

    setLoading(false);
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Login handler
  const login = (username, password) => {
    setAuthError(null);
    const result = authenticateUser(username, password);
    if (result.success) {
      setUser(result.user);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.user));
      return { success: true };
    } else {
      setAuthError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Logout handler
  const logout = () => {
    setAuthError(null);
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Add user (Admin only)
  const handleAddUser = async (newUserData) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Admin yang dapat menambahkan pengguna baru.');
    }
    return await addNewUser(newUserData);
  };

  // Delete user (Admin only)
  const handleDeleteUser = async (userId) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Admin yang dapat menghapus pengguna.');
    }
    return await deleteUserById(userId, user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        authError,
        isFirebaseConfigured,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        addUser: handleAddUser,
        deleteUser: handleDeleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
