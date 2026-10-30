import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  isFirebaseConfigured 
} from '../services/firebase';
import { INITIAL_COLLABORATORS } from '../services/mockData';

const AuthContext = createContext(null);

// Parse whitelist emails from env or defaults
const envWhitelist = import.meta.env.VITE_WHITELIST_EMAILS || 'zulfa.dev@gmail.com,friend.collab@gmail.com';
const WHITELISTED_EMAILS = envWhitelist
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured);
  const [authError, setAuthError] = useState(null);

  // Check if a given email is whitelisted
  const checkIsWhitelisted = (email) => {
    if (!email) return false;
    return WHITELISTED_EMAILS.includes(email.toLowerCase());
  };

  useEffect(() => {
    // If real Firebase is configured, listen to Firebase Auth
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const email = firebaseUser.email || '';
          const whitelisted = checkIsWhitelisted(email);
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || email.split('@')[0],
            email: email,
            photoURL: firebaseUser.photoURL || null,
            isWhitelisted: whitelisted,
            isRealFirebase: true,
          });
        } else {
          // If no logged in user, default to demo mode or null
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Demo Mode initial user: Default to Project Lead
      const savedDemoUser = localStorage.getItem('jira_lite_demo_user');
      if (savedDemoUser) {
        try {
          setUser(JSON.parse(savedDemoUser));
        } catch {
          setDefaultDemoUser();
        }
      } else {
        setDefaultDemoUser();
      }
      setLoading(false);
    }
  }, []);

  const setDefaultDemoUser = () => {
    const defaultUser = {
      uid: 'demo-user-1',
      name: INITIAL_COLLABORATORS[0].name,
      email: INITIAL_COLLABORATORS[0].email,
      photoURL: INITIAL_COLLABORATORS[0].avatar,
      isWhitelisted: true,
      isRealFirebase: false,
    };
    setUser(defaultUser);
    localStorage.setItem('jira_lite_demo_user', JSON.stringify(defaultUser));
  };

  // Google SSO Sign In
  const loginWithGoogle = async () => {
    setAuthError(null);
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const email = fbUser.email || '';
        const whitelisted = checkIsWhitelisted(email);
        setUser({
          uid: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: email,
          photoURL: fbUser.photoURL,
          isWhitelisted: whitelisted,
          isRealFirebase: true,
        });
        return { success: true };
      } catch (err) {
        console.error('Google Sign-in error:', err);
        setAuthError(err.message);
        return { success: false, error: err.message };
      }
    } else {
      // In demo mode, sign in with Lead
      setDefaultDemoUser();
      return { success: true };
    }
  };

  // Sign out
  const logout = async () => {
    setAuthError(null);
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('jira_lite_demo_user');
  };

  // Switch demo user (Zulfa, Friend, or Unauthorized stranger for testing)
  const switchDemoUser = (userType) => {
    let selected;
    if (userType === 'owner') {
      selected = {
        uid: 'demo-user-owner',
        name: INITIAL_COLLABORATORS[0].name,
        email: INITIAL_COLLABORATORS[0].email,
        photoURL: INITIAL_COLLABORATORS[0].avatar,
        isWhitelisted: true,
        isRealFirebase: false,
      };
    } else if (userType === 'collaborator') {
      selected = {
        uid: 'demo-user-collab',
        name: INITIAL_COLLABORATORS[1].name,
        email: INITIAL_COLLABORATORS[1].email,
        photoURL: INITIAL_COLLABORATORS[1].avatar,
        isWhitelisted: true,
        isRealFirebase: false,
      };
    } else if (userType === 'unauthorized') {
      selected = {
        uid: 'demo-user-intruder',
        name: 'Random Visitor',
        email: 'stranger.unknown@example.com',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        isWhitelisted: false,
        isRealFirebase: false,
      };
    }
    if (selected) {
      setUser(selected);
      localStorage.setItem('jira_lite_demo_user', JSON.stringify(selected));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        isDemoMode,
        setIsDemoMode,
        whitelistedEmails: WHITELISTED_EMAILS,
        authError,
        loginWithGoogle,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
