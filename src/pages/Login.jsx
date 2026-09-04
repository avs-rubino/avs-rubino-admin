import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, logout, currentUser, role, refreshUserClaims } = useAuth();

  useEffect(() => {
    if (searchParams.get('status') === 'pending') {
      setPendingMessage(
        "Il tuo account è registrato come 'Utente Normale' (Zero-Trust, 0 permessi). È necessaria l'approvazione di un Super Amministratore prima di poter accedere al pannello."
      );
    }
  }, [searchParams]);

  // Se l'utente è già loggato ed è autorizzato, redirigi direttamente alla dashboard
  useEffect(() => {
    if (currentUser && role && (role === 'Super_Admin' || role === 'Editor_Admin')) {
      navigate('/');
    } else if (currentUser && role === 'Utente_Normale') {
      setPendingMessage(
        `Accesso effettuato come ${currentUser.email}. Il tuo profilo è 'Utente Normale' (in attesa di approvazione).`
      );
    }
  }, [currentUser, role, navigate]);

  const handlePostAuth = async (user) => {
    try {
      // Registra/notifica il backend (assegna claim 'Utente_Normale' se assente e notifica l'admin via email)
      const res = await axiosInstance.post('/api/auth/register-notify');
      const assignedRole = await refreshUserClaims();

      if (assignedRole === 'Super_Admin' || assignedRole === 'Editor_Admin') {
        toast.success(`Accesso autorizzato: ${assignedRole}`);
        navigate('/');
      } else {
        setPendingMessage(
          "Registrazione completata con successo. Il tuo account è impostato su 'Utente Normale' (0 permessi). Una notifica è stata inviata all'amministratore. Riprova una volta abilitato."
        );
      }
    } catch (err) {
      console.error("Errore notifica backend:", err);
      // Anche se la notifica backend fallisce, controlliamo i claims attuali
      const updatedRole = await refreshUserClaims();
      if (updatedRole === 'Super_Admin' || updatedRole === 'Editor_Admin') {
        navigate('/');
      } else {
        setPendingMessage(
          "Il tuo account è attualmente un 'Utente Normale' senza permessi di accesso. Contatta l'amministratore per l'abilitazione."
        );
      }
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    setLoading(true);
    try {
      const userCredential = await login(email, password);
      await handlePostAuth(userCredential.user);
    } catch (err) {
      console.error(err);
      setError('Email o password non validi. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setPendingMessage('');
    setGoogleLoading(true);
    try {
      const userCredential = await loginWithGoogle();
      await handlePostAuth(userCredential.user);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        // Nessun errore critico se l'utente chiude il popup
        return;
      }
      if (err.code === 'auth/operation-not-allowed') {
        setError(
          "Il login con Google non è ancora abilitato nella Firebase Console di questo progetto. Contatta il Super Admin."
        );
      } else {
        setError("Impossibile completare l'accesso con Google. Riprova.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-100">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-2xl mb-1">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AVS Rubino Admin</h1>
          <p className="text-sm text-slate-500">Accesso sicuro al pannello di gestione</p>
        </div>

        {/* Avviso Account in Attesa di Approvazione (Zero-Trust) */}
        {pendingMessage && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-amber-600 font-semibold text-sm">⏳ In attesa di approvazione</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">{pendingMessage}</p>
            {currentUser && (
              <button
                onClick={logout}
                className="text-xs text-amber-900 underline hover:text-amber-950 pt-1 font-medium block"
              >
                Disconnetti account
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl shadow-xs text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Accesso con Google in corso...' : 'Continua con Google'}</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">oppure email</span>
          <div className="border-t border-slate-200 w-full"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Indirizzo Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 outline-none"
              placeholder="admin@avsrubino.it"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition duration-150 disabled:opacity-50"
          >
            {loading ? 'Verifica credenziali...' : 'Accedi con Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
