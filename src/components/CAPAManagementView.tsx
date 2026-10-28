import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  CheckCircle2, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  ShieldCheck, 
  X,
  FileSpreadsheet,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';
import { 
  NonConformity, 
  NonConformitySeverity, 
  CorrectiveAction,
  UserProfile,
  ProcessLevel0 
} from '../types';
import { UPT_PROCESSES } from '../data/initialData';

interface CAPAManagementViewProps {
  nonConformities: NonConformity[];
  activeUser: UserProfile;
  onSaveCAPA: (nc: NonConformity) => void;
  onCloseCAPA: (id: string, verifierName: string, notes: string) => void;
  isOpenNewModal: boolean;
  onCloseNewModal: () => void;
  onOpenNewModal: () => void;
  scopeMode?: 'my_office' | 'all';
  onToggleScopeMode?: (mode: 'my_office' | 'all') => void;
}

const SEVERITY_CONFIG: Record<NonConformitySeverity, { label: string; color: string; badge: string }> = {
  mayor: { label: 'Mayor', color: 'text-red-700 bg-red-50 border-red-200', badge: 'bg-red-600' },
  menor: { label: 'Menor', color: 'text-amber-700 bg-amber-50 border-amber-200', badge: 'bg-amber-500' },
  observacion: { label: 'Observación', color: 'text-blue-700 bg-blue-50 border-blue-200', badge: 'bg-blue-500' },
};

export const CAPAManagementView: React.FC<CAPAManagementViewProps> = ({
  nonConformities,
  activeUser,
  onSaveCAPA,
  onCloseCAPA,
  isOpenNewModal,
  onCloseNewModal,
  onOpenNewModal,
  scopeMode = 'all',
  onToggleScopeMode,
}) => {
  const isRectorado = activeUser.role === 'rectorado';
  const isAdmin = activeUser.role === 'geca';
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [activeNC, setActiveNC] = useState<NonConformity | null>(null);

  const [newActionText, setNewActionText] = useState('');
  const [newActionResponsible, setNewActionResponsible] = useState(activeUser.name);
  const [newActionDeadline, setNewActionDeadline] = useState('');

  const [closeNotes, setCloseNotes] = useState('');

  const [newNCData, setNewNCData] = useState<{
    code: string;
    title: string;
    description: string;
    source: string;
    severity: NonConformitySeverity;
    processCode: ProcessLevel0;
    isoClause: string;
    department: string;
    deadline: string;
    assignedTo: string;
  }>({
    code: '',
    title: '',
    description: '',
    source: 'Auditoría Interna ISO 21001 (PE.02.04.01)',
    severity: 'menor',
    processCode: 'PM.01',
    isoClause: 'Cláusula 8.5 - Provisión del servicio educativo',
    department: 'Facultades y Escuelas Profesionales UPT',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: activeUser.name,
  });

  const filteredNCs = nonConformities.filter((nc) => {
    const matchesStatus = 
      selectedStatusTab === 'all' ? true :
      selectedStatusTab === 'abiertas' ? nc.status !== 'cerrada' :
      selectedStatusTab === 'cerradas' ? nc.status === 'cerrada' :
      nc.status === selectedStatusTab;

    const matchesSearch = 
      nc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.isoClause.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesScope = true;
    if (scopeMode === 'my_office' && !isAdmin && !isRectorado && activeUser.role !== 'auditor') {
      const officeTerm = (activeUser.officeName || activeUser.department).toLowerCase();
      const matchesProc = activeUser.processCodes && activeUser.processCodes.includes(nc.processCode);
      const matchesDept = nc.department.toLowerCase().includes(officeTerm) || officeTerm.includes(nc.department.toLowerCase());
      matchesScope = Boolean(matchesProc || matchesDept);
    }

    return matchesStatus && matchesSearch && matchesScope;
  });

  const handleCreateNC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNCData.title) return;

    const nextCodeNumber = String(nonConformities.length + 1).padStart(3, '0');
    const code = newNCData.code || ('NC-2026-' + nextCodeNumber);

    const newNC: NonConformity = {
      id: 'nc-' + Date.now(),
      code,
      title: newNCData.title,
      description: newNCData.description,
      source: newNCData.source,
      severity: newNCData.severity,
      processCode: newNCData.processCode,
      isoClause: newNCData.isoClause,
      department: newNCData.department,
      detectedDate: new Date().toISOString().split('T')[0],
      deadline: newNCData.deadline,
      status: 'abierta',
      assignedTo: newNCData.assignedTo,
      createdBy: activeUser.name,
      whyAnalysis: {
        why1: '',
        why2: '',
        why3: '',
        why4: '',
        why5: '',
        rootCause: '',
      },
      actions: [],
    };

    onSaveCAPA(newNC);
    onCloseNewModal();
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNC || !newActionText) return;

    const newAction: CorrectiveAction = {
      id: 'act-' + Date.now(),
      description: newActionText,
      responsible: newActionResponsible,
      deadline: newActionDeadline || activeNC.deadline,
      status: 'pendiente',
    };

    const updatedNC: NonConformity = {
      ...activeNC,
      status: activeNC.status === 'abierta' || activeNC.status === 'analisis_causa' ? 'en_implementacion' : activeNC.status,
      actions: [...activeNC.actions, newAction],
    };

    onSaveCAPA(updatedNC);
    setActiveNC(updatedNC);
    setNewActionText('');
  };

  const handleToggleActionStatus = (actionId: string) => {
    if (!activeNC) return;

    const updatedActions = activeNC.actions.map((act) => {
      if (act.id === actionId) {
        const nextStatus: 'pendiente' | 'completada' = act.status === 'completada' ? 'pendiente' : 'completada';
        return {
          ...act,
          status: nextStatus,
          completedAt: nextStatus === 'completada' ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return act;
    });

    const updatedNC: NonConformity = {
      ...activeNC,
      actions: updatedActions,
    };

    onSaveCAPA(updatedNC);
    setActiveNC(updatedNC);
  };

  const handleSaveWhyAnalysis = () => {
    if (!activeNC) return;
    onSaveCAPA(activeNC);
    alert('Análisis de Causa Raíz (5 Porqués) guardado en RG08.PE.02 exitosamente.');
  };

  const handleCloseVerification = () => {
    if (!activeNC || !closeNotes) {
      alert('Debes ingresar las conclusiones de verificación de eficacia.');
      return;
    }
    onCloseCAPA(activeNC.id, activeUser.name, closeNotes);
    setActiveNC(null);
    setCloseNotes('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide text-amber-950 bg-amber-100 border border-amber-300 font-sans">
              RG08.PE.02
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              No Conformidades y Acciones Correctivas (CAPA)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gestión institucional según el procedimiento PE.02.04.02 de la Universidad Privada de Tacna.
          </p>
        </div>

        {isRectorado ? (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold self-start sm:self-auto shadow-2xs">
            <span>🏛️ Supervisión Alta Dirección (Solo Lectura)</span>
          </div>
        ) : (
          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Reportar No Conformidad (RG08)</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'abiertas', label: 'En Proceso / Abiertas' },
            { id: 'cerradas', label: 'Cerradas Eficaces' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ' + (
                selectedStatusTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, título, área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNCs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
            No se encontraron hallazgos registrados.
          </div>
        ) : (
          filteredNCs.map((nc) => {
            const sev = SEVERITY_CONFIG[nc.severity];
            const isClosed = nc.status === 'cerrada';
            const completedActions = nc.actions.filter(a => a.status === 'completada').length;

            return (
              <div
                key={nc.id}
                onClick={() => setActiveNC(nc)}
                className={'bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ' + (
                  isClosed ? 'border-slate-200 bg-slate-50/40 opacity-80' : 'border-slate-200 hover:border-amber-300'
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider bg-slate-900 text-white font-sans shadow-2xs">{nc.code}</span>
                    <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full border ' + sev.color}>
                      <span className={'w-1.5 h-1.5 rounded-full ' + sev.badge}></span>
                      <span>Severidad {sev.label}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                      {nc.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{nc.description}</p>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Proceso UPT:</span>
                      <span className="font-bold text-slate-800">{nc.processCode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Origen:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">{nc.source}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Área:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">{nc.department}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    {isClosed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cerrada eficaz</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Acciones: <strong className="text-slate-900">{completedActions}/{nc.actions.length}</strong>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-700 font-semibold">
                    <span>Gestionar</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Gestión de Acción Correctiva con formato oficial RG08 */}
      {activeNC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900">
                  Formato RG08.PE.02: Registro de No Conformidad - {activeNC.code}
                </h3>
              </div>
              <button 
                onClick={() => setActiveNC(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider bg-slate-900 text-white font-sans">
                    {activeNC.code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700">
                    Proceso: {activeNC.processCode}
                  </span>
                  <span className="text-xs text-slate-400">&bull; Origen: {activeNC.source}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{activeNC.title}</h2>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {activeNC.description}
                </p>
              </div>

              {/* 5 Porqués */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      3. Investigación de Causas (5 Porqués / Causa Raíz)
                    </h4>
                  </div>
                  <button
                    onClick={handleSaveWhyAnalysis}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    Guardar Análisis
                  </button>
                </div>

                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const key = ('why' + num) as keyof typeof activeNC.whyAnalysis;
                    const val = (activeNC.whyAnalysis && activeNC.whyAnalysis[key]) || '';
                    return (
                      <div key={num} className="flex items-center gap-3">
                        <span className="text-xs font-sans font-bold text-amber-900 w-20 shrink-0 tracking-wide">
                          {'¿Por qué ' + num + '?'}
                        </span>
                        <input
                          type="text"
                          placeholder={'Pregunta o causa intermedia ' + num + '...'}
                          value={val}
                          onChange={(e) => {
                            const updatedWhy = {
                              ...(activeNC.whyAnalysis || { why1: '', why2: '', why3: '', why4: '', why5: '', rootCause: '' }),
                              [key]: e.target.value,
                            };
                            setActiveNC({ ...activeNC, whyAnalysis: updatedWhy });
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-amber-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">
                    Causa Raíz Concluyente
                  </label>
                  <input
                    type="text"
                    placeholder="Conclusión final de la causa raíz identificada..."
                    value={activeNC.whyAnalysis?.rootCause || ''}
                    onChange={(e) => {
                      const updatedWhy = {
                        ...(activeNC.whyAnalysis || { why1: '', why2: '', why3: '', why4: '', why5: '', rootCause: '' }),
                        rootCause: e.target.value,
                      };
                      setActiveNC({ ...activeNC, whyAnalysis: updatedWhy });
                    }}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Tareas del plan de acción */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    4. Propuesta de Acciones Correctivas
                  </h4>
                  <span className="text-xs text-slate-400">
                    {activeNC.actions.filter(a => a.status === 'completada').length} de {activeNC.actions.length} completadas
                  </span>
                </div>

                <div className="space-y-2">
                  {activeNC.actions.length === 0 ? (
                    <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                      No hay tareas registradas aún.
                    </div>
                  ) : (
                    activeNC.actions.map((action) => {
                      const isDone = action.status === 'completada';
                      return (
                        <div
                          key={action.id}
                          className={'p-3 rounded-xl border transition-all flex items-start gap-3 ' + (
                            isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'
                          )}
                        >
                          <button
                            type="button"
                            disabled={isRectorado}
                            onClick={() => !isRectorado && handleToggleActionStatus(action.id)}
                            className={`mt-0.5 text-slate-400 ${isRectorado ? 'cursor-default opacity-75' : 'hover:text-emerald-600 cursor-pointer'}`}
                          >
                            {isDone ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={'text-xs font-medium ' + (isDone ? 'line-through text-slate-400' : 'text-slate-800')}>
                              {action.description}
                            </p>
                            <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1">
                              <span>Responsable: <strong className="text-slate-600">{action.responsible}</strong></span>
                              <span>Plazo: <strong className="text-slate-600">{action.deadline}</strong></span>
                              {action.evidenceNotes && (
                                <span className="text-emerald-700 italic font-medium truncate">Evidencia: {action.evidenceNotes}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {!isRectorado && (
                  <form onSubmit={handleAddAction} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Descripción de la acción correctiva..."
                      value={newActionText}
                      onChange={(e) => setNewActionText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <input
                      type="text"
                      placeholder="Responsable"
                      value={newActionResponsible}
                      onChange={(e) => setNewActionResponsible(e.target.value)}
                      className="w-full sm:w-36 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <input
                      type="date"
                      value={newActionDeadline}
                      onChange={(e) => setNewActionDeadline(e.target.value)}
                      className="w-full sm:w-32 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                    >
                      + Agregar Acción
                    </button>
                  </form>
                )}
              </div>

              {activeNC.status === 'cerrada' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cierre de Eficacia Verificado por la Oficina de Calidad (GECA)</span>
                  </div>
                  <p className="text-slate-600 mt-1">{activeNC.verificationNotes}</p>
                  <div className="text-slate-400 text-[11px] pt-1">
                    Verificado el {activeNC.verificationDate} por {activeNC.verifiedBy}
                  </div>
                </div>
              ) : isRectorado ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>🏛️ Supervisión de Alta Dirección (Rectorado / Consejo Universitario)</span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Visualización ejecutiva de la No Conformidad y avance del plan de acción correctiva. La verificación de cierre y eficacia es una función operativa exclusiva de la Oficina de Calidad (GECA).
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verificación de Eficacia para Cierre Formal (ISO 21001 Cl. 10.2 / PE.02.04.02)</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Detalla las evidencias comprobadas que demuestran que la causa raíz fue eliminada..."
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                  <button
                    onClick={handleCloseVerification}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Verificar y Cerrar No Conformidad
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <button
                onClick={() => alert('Generando acta PDF de No Conformidad UPT para: ' + activeNC.code)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-red-700" />
                <span>Imprimir Formato RG08.PE.02</span>
              </button>
              <button
                onClick={() => setActiveNC(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear No Conformidad */}
      {isOpenNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900">Apertura de No Conformidad (RG08.PE.02)</h3>
              </div>
              <button 
                onClick={onCloseNewModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNC} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Hallazgo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Incumplimiento en plazo de publicación de sílabos"
                  value={newNCData.title}
                  onChange={(e) => setNewNCData({ ...newNCData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Origen (Tipo de NC)
                  </label>
                  <select
                    value={newNCData.source}
                    onChange={(e) => setNewNCData({ ...newNCData, source: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Auditoría Interna ISO 21001 (PE.02.04.01)">Auditoría Interna ISO 21001</option>
                    <option value="Auditoría Externa / SUNEDU">Auditoría Externa / SUNEDU</option>
                    <option value="Queja / Reclamo Estudiantil (PE.02.01.04)">Queja / Reclamo Estudiantil (Libro Reclamaciones)</option>
                    <option value="Salida No Conforme (PE.02.01.03)">Salida No Conforme (RG06.PE.02)</option>
                    <option value="Revisión por la Dirección (PE.02.01.01)">Revisión por la Dirección (Consejo Univ.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Severidad
                  </label>
                  <select
                    value={newNCData.severity}
                    onChange={(e) => setNewNCData({ ...newNCData, severity: e.target.value as NonConformitySeverity })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="mayor">Mayor (Incumplimiento crítico de la norma/CBC)</option>
                    <option value="menor">Menor (Desviación puntual sin impacto severo)</option>
                    <option value="observacion">Observación (Oportunidad de mejora preventiva)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proceso UPT Afectado *
                  </label>
                  <select
                    value={newNCData.processCode}
                    onChange={(e) => setNewNCData({ ...newNCData, processCode: e.target.value as ProcessLevel0 })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {UPT_PROCESSES.map((proc) => (
                      <option key={proc.code} value={proc.code}>
                        {proc.code} - {proc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cláusula ISO 21001 Aplicable
                  </label>
                  <input
                    type="text"
                    value={newNCData.isoClause}
                    onChange={(e) => setNewNCData({ ...newNCData, isoClause: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción Detallada de la Evidencia Encontrada
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalla qué evidencia se encontró conforme al formato RG08..."
                  value={newNCData.description}
                  onChange={(e) => setNewNCData({ ...newNCData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseNewModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Registrar No Conformidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
