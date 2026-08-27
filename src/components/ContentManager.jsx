import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import ScheduleEditor, { emptySchedule, parseSchedule } from './ScheduleEditor';

// ──────────────────────────────────────────────
// ContentManager — componente principale
// ──────────────────────────────────────────────
const ContentManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentId, setContentId] = useState(null);
  const [formData, setFormData] = useState({
    orariFormia: emptySchedule(),
    orariSecondoStudio: emptySchedule(),
    avvisi: ''
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/api/admin/content');
        // Cerchiamo l'oggetto con type === 'general_info'
        const generalInfo = response.data.find(item => item.type === 'general_info');
        
        if (generalInfo) {
          setContentId(generalInfo.id);
          setFormData({
            orariFormia: parseSchedule(generalInfo.orariFormia),
            orariSecondoStudio: parseSchedule(generalInfo.orariSecondoStudio),
            avvisi: generalInfo.avvisi || ''
          });
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (fieldName, newSchedule) => {
    setFormData(prev => ({ ...prev, [fieldName]: newSchedule }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (contentId) {
        // Se esiste, facciamo una PUT
        await api.put(`/api/admin/content/${contentId}`, {
          ...formData,
          type: 'general_info',
          updatedAt: new Date().toISOString()
        });
        toast.success('Contenuti aggiornati con successo!');
      } else {
        // Se non esiste, facciamo una POST
        const response = await api.post('/api/admin/content', {
          ...formData,
          type: 'general_info',
          createdAt: new Date().toISOString()
        });
        setContentId(response.data.id);
        toast.success('Contenuti creati con successo!');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Testi e Orari</h2>
          <p className="text-sm text-gray-500">Gestisci le informazioni generali mostrate sul sito</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${contentId ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {contentId ? 'Sincronizzato' : 'Nuova Config'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ──── Orari Formia ──── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">🏥</span>
            <h3 className="text-lg font-bold text-gray-800">Orari Studio Formia</h3>
          </div>
          <ScheduleEditor
            value={formData.orariFormia}
            onChange={(v) => handleScheduleChange('orariFormia', v)}
          />
        </div>

        <hr className="border-slate-200" />

        {/* ──── Orari Secondo Studio ──── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">🏥</span>
            <h3 className="text-lg font-bold text-gray-800">Orari Secondo Studio</h3>
          </div>
          <ScheduleEditor
            value={formData.orariSecondoStudio}
            onChange={(v) => handleScheduleChange('orariSecondoStudio', v)}
          />
        </div>

        <hr className="border-slate-200" />

        {/* ──── Avvisi ──── */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
            Avvisi e News (Banner)
          </label>
          <textarea
            name="avvisi"
            value={formData.avvisi}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none font-medium text-gray-800"
            placeholder="Testo che apparirà negli avvisi importanti..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2
            ${saving ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20'}`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              <span>Salvataggio...</span>
            </>
          ) : (
            <span>Salva Configurazioni</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContentManager;
