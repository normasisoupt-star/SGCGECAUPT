import React, { useState } from 'react';
import { 
  ArrowRight, 
  PieChart
} from 'lucide-react';
import { AuditChecklistItem, UserProfile } from '../types';

interface AuditChecklistViewProps {
  checklist: AuditChecklistItem[];
  activeUser: UserProfile;
  onUpdateItem: (item: AuditChecklistItem) => void;
  onCreateCapaFromFinding: (item: AuditChecklistItem) => void;
}

export const AuditChecklistView: React.FC<AuditChecklistViewProps> = ({
  checklist,
  activeUser,
  onUpdateItem,
  onCreateCapaFromFinding,
}) => {
  const isRectorado = activeUser.role === 'rectorado';
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredItems = checklist.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const total = checklist.length;
  const conformeCount = checklist.filter(c => c.status === 'conforme').length;
  const noConformeCount = checklist.filter(c => c.status === 'no_conforme').length;
  const observacionCount = checklist.filter(c => c.status === 'observacion').length;
  const evaluatedCount = total - checklist.filter(c => c.status === 'no_evaluado').length;
  const score = evaluatedCount > 0 ? Math.round((conformeCount / evaluatedCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Lista de Verificación de Auditoría ISO 21001:2018
          </h1>
          <p className="text-sm text-slate-500">
            Evaluación sistemática de requisitos por cláusula para Organizaciones Educativas.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-right">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Índice de Calidad SGOE</div>
            <div className="text-xl font-extrabold text-blue-600">{score}% Conforme</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={'p-3 rounded-xl border text-left transition-all cursor-pointer ' + (
            statusFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700'
          )}
        >
          <div className="text-[11px] font-bold uppercase opacity-70">Total Requisitos</div>
          <div className="text-lg font-bold mt-0.5">{total}</div>
        </button>

        <button
          onClick={() => setStatusFilter('conforme')}
          className={'p-3 rounded-xl border text-left transition-all cursor-pointer ' + (
            statusFilter === 'conforme' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 text-slate-700'
          )}
        >
          <div className="text-[11px] font-bold uppercase opacity-70">Conformes</div>
          <div className="text-lg font-bold mt-0.5 text-emerald-600">{conformeCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('no_conforme')}
          className={'p-3 rounded-xl border text-left transition-all cursor-pointer ' + (
            statusFilter === 'no_conforme' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-slate-200 text-slate-700'
          )}
        >
          <div className="text-[11px] font-bold uppercase opacity-70">No Conformidades</div>
          <div className="text-lg font-bold mt-0.5 text-red-600">{noConformeCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('observacion')}
          className={'p-3 rounded-xl border text-left transition-all cursor-pointer ' + (
            statusFilter === 'observacion' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-slate-200 text-slate-700'
          )}
        >
          <div className="text-[11px] font-bold uppercase opacity-70">Observaciones</div>
          <div className="text-lg font-bold mt-0.5 text-amber-600">{observacionCount}</div>
        </button>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide bg-blue-900 text-white font-sans shadow-2xs">
                      Cláusula {item.clause}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{item.clauseTitle}</h3>
                  </div>
                  <p className="text-xs text-slate-500">{item.requirement}</p>
                </div>

                {isRectorado ? (
                  <div className="shrink-0">
                    {item.status === 'conforme' && (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ Conforme
                      </span>
                    )}
                    {item.status === 'no_conforme' && (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        ✕ No Conforme
                      </span>
                    )}
                    {item.status === 'observacion' && (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        ⚠️ Observación
                      </span>
                    )}
                    {item.status === 'no_evaluado' && (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        ⚪ No Evaluado
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => onUpdateItem({ ...item, status: 'conforme' })}
                      className={'px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ' + (
                        item.status === 'conforme'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                      )}
                    >
                      Conforme
                    </button>
                    <button
                      onClick={() => onUpdateItem({ ...item, status: 'no_conforme' })}
                      className={'px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ' + (
                        item.status === 'no_conforme'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                      )}
                    >
                      No Conforme
                    </button>
                    <button
                      onClick={() => onUpdateItem({ ...item, status: 'observacion' })}
                      className={'px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ' + (
                        item.status === 'observacion'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                      )}
                    >
                      Observación
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Evidencia o Pregunta del Auditor:</span>
                <p className="text-slate-600 mt-0.5">{item.evidenceQuestion}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex-1 text-xs text-slate-500">
                  <span className="font-semibold">Hallazgo registrado:</span>{' '}
                  <span className="text-slate-700 italic">{item.notes || 'Sin anotaciones de campo.'}</span>
                </div>

                {item.status === 'no_conforme' && (item.findingReference || !isRectorado) && (
                  <button
                    onClick={() => onCreateCapaFromFinding(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors cursor-pointer shrink-0"
                  >
                    <span>{item.findingReference ? ('Ver Ticket ' + item.findingReference) : 'Generar Ticket CAPA'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
