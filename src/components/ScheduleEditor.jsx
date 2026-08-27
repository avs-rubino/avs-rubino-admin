import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

export const GIORNI = [
  { key: 'lunedi', label: 'Lun' },
  { key: 'martedi', label: 'Mar' },
  { key: 'mercoledi', label: 'Mer' },
  { key: 'giovedi', label: 'Gio' },
  { key: 'venerdi', label: 'Ven' },
  { key: 'sabato', label: 'Sab' },
  { key: 'domenica', label: 'Dom' },
];

export const GIORNI_FULL = {
  lunedi: 'Lunedì',
  martedi: 'Martedì',
  mercoledi: 'Mercoledì',
  giovedi: 'Giovedì',
  venerdi: 'Venerdì',
  sabato: 'Sabato',
  domenica: 'Domenica',
};

export const emptySchedule = () => ({ defaults: [], overrides: [] });

export const parseSchedule = (val) => {
  if (val && typeof val === 'object') {
    return {
      defaults: Array.isArray(val.defaults) ? val.defaults : [],
      overrides: Array.isArray(val.overrides) ? val.overrides : [],
    };
  }
  return emptySchedule();
};

// ──────────────────────────────────────────────
// ScheduleEditor — gestisce default + eccezioni
// ──────────────────────────────────────────────
const ScheduleEditor = ({ value, onChange }) => {
  const schedule = parseSchedule(value);

  const sortedOverrides = useMemo(() => {
    return [...schedule.overrides].sort((a, b) =>
      (a.dateFrom || '').localeCompare(b.dateFrom || '')
    );
  }, [schedule.overrides]);

  // --- default form state ---
  const [defDays, setDefDays] = useState([]);
  const [defStart, setDefStart] = useState('');
  const [defEnd, setDefEnd] = useState('');
  const [defClosed, setDefClosed] = useState(false);

  // --- override form state ---
  const [ovrDateFrom, setOvrDateFrom] = useState('');
  const [ovrDateTo, setOvrDateTo] = useState('');
  const [ovrStart, setOvrStart] = useState('');
  const [ovrEnd, setOvrEnd] = useState('');
  const [ovrClosed, setOvrClosed] = useState(false);

  const toggleDay = (key) => {
    setDefDays(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]);
  };

  // ---- ADD default ----
  const addDefault = () => {
    if (defDays.length === 0) { toast.error('Seleziona almeno un giorno'); return; }
    if (!defClosed && !defStart) { toast.error("L'orario di inizio è obbligatorio"); return; }

    const entry = {
      id: Date.now().toString(),
      days: [...defDays].sort((a, b) => GIORNI.findIndex(g => g.key === a) - GIORNI.findIndex(g => g.key === b)),
      startTime: defClosed ? '' : defStart,
      endTime: defClosed ? '' : defEnd,
      closed: defClosed,
    };

    onChange({ ...schedule, defaults: [...schedule.defaults, entry] });
    setDefDays([]); setDefStart(''); setDefEnd(''); setDefClosed(false);
  };

  // ---- ADD override ----
  const addOverride = () => {
    if (!ovrDateFrom) { toast.error('Seleziona almeno la data di inizio'); return; }
    if (!ovrClosed && !ovrStart) { toast.error("L'orario di inizio è obbligatorio"); return; }

    const entry = {
      id: Date.now().toString(),
      dateFrom: ovrDateFrom,
      dateTo: ovrDateTo || ovrDateFrom,
      startTime: ovrClosed ? '' : ovrStart,
      endTime: ovrClosed ? '' : ovrEnd,
      closed: ovrClosed,
    };

    onChange({ ...schedule, overrides: [...schedule.overrides, entry] });
    setOvrDateFrom(''); setOvrDateTo(''); setOvrStart(''); setOvrEnd(''); setOvrClosed(false);
  };

  const removeDefault = (id) => onChange({ ...schedule, defaults: schedule.defaults.filter(d => d.id !== id) });
  const removeOverride = (id) => onChange({ ...schedule, overrides: schedule.overrides.filter(o => o.id !== id) });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr + 'T12:00:00');
      if (Number.isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };


  return (
    <div className="space-y-5">

      {/* ════════ DEFAULTS ════════ */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-5 rounded-2xl border border-blue-100">
        <h4 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">⏱</span>
          Orari Predefiniti
        </h4>
        <p className="text-xs text-blue-600/70 mb-4">Questi orari valgono sempre, a meno che non vengano sovrascritti da un'eccezione.</p>

        {/* --- existing defaults list --- */}
        {schedule.defaults.length > 0 && (
          <div className="space-y-2 mb-4">
            {schedule.defaults.map(entry => (
              <div key={entry.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm group">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-1">
                    {entry.days.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">
                        {GIORNI.find(g => g.key === d)?.label}
                      </span>
                    ))}
                  </div>
                  {entry.closed ? (
                    <span className="text-red-500 font-bold text-sm">Chiuso</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-semibold text-sm">
                        {entry.startTime}{entry.endTime ? ` – ${entry.endTime}` : ''}
                      </span>
                      {entry.startTime && (
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          (parseInt(entry.startTime.split(':')[0]) * 60 + parseInt(entry.startTime.split(':')[1] || 0)) < 750
                            ? 'bg-amber-100 text-amber-800 border border-amber-200/50'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200/50'
                        }`}>
                          {(parseInt(entry.startTime.split(':')[0]) * 60 + parseInt(entry.startTime.split(':')[1] || 0)) < 750 ? 'Mattina' : 'Pomeriggio'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => removeDefault(entry.id)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold px-2">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* --- add default form --- */}
        <div className="bg-white p-4 rounded-xl border border-dashed border-blue-200 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aggiungi orario predefinito</p>

          {/* Days checkboxes */}
          <div className="flex flex-wrap gap-2">
            {GIORNI.map(g => (
              <button key={g.key} type="button" onClick={() => toggleDay(g.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all
                  ${defDays.includes(g.key)
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                {g.label}
              </button>
            ))}
          </div>

          {/* Closed toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={defClosed} onChange={e => setDefClosed(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
            <span className="text-xs font-semibold text-red-500">Chiuso</span>
          </label>

          {/* Time inputs */}
          {!defClosed && (
            <div className="flex gap-3">
              <div className="w-28">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">INIZIO *</label>
                <input type="time" value={defStart} onChange={e => setDefStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              </div>
              <div className="w-28">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">FINE</label>
                <input type="time" value={defEnd} onChange={e => setDefEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              </div>
            </div>
          )}

          <button type="button" onClick={addDefault}
            className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm">
            + Aggiungi Default
          </button>
        </div>
      </div>

      {/* ════════ OVERRIDES ════════ */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100">
        <h4 className="text-sm font-bold text-amber-800 mb-1 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs">📅</span>
          Eccezioni / Orari Speciali
        </h4>
        <p className="text-xs text-amber-600/70 mb-4">Specificando una data, questi orari sovrascrivono i predefiniti solo per il periodo indicato.</p>

        {/* --- existing overrides list --- */}
        {sortedOverrides.length > 0 && (
          <div className="space-y-2 mb-4">
            {sortedOverrides.map(entry => (
              <div key={entry.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-100 shadow-sm group">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">
                    {formatDate(entry.dateFrom)}
                    {entry.dateTo && entry.dateTo !== entry.dateFrom ? ` → ${formatDate(entry.dateTo)}` : ''}
                  </span>
                  {entry.closed ? (
                    <span className="text-red-500 font-bold text-sm">Chiuso</span>
                  ) : (
                    <span className="text-slate-700 font-semibold text-sm">
                      {entry.startTime}{entry.endTime ? ` – ${entry.endTime}` : ''}
                    </span>
                  )}
                </div>
                <button type="button" onClick={() => removeOverride(entry.id)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold px-2">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* --- add override form --- */}
        <div className="bg-white p-4 rounded-xl border border-dashed border-amber-200 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aggiungi eccezione</p>

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">DATA DA *</label>
              <input type="date" value={ovrDateFrom} onChange={e => setOvrDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">DATA A (opzionale)</label>
              <input type="date" value={ovrDateTo} onChange={e => setOvrDateTo(e.target.value)}
                min={ovrDateFrom}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
            </div>
          </div>

          {/* Closed toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={ovrClosed} onChange={e => setOvrClosed(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
            <span className="text-xs font-semibold text-red-500">Chiuso</span>
          </label>

          {/* Time inputs */}
          {!ovrClosed && (
            <div className="flex gap-3">
              <div className="w-28">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">INIZIO *</label>
                <input type="time" value={ovrStart} onChange={e => setOvrStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
              </div>
              <div className="w-28">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">FINE</label>
                <input type="time" value={ovrEnd} onChange={e => setOvrEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
              </div>
            </div>
          )}

          <button type="button" onClick={addOverride}
            className="px-5 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all shadow-sm">
            + Aggiungi Eccezione
          </button>
        </div>
      </div>

    </div>
  );
};

export default ScheduleEditor;
