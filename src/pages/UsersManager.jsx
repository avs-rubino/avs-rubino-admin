import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const UsersManager = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState(null);
  const [filterRole, setFilterRole] = useState('ALL'); // 'ALL' | 'PENDING' | 'EDITORS' | 'ADMINS'

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Errore caricamento utenti:', err);
      toast.error("Impossibile caricare l'elenco utenti. Verifica i permessi Super_Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (uid, newRole) => {
    setUpdatingUid(uid);
    try {
      await axiosInstance.put(`/api/admin/users/${uid}/role`, { role: newRole });
      toast.success(`Ruolo aggiornato a '${newRole}' con successo!`);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Errore aggiornamento ruolo:', err);
      toast.error(err.response?.data?.error || "Errore durante l'aggiornamento del ruolo.");
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleDeleteUser = async (uid, email) => {
    if (!window.confirm(`Sei sicuro di voler eliminare definitivamente l'utente ${email}? L'azione non è reversibile.`)) {
      return;
    }

    setUpdatingUid(uid);
    try {
      await axiosInstance.delete(`/api/admin/users/${uid}`);
      toast.success(`Utente ${email} eliminato.`);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) {
      console.error('Errore eliminazione utente:', err);
      toast.error(err.response?.data?.error || "Errore durante l'eliminazione dell'utente.");
    } finally {
      setUpdatingUid(null);
    }
  };

  const pendingUsersCount = users.filter((u) => u.role === 'Utente_Normale').length;

  const filteredUsers = users.filter((u) => {
    if (filterRole === 'PENDING') return u.role === 'Utente_Normale';
    if (filterRole === 'EDITORS') return u.role === 'Editor_Admin';
    if (filterRole === 'ADMINS') return u.role === 'Super_Admin';
    return true;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Super_Admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            👑 Super Admin
          </span>
        );
      case 'Editor_Admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            ✏️ Editor Admin
          </span>
        );
      case 'Utente_Normale':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            ⏳ In Attesa (0 permessi)
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header Sezione */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Gestione Utenti e Approvazioni IAM</h2>
            {pendingUsersCount > 0 && (
              <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold animate-pulse">
                {pendingUsersCount} da approvare
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Paradigma Zero-Trust: i nuovi iscritti accedono come 'Utente Normale' senza permessi fino a formale approvazione.
          </p>
        </div>

        {/* Filtri */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterRole('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterRole === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tutti ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterRole('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterRole === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            In Attesa ({pendingUsersCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterRole('EDITORS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterRole === 'EDITORS'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            title="Aggiorna lista"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Contenuto Tabellare */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm">Caricamento elenco utenti...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Nessun utente trovato per il filtro selezionato.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Utente</th>
                <th className="px-6 py-3.5 font-semibold">Ruolo Attuale</th>
                <th className="px-6 py-3.5 font-semibold">Data Registrazione</th>
                <th className="px-6 py-3.5 font-semibold text-right">Azioni Approvazione / Ruolo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isSelf = currentUser?.uid === u.uid;
                const isPending = u.role === 'Utente_Normale';

                return (
                  <tr
                    key={u.uid}
                    className={`hover:bg-slate-50/80 transition ${
                      isPending ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Utente Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img
                            src={u.photoURL}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                            {(u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{u.displayName || 'Utente Google / Web'}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                TU
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Ruolo Badge */}
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>

                    {/* Data */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {u.creationTime
                        ? new Date(u.creationTime).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/D'}
                    </td>

                    {/* Azioni */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRoleChange(u.uid, 'Editor_Admin')}
                              disabled={updatingUid === u.uid}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
                            >
                              Approva Editor
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRoleChange(u.uid, 'Super_Admin')}
                              disabled={updatingUid === u.uid}
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
                            >
                              Promuovi Admin
                            </button>
                          </>
                        ) : (
                          <select
                            value={u.role}
                            disabled={isSelf || updatingUid === u.uid}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:bg-slate-50"
                          >
                            <option value="Super_Admin">Super_Admin</option>
                            <option value="Editor_Admin">Editor_Admin</option>
                            <option value="Utente_Normale">Utente_Normale</option>
                          </select>
                        )}

                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.uid, u.email)}
                            disabled={updatingUid === u.uid}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Elimina utente"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
