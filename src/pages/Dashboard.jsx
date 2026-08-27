import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import GalleryManager from '../components/GalleryManager';
import ContentManager from '../components/ContentManager';

const Dashboard = () => {
  const { currentUser, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'gallery'

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border border-gray-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Welcome back, {currentUser?.email}</p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">
              Role: {role || 'No Role Assigned'}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm border border-red-100"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Workspace: Gestione Contenuti e Galleria */}
        <div className="space-y-6">
          {/* Mobile Tab Navigation */}
          <div className="flex lg:hidden bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'content'
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>📝</span>
              <span>Testi e Orari</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'gallery'
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>🖼️</span>
              <span>Galleria Immagini</span>
            </button>
          </div>

          {/* Grid Container */}
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;