import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import GalleryManager from '../components/GalleryManager';
import ContentManager from '../components/ContentManager';
import UsersManager from './UsersManager';

const Dashboard = ({ defaultTab = 'content' }) => {
  const { currentUser, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab); // 'content' | 'gallery' | 'users'

  const isSuperAdmin = role === 'Super_Admin';

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xs p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Pannello Amministrazione AVS Rubino</h1>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Connesso come: {currentUser?.email}</p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isSuperAdmin
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              {role || 'Nessun Ruolo'}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium text-xs sm:text-sm border border-red-100"
            >
              Disconnetti
            </button>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-xl shadow-xs border border-slate-100 flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'content'
                ? 'bg-teal-50 text-teal-800 font-bold shadow-xs border border-teal-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>📝</span>
            <span>Testi e Orari</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'gallery'
                ? 'bg-teal-50 text-teal-800 font-bold shadow-xs border border-teal-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>🖼️</span>
            <span>Galleria Immagini</span>
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'users'
                  ? 'bg-purple-50 text-purple-800 font-bold shadow-xs border border-purple-100'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-slate-50'
              }`}
            >
              <span>👥</span>
              <span>Gestione Utenti IAM</span>
            </button>
          )}
        </div>

        {/* Workspace Views */}
        <div className="space-y-6">
          {activeTab === 'users' && isSuperAdmin ? (
            <UsersManager />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Colonna Sinistra: Testi e Orari */}
              <div className={`${activeTab === 'content' ? 'block' : 'hidden'} lg:block`}>
                <ContentManager />
              </div>

              {/* Colonna Destra: Immagini */}
              <div className={`${activeTab === 'gallery' ? 'block' : 'hidden'} lg:block`}>
                <GalleryManager />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;