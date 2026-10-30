import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  FilePlus, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  Network
} from 'lucide-react';
import { ISODocument, NonConformity, AuditChecklistItem, ActivityLog, UserProfile, ProcessLevel0 } from '../types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  documents: ISODocument[];
  nonConformities: NonConformity[];
  checklist: AuditChecklistItem[];
  logs: ActivityLog[];
  activeUser: UserProfile;
  onNavigate: (tab: NavTab) => void;
  onOpenNewDoc: () => void;
  onOpenNewCapa: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  nonConformities,
  checklist,
  logs,
  activeUser,
  onNavigate,
  onOpenNewDoc,
  onOpenNewCapa,
}) => {
  const activeDocs = documents.filter(d => d.status === 'vigente').length;
  const reviewDocs = documents.filter(d => d.status === 'revision').length;
  const draftDocs = documents.filter(d => d.status === 'borrador').length;

  const openCapas = nonConformities.filter(c => c.status !== 'cerrada');
  const closedCapas = nonConformities.filter(c => c.status === 'cerrada');

  const conformeCount = checklist.filter(c => c.status === 'conforme').length;
  const totalEvaluated = checklist.filter(c => c.status !== 'no_evaluado').length;
  const compliancePercentage = totalEvaluated > 0 
    ? Math.round((conformeCount / totalEvaluated) * 100) 
    : 0;

  const isAdmin = activeUser.role === 'geca';

  const pendingActions = nonConformities
    .flatMap(nc => nc.actions.map(act => ({ ...act, ncCode: nc.code, ncTitle: nc.title })))
    .filter(act => act.status !== 'completada');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Saludo Institucional UPT */}
      <div className="bg-gradient-to-r from-[#0d2d3f] via-[#10344c] to-[#001826] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border-t-2 border-[#9C7D0F]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F3E5AB] text-xs font-semibold font-outfit">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Universidad Privada de Tacna &bull; Oficina de Gestión de la Calidad (GECA)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {activeUser.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Plataforma del Sistema de Gestión de Calidad (SGC). Monitorea los 13 procesos institucionales, la lista maestra de 94 procedimientos, los indicadores oficiales y el cumplimiento de la norma ISO 21001:2025.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('process_map')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9C7D0F] hover:bg-[#b59214] text-white font-bold text-sm shadow-md shadow-black/20 transition-all cursor-pointer font-outfit"
            >
              <Network className="w-4 h-4" />
              <span>Ver Mapa de Procesos (13)</span>
            </button>
            {isAdmin && (
              <button
                onClick={onOpenNewDoc}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/10 transition-all cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>+ Nuevo Documento (RG04)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas de Indicadores Clave (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('documents')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#0d2d3f]/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documentos Vigentes</span>
            <div className="w-9 h-9 rounded-xl bg-[#0d2d3f]/10 text-[#0d2d3f] flex items-center justify-center group-hover:bg-[#0d2d3f] group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeDocs}</span>
            <span className="text-xs text-slate-500">de 93 en Lista Maestra Oficial</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{reviewDocs} en revisión &bull; {draftDocs} borradores</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0d2d3f] transition-all" />
          </div>
        </div>

        <div 
          onClick={() => isAdmin && onNavigate('capa')}
          className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs transition-all ${
            isAdmin ? 'hover:shadow-md hover:border-amber-200 cursor-pointer group' : 'cursor-default'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No Conformidades</span>
            <div className={`w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center transition-colors ${
              isAdmin ? 'group-hover:bg-amber-600 group-hover:text-white' : ''
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{openCapas.length}</span>
            <span className="text-xs text-amber-700 font-medium">Abiertas / En proceso</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{closedCapas.length} cerradas eficazmente</span>
            {isAdmin && <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-all" />}
          </div>
        </div>

        <div 
          onClick={() => isAdmin && onNavigate('indicators')}
          className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs transition-all ${
            isAdmin ? 'hover:shadow-md hover:border-blue-200 cursor-pointer group' : 'cursor-default'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tablero Indicadores</span>
            <div className={`w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center transition-colors ${
              isAdmin ? 'group-hover:bg-blue-600 group-hover:text-white' : ''
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-outfit">61</span>
            <span className="text-xs text-[#0b4967] font-semibold">Indicadores Oficiales UPT</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Seguimiento POI, Calidad e I+D+i</span>
            {isAdmin && <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-all" />}
          </div>
        </div>

        <div 
          onClick={() => isAdmin && onNavigate('checklist')}
          className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs transition-all ${
            isAdmin ? 'hover:shadow-md hover:border-emerald-200 cursor-pointer group' : 'cursor-default'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumplimiento ISO 21001</span>
            <div className={`w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-colors ${
              isAdmin ? 'group-hover:bg-emerald-600 group-hover:text-white' : ''
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{compliancePercentage}%</span>
            <span className="text-xs text-slate-500">conforme</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{conformeCount} de {totalEvaluated} cláusulas evaluadas</span>
            {isAdmin && <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-all" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#0d2d3f]" />
                <h2 className="font-bold text-slate-900 text-base">Acciones Correctivas en Curso (RG08.PE.02)</h2>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => onNavigate('capa')}
                  className="text-xs text-[#0d2d3f] hover:text-red-900 font-bold cursor-pointer"
                >
                  Ver todas &rarr;
                </button>
              )}
            </div>

            {openCapas.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No hay no conformidades abiertas pendientes en este momento.
              </div>
            ) : (
              <div className="space-y-3">
                {openCapas.slice(0, 3).map((nc) => (
                  <div 
                    key={nc.id}
                    onClick={() => isAdmin && onNavigate('capa')}
                    className={`p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isAdmin ? 'hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider bg-slate-900 text-white font-sans shadow-2xs">{nc.code}</span>
                        <span className={'px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ' + (
                          nc.severity === 'mayor' ? 'bg-red-100 text-[#0d2d3f]' : 'bg-amber-100 text-amber-700'
                        )}>
                          {nc.severity}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{nc.department}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{nc.title}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-xs">
                      <div className="text-right">
                        <div className="text-slate-500">Compromiso:</div>
                        <div className="font-semibold text-slate-700">{nc.deadline}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-medium">
                        {nc.status === 'analisis_causa' ? 'Análisis Causa' : 'Implementación'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-base">Estructura por Niveles de Procesos UPT</h2>
              <button
                onClick={() => onNavigate('process_map')}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
              >
                Abrir Mapa Completo &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Estratégicos (PE)', count: '04 Procesos &bull; 25 Procs', color: 'border-purple-200 bg-purple-50/30' },
                { name: 'Misionales (PM)', count: '03 Procesos &bull; 35 Procs', color: 'border-red-200 bg-red-50/30' },
                { name: 'Soporte (PS)', count: '06 Procesos &bull; 34 Procs', color: 'border-blue-200 bg-blue-50/30' },
              ].map((item) => (
                <div key={item.name} className={'p-4 rounded-xl border ' + item.color}>
                  <div className="text-sm font-bold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-600 mt-1" dangerouslySetInnerHTML={{ __html: item.count }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-base">Pista de Auditoría en Vivo</h2>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                En vivo
              </span>
            </div>

            <div className="space-y-4">
              {logs.slice(0, 6).map((log) => (
                <div key={log.id} className="relative pl-5 border-l-2 border-slate-200 space-y-1">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-red-600"></div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{log.userName}</span>
                    <span className="text-[11px] text-slate-400">{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-xs text-slate-600">{log.action}: <span className="font-sans font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{log.entityId}</span></p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => onNavigate('logs')}
              className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold text-center transition-colors cursor-pointer"
            >
              Ver historial completo de cambios
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
