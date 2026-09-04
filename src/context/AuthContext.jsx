import { createContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth);
  }

  async function refreshUserClaims() {
    if (auth.currentUser) {
      const tokenResult = await auth.currentUser.getIdTokenResult(true);
      const userRole = tokenResult.claims.role || 'Utente_Normale';
      setRole(userRole);
      return userRole;
    }
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          // Paradigma Zero-Trust: se non è presente un claim 'role', consideriamo 'Utente_Normale'
          const assignedRole = tokenResult.claims.role || 'Utente_Normale';
          setRole(assignedRole);
          setCurrentUser(user);
        } catch (error) {
          console.error("Error fetching token result:", error);
          setRole(null);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    role,
    login,
    loginWithGoogle,
    logout,
    refreshUserClaims,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
