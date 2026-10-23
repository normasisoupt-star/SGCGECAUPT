import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Download, 
  Upload, 
  CheckCircle2, 
  X,
  Cloud,
  HardDrive
} from 'lucide-react';
import { exportBackup, importBackup, resetToDefaults } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('iso21001_supabase_url') || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    localStorage.getItem('iso21001_supabase_key') || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('iso21001_supabase_url', supabaseUrl);
    localStorage.setItem('iso21001_supabase_key', supabaseKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SIGE21001_Backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importBackup(content)) {
        alert('Copia de seguridad restaurada exitosamente.');
        onDataChanged();
        onClose();
      } else {
        alert('Error al leer el archivo de copia de seguridad. Formato no válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('¿Estás seguro de restablecer todos los datos a los valores predeterminados de la norma ISO 21001?')) {
      resetToDefaults();
      onDataChanged();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900">Configuración del Sistema</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Arquitectura de Base de Datos</span>
            </h4>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <HardDrive className="w-4 h-4 text-blue-600" />
                <span>Modo Local con Sincronización en Tiempo Real (Activo)</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                El sistema utiliza almacenamiento en el navegador sincronizado mediante <strong>BroadcastChannel</strong>. Todos los cambios que realices se actualizan inmediatamente en cualquier pestaña abierta sin necesidad de servidores externos.
              </p>
            </div>

            <form onSubmit={handleSaveSupabaseConfig} className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Cloud className="w-4 h-4 text-indigo-600" />
                  <span>Conexión Cloud Opcional (Supabase / PostgreSQL)</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-sans font-semibold tracking-wide">
                  Schema: supabase_schema.sql
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-sans font-semibold tracking-wide focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Anon / Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-sans font-semibold tracking-wide focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {savedSuccess ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Parámetros guardados
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Deja en blanco para continuar en modo local.
                  </span>
                )}
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Guardar Parámetros
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Copia de Seguridad y Migración de Datos</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadBackup}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Exportar Backup JSON</div>
                  <div className="text-[11px] text-slate-500">Descargar base de datos local</div>
                </div>
              </button>

              <label className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all cursor-pointer flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Restaurar Backup</div>
                  <div className="text-[11px] text-slate-500">Cargar archivo JSON</div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUploadBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Restablecer Datos de Demostración</div>
                <div className="text-[11px] text-slate-500">Recarga los documentos y hallazgos iniciales de la ISO 21001.</div>
              </div>
              <button
                onClick={handleResetData}
                className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer shrink-0"
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
