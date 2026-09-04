import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import RoleBasedWrapper from './RoleBasedWrapper';

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/content');
      // Filtriamo solo i contenuti di tipo 'gallery'
      const galleryImages = response.data.filter(item => item.type === 'gallery');
      setImages(galleryImages);
      setError(null);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Errore nel caricamento della galleria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Seleziona un file immagine valido (PNG, JPEG, WebP, ecc.)');
      e.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('Il file supera la dimensione massima consentita di 5MB');
      e.target.value = '';
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // 1. Upload del file fisico
      const uploadRes = await api.post('/api/admin/upload', formData);
      const imageUrl = uploadRes.data.url;

      // 2. Salvataggio riferimento nel database (content)
      await api.post('/api/admin/content', {
        type: 'gallery',
        url: imageUrl,
        createdAt: new Date().toISOString()
      });

      toast.success('Foto caricata con successo!');
      // 3. Refresh della galleria
      fetchGallery();
    } catch (err) {
      console.error('Error in upload process:', err);
      toast.error('Caricamento fallito. Riprova.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const confirmAndDelete = async (id) => {
    try {
      await api.delete(`/api/admin/content/${id}`);
      setImages(prev => prev.filter(img => img.id !== id));
      toast.success('Foto eliminata con successo.');
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      toast.error('Eliminazione fallita.');
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col space-y-3">
        <p className="text-sm font-semibold text-gray-800">Sei sicuro di voler eliminare questa foto?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition"
          >
            Annulla
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmAndDelete(id);
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow"
          >
            Elimina
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Media Gallery</h2>
            <p className="text-sm text-gray-500">Gestisci le immagini visualizzate nella galleria pubblica</p>
          </div>
          
          <label className="relative cursor-pointer group">
            <div className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md
              ${uploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}>
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white"></div>
                  <span>Caricamento...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Carica Foto</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleUpload} 
              disabled={uploading}
              accept="image/*"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="text-gray-500 font-medium italic">Sincronizzazione galleria...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={img.url} 
                  alt="Gallery" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                <RoleBasedWrapper allowedRoles={['Super_Admin']}>
                  <button 
                    onClick={() => handleDelete(img.id)}
                    className="bg-white/95 text-red-600 px-5 py-2 rounded-xl font-bold shadow-lg hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Elimina</span>
                  </button>
                </RoleBasedWrapper>
              </div>

              {/* Date Badge */}
              <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-tighter border border-white/50">
                {new Date(img.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Nessuna immagine nella galleria.</p>
              <p className="text-sm text-gray-400">Trascina o seleziona un file per iniziare.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
