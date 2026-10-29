import React, { useState } from 'react';
import { Search, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || log.entityType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pista de Auditoría del Sistema (Audit Trail)
        </h1>
        <p className="text-sm text-slate-500">
          Registro inmutable de actividades, aprobaciones y modificaciones en tiempo real exigido por la ISO 21001.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción o código de registro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-white cursor-pointer"
        >
          <option value="all">Todas las entidades</option>
          <option value="documento">Documentos</option>
          <option value="no_conformidad">No Conformidades (CAPA)</option>
          <option value="auditoria">Auditorías</option>
          <option value="sistema">Sistema</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No se encontraron eventos con los filtros seleccionados.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                {log.entityType === 'documento' ? <FileText className="w-4 h-4 text-blue-600" /> :
                 log.entityType === 'no_conformidad' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                 <ShieldCheck className="w-4 h-4 text-emerald-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{log.userName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 uppercase font-sans font-semibold tracking-wide">
                      {log.userRole}
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs font-medium text-slate-700">{log.action}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-sans font-semibold tracking-wide">{log.timestamp}</span>
                </div>

                <div className="mt-1 text-xs text-slate-600 flex items-center gap-2">
                  <span className="font-sans font-semibold tracking-wide font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    {log.entityId}
                  </span>
                  <span className="truncate">{log.details}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
