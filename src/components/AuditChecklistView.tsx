import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  PieChart,
  Calendar,
  Clock,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Lock,
  Unlock,
  FileText,
  Filter,
  Info,
  CheckCircle,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import { 
  AuditChecklistItem, 
  AuditProcessSession,
  NonConformity, 
  UserProfile, 
  EvaluationYear,
  ProcessLevel0 
} from '../types';
import { 
  getEvaluationYears, 
  openNewEvaluationYear, 
  toggleYearStatus,
  getAuditSessions,
  saveAuditSessions,
  updateAuditSession,
  addAuditSession 
} from '../services/storage';

interface AuditChecklistViewProps {
  checklist: AuditChecklistItem[];
  nonConformities?: NonConformity[];
  activeUser: UserProfile;
  onUpdateItem: (item: AuditChecklistItem) => void;
  onCreateCapaFromFinding: (item: AuditChecklistItem) => void;
  onNavigateToCapa?: (capaCode?: string) => void;
  onOpenNewCapa?: () => void;
}

export const AuditChecklistView: React.FC<AuditChecklistViewProps> = ({
  checklist,
  nonConformities = [],
  activeUser,
  onUpdateItem,
  onCreateCapaFromFinding,
  onNavigateToCapa,
  onOpenNewCapa,
}) => {
  const isAdmin = activeUser.role === 'geca';
  const isRectorado = activeUser.role === 'rectorado';
  const isAuditorOrAdmin = !isRectorado && (isAdmin || activeUser.role === 'auditor');

  // --- GOBERNANZA MULTIANUAL ---
  const [years, setYears] = useState<EvaluationYear[]>(() => getEvaluationYears());
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isOpeningYearModal, setIsOpeningYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState<number>(2027);

  const selectedYearObj = useMemo(() => {
    return years.find((y) => y.year === selectedYear) || { year: selectedYear, status: 'abierto' as const };
  }, [years, selectedYear]);

  const isYearClosed = selectedYearObj.status === 'cerrado';

  const handleToggleCloseYear = () => {
    if (!isAdmin) return;
    const action = isYearClosed ? 'reabrir' : 'cerrar';
    const confirmMsg = isYearClosed
      ? `¿Está seguro de REABRIR el ciclo de auditoría del año ${selectedYear}? Se reactivará el registro de hallazgos.`
      : `¿Está seguro de CERRAR el ciclo de auditoría del año ${selectedYear}? El expediente quedará congelado en modo solo lectura para auditorías externas y Revisión por la Dirección.`;

    if (window.confirm(confirmMsg)) {
      const updated = toggleYearStatus(selectedYear, activeUser.name);
      setYears(updated);
    }
  };

  const handleCreateNewYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (years.some((y) => y.year === newYearInput)) {
      alert(`El año ${newYearInput} ya se encuentra registrado.`);
      return;
    }
    const updated = openNewEvaluationYear(newYearInput, activeUser.name);
    setYears(updated);
    setSelectedYear(newYearInput);
    setIsOpeningYearModal(false);
  };

  // --- PESTAÑAS DE VISTA ---
  const [viewTab, setViewTab] = useState<'plan_procesos' | 'matriz_global' | 'trazabilidad_ncs'>('plan_procesos');

  // --- SESIONES DE AUDITORÍA POR PROCESO / OFICINA ---
  const [sessions, setSessions] = useState<AuditProcessSession[]>(() => getAuditSessions());
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<string>('ALL');
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  // Form nueva sesión
  const [newProcessCode, setNewProcessCode] = useState<ProcessLevel0>('PM.01');
  const [newProcessName, setNewProcessName] = useState('Formación Profesional y Docencia');
  const [newOffice, setNewOffice] = useState('Facultades y Escuelas Profesionales');
  const [newResponsible, setNewResponsible] = useState('Director de Escuela');
  const [newAuditor, setNewAuditor] = useState('Auditor Interno SGC');
  const [newDate, setNewDate] = useState('2026-10-20');
  const [newSchedule, setNewSchedule] = useState('09:00 - 12:00');
  const [newClauses, setNewClauses] = useState('7.2, 8.2 & 8.3');

  // Filtrar sesiones por año
  const currentYearSessions = useMemo(() => {
    return sessions.filter((s) => s.year === selectedYear);
  }, [sessions, selectedYear]);

  // Sesiones filtradas por proceso
  const filteredSessions = useMemo(() => {
    if (selectedProcessFilter === 'ALL') return currentYearSessions;
    return currentYearSessions.filter((s) => s.processCode === selectedProcessFilter);
  }, [currentYearSessions, selectedProcessFilter]);

  // Manejo de crear nueva sesión
  const handleSaveNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (isYearClosed) return;

    const parsedClauses = newClauses.split(',').map((c) => c.trim()).filter(Boolean);
    const created = addAuditSession({
      year: selectedYear,
      processCode: newProcessCode,
      processName: newProcessName,
      office: newOffice,
      responsible: newResponsible,
      auditor: newAuditor,
      date: newDate,
      schedule: newSchedule,
      clauses: parsedClauses,
      status: 'programada',
      notes: 'Sesión programada en el Plan Anual de Auditoría SGC UPT.',
    });

    setSessions(getAuditSessions());
    setIsNewSessionModalOpen(false);
  };

  // Toggle estado de sesión
  const handleToggleSessionStatus = (session: AuditProcessSession) => {
    if (isYearClosed || !isAuditorOrAdmin) return;
    const nextStatus: 'programada' | 'en_curso' | 'completada' = 
      session.status === 'programada' ? 'en_curso' : session.status === 'en_curso' ? 'completada' : 'programada';
    
    const updated = { ...session, status: nextStatus };
    updateAuditSession(updated);
    setSessions(getAuditSessions());
  };

  // --- FILTROS DE MATRIZ GLOBAL ---
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filteredChecklist = checklist.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  // Métricas de Checklist Global
  const total = checklist.length;
  const conformeCount = checklist.filter((c) => c.status === 'conforme').length;
  const noConformeCount = checklist.filter((c) => c.status === 'no_conforme').length;
  const observacionCount = checklist.filter((c) => c.status === 'observacion').length;
  const evaluatedCount = total - checklist.filter((c) => c.status === 'no_evaluado').length;
  const score = evaluatedCount > 0 ? Math.round((conformeCount / evaluatedCount) * 100) : 0;

  // Filtrado de No Conformidades vinculadas al año
  const currentYearNCs = useMemo(() => {
    return nonConformities.filter((nc) => {
      return nc.detectedDate ? nc.detectedDate.includes(String(selectedYear)) : true;
    });
  }, [nonConformities, selectedYear]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* CABECERA PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Auditoría de Sistemas de Gestión Educativa &bull; ISO 21001:2018 / ISO 19011</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1.5">
            Plan y Evaluación de Auditoría Interna UPT
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5 leading-relaxed">
            Gestión sistemática del programa de auditoría por procesos y dependencias, verificación de requisitos normativos y trazabilidad en tiempo real con las No Conformidades (CAPA).
          </p>
        </div>

        {/* Resumen de Índice Global */}
        <div className="flex items-center gap-4 bg-white p-3.5 px-5 rounded-2xl border border-slate-200 shadow-2xs shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Índice de Calidad SGOE
            </div>
            <div className="text-2xl font-black text-blue-700">
              {score}% Conforme
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100 shadow-inner">
            <PieChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* BARRA DE GOBERNANZA MULTIANUAL */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Selector de Año y Badge de Estado */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Ciclo de Auditoría:
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {years.map((y) => (
              <button
                key={y.year}
                type="button"
                onClick={() => setSelectedYear(y.year)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === y.year
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {y.year} {y.year === 2026 && '(Base)'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {isYearClosed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Expediente Cerrado (Solo Lectura)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ciclo Abierto (En Evaluación)</span>
              </span>
            )}
          </div>
        </div>

        {/* Acciones de Administrador */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleCloseYear}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border ${
                isYearClosed
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
                  : 'bg-rose-700 hover:bg-rose-800 text-white border-rose-800'
              }`}
              title={isYearClosed ? 'Reabrir ciclo de auditoría' : 'Cerrar y blindar expediente de auditoría'}
            >
              {isYearClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isYearClosed ? `Reabrir Auditoría ${selectedYear}` : `Cerrar Auditoría ${selectedYear}`}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpeningYearModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border border-slate-900"
              title="Aperturar un nuevo año para el Plan de Auditorías"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-300" />
              <span>Aumentar Año</span>
            </button>
          </div>
        )}
      </div>

      {/* BANNER INSTITUCIONAL DE CIERRE */}
      {isYearClosed && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 shadow-2xs">
          <Lock className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-sm text-rose-900">
              Expediente de Auditoría {selectedYear} Cerrado Oficialmente
            </span>
            <p className="mt-0.5 text-rose-800 leading-relaxed">
              El ciclo anual de auditorías internas del año {selectedYear} ha concluido. Todos los dictámenes, evidencias y notas de campo están blindados en modo solo lectura para la Revisión por la Dirección y la auditoría de certificación de los entes externos (SGS / TÜV).
            </p>
          </div>
        </div>
      )}

      {/* PESTAÑAS DE VISTA DUAL: PROCESOS vs MATRIZ GLOBAL vs NO CONFORMIDADES */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setViewTab('plan_procesos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewTab === 'plan_procesos'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Plan por Procesos y Dependencias ({currentYearSessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('matriz_global')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewTab === 'matriz_global'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Matriz Global ISO 21001 (11 Cláusulas)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('trazabilidad_ncs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewTab === 'trazabilidad_ncs'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>Trazabilidad de No Conformidades ({currentYearNCs.length})</span>
          </button>
        </div>

        {/* Botón para programar nueva sesión de auditoría */}
        {viewTab === 'plan_procesos' && isAuditorOrAdmin && !isYearClosed && (
          <button
            type="button"
            onClick={() => setIsNewSessionModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-blue-900 border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-700" />
            <span>Programar Sesión de Auditoría</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: PLAN Y AGENDA DE AUDITORÍA POR PROCESOS/OFICINAS */}
      {/* ======================================================== */}
      {viewTab === 'plan_procesos' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Filtro por Macroproceso / Proceso */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Filtrar por Proceso Auditado:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedProcessFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  selectedProcessFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos los Procesos ({currentYearSessions.length})
              </button>
              {['PE.01', 'PE.02', 'PM.01', 'PM.02', 'PM.03', 'PS.01', 'PS.04'].map((pCode) => (
                <button
                  key={pCode}
                  type="button"
                  onClick={() => setSelectedProcessFilter(pCode)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    selectedProcessFilter === pCode
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pCode}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Sesiones de Auditoría por Proceso / Dependencia */}
          <div className="grid grid-cols-1 gap-5">
            {filteredSessions.map((session) => {
              // Buscar las preguntas / requisitos que audita esta sesión
              const sessionItems = checklist.filter((item) => 
                session.clauses.some((cl) => item.clause.includes(cl) || cl.includes(item.clause))
              );

              // Buscar No Conformidades asociadas a este proceso
              const sessionNCs = nonConformities.filter((nc) => 
                nc.processCode === session.processCode || session.clauses.some((cl) => nc.isoClause?.includes(cl))
              );

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Encabezado de la Sesión */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-black font-mono bg-blue-900 text-white shadow-2xs">
                          {session.processCode}
                        </span>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          {session.processName}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          session.status === 'completada'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : session.status === 'en_curso'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {session.status === 'completada' ? '✓ Auditada' : session.status === 'en_curso' ? 'En Auditoría' : 'Programada'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-y-1 gap-x-4 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <strong>Dependencia:</strong> {session.office}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <strong>Auditado:</strong> {session.responsible}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <strong>Auditor:</strong> {session.auditor}
                        </span>
                      </div>
                    </div>

                    {/* Fecha, Horario y Acción */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-xs">
                        <div className="font-bold text-slate-800 flex items-center justify-end gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.schedule}</span>
                        </div>
                      </div>

                      {isAuditorOrAdmin && !isYearClosed && (
                        <button
                          type="button"
                          onClick={() => handleToggleSessionStatus(session)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                          title="Cambiar estado de la sesión de auditoría"
                        >
                          {session.status === 'completada' ? 'Reabrir Sesión' : 'Marcar Completada'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cláusulas y Preguntas Auditadas para esta Oficina */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Requisitos y Evidencias Evaluadas en esta Oficina ({sessionItems.length})</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Cláusulas asignadas: {session.clauses.join(', ')}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
                      {sessionItems.map((item) => (
                        <div key={item.id} className="p-4 bg-white hover:bg-slate-50/70 transition-colors space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-800">
                                Cláusula {item.clause}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {item.clauseTitle}
                              </span>
                            </div>

                            {/* Botones de Dictamen */}
                            {!isRectorado && !isYearClosed ? (
                              <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onUpdateItem({ ...item, status: 'conforme' })}
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                    item.status === 'conforme'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  ✓ Conforme
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onUpdateItem({ ...item, status: 'no_conforme' })}
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                    item.status === 'no_conforme'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  ✗ No Conforme
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onUpdateItem({ ...item, status: 'observacion' })}
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                    item.status === 'observacion'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  ⚠ Observación
                                </button>
                              </div>
                            ) : (
                              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                                item.status === 'conforme'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'no_conforme'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.status === 'conforme' ? '✓ Conforme' : item.status === 'no_conforme' ? '✗ No Conforme' : '⚠ Observación'}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <strong>Pregunta del Auditor:</strong> {item.evidenceQuestion}
                          </div>

                          {item.notes && (
                            <div className="text-[11px] text-slate-500 italic">
                              <strong>Anotación de campo:</strong> {item.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel de Trazabilidad: No Conformidades detectadas en esta oficina */}
                  {sessionNCs.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>No Conformidades / Hallazgos Registrados en esta Dependencia ({sessionNCs.length}):</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {sessionNCs.map((nc) => (
                          <div
                            key={nc.id}
                            className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between text-xs"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-black text-rose-900 bg-rose-200/70 px-2 py-0.5 rounded-md text-[10px]">
                                  {nc.code}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  nc.status === 'cerrada'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {nc.status === 'cerrada' ? '✓ Cerrada eficaz' : 'Pendiente / En Plan'}
                                </span>
                              </div>
                              <h4 className="font-bold text-slate-900 mt-1.5 leading-snug line-clamp-2">
                                {nc.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                {nc.description}
                              </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">
                                Cláusula: <strong>{nc.isoClause}</strong>
                              </span>
                              {onNavigateToCapa && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateToCapa(nc.code)}
                                  className="font-bold text-blue-900 hover:text-blue-950 inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Ver Plan CAPA</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: MATRIZ GLOBAL ISO 21001 (11 CLÁUSULAS NORMATIVAS) */}
      {/* ======================================================== */}
      {viewTab === 'matriz_global' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Tarjetas de Métricas de Auditoría */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Requisitos</div>
              <div className="text-2xl font-black mt-1">{total}</div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('conforme')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                statusFilter === 'conforme'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-600/20'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Conformes</div>
              <div className="text-2xl font-black mt-1 text-emerald-700">{conformeCount}</div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('no_conforme')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                statusFilter === 'no_conforme'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-600/20'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">No Conformidades</div>
              <div className="text-2xl font-black mt-1 text-rose-700">{noConformeCount}</div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('observacion')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                statusFilter === 'observacion'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-600/20'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Observaciones</div>
              <div className="text-2xl font-black mt-1 text-amber-700">{observacionCount}</div>
            </button>
          </div>

          {/* Listado de los 11 Requisitos de Auditoría */}
          <div className="space-y-4">
            {filteredChecklist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-900 text-white">
                      Cláusula {item.clause}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.clauseTitle}
                    </h3>
                  </div>

                  {!isRectorado && !isYearClosed ? (
                    <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateItem({ ...item, status: 'conforme' })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          item.status === 'conforme'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Conforme
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateItem({ ...item, status: 'no_conforme' })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          item.status === 'no_conforme'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        No Conforme
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateItem({ ...item, status: 'observacion' })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          item.status === 'observacion'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Observación
                      </button>
                    </div>
                  ) : (
                    <span className={`px-3 py-1 text-xs font-bold rounded-xl ${
                      item.status === 'conforme'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'no_conforme'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status === 'conforme' ? '✓ Conforme' : item.status === 'no_conforme' ? '✗ No Conforme' : '⚠ Observación'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600">
                  {item.requirement}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Evidencia o Pregunta del Auditor:</span>
                  <p className="text-slate-600 mt-0.5">{item.evidenceQuestion}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-slate-500">
                    <span className="font-semibold">Hallazgo registrado:</span>{' '}
                    <span className="text-slate-700 italic">{item.notes || 'Sin anotaciones de campo.'}</span>
                  </div>

                  {item.status === 'no_conforme' && (item.findingReference || !isRectorado) && (
                    <button
                      type="button"
                      onClick={() => onCreateCapaFromFinding(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 transition-colors cursor-pointer shrink-0"
                    >
                      <span>{item.findingReference ? (`Ver Ticket ${item.findingReference}`) : 'Generar Ticket CAPA'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 3: TRAZABILIDAD DE NO CONFORMIDADES (CAPA)          */}
      {/* ======================================================== */}
      {viewTab === 'trazabilidad_ncs' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Padrón Consolidado de No Conformidades &bull; Cláusula 10.2</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1.5">
                Trazabilidad de Hallazgos y Acciones Correctivas (Año {selectedYear})
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl mt-0.5 leading-relaxed">
                Todas las No Conformidades detectadas en auditoría interna, revisión por la dirección y quejas de partes interesadas se encuentran enlazadas aquí con su oficina y cláusula correspondiente.
              </p>
            </div>

            {onOpenNewCapa && isAuditorOrAdmin && !isYearClosed && (
              <button
                type="button"
                onClick={onOpenNewCapa}
                className="px-4 py-2.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-rose-200" />
                <span>Nueva No Conformidad</span>
              </button>
            )}
          </div>

          {currentYearNCs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentYearNCs.map((nc) => (
                <div
                  key={nc.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-slate-900 text-white shadow-2xs">
                        {nc.code}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        nc.severity === 'mayor'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        Severidad {nc.severity}
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm leading-snug">
                      {nc.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {nc.description}
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Proceso UPT:</span>
                        <span className="font-bold text-blue-900 font-mono">{nc.processCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Cláusula ISO:</span>
                        <span className="font-bold text-slate-800">{nc.isoClause || '7.2 / 8.2'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Origen:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={nc.source}>
                          {nc.source}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Dependencia:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={nc.department}>
                          {nc.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      nc.status === 'cerrada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {nc.status === 'cerrada' ? '✓ Cerrada eficaz' : 'Acciones: ' + (nc.actions?.length || 0)}
                    </span>

                    {onNavigateToCapa && (
                      <button
                        type="button"
                        onClick={() => onNavigateToCapa(nc.code)}
                        className="font-bold text-blue-900 hover:text-blue-950 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Gestionar en CAPA</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">
                No hay No Conformidades activas en el año {selectedYear}
              </div>
              <p className="max-w-md mx-auto text-slate-500">
                Los procesos auditados cumplen con los estándares normativos de la ISO 21001:2018.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PROGRAMAR NUEVA SESIÓN DE AUDITORÍA POR PROCESO  */}
      {/* ======================================================== */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Programar Sesión de Auditoría &bull; Plan {selectedYear}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewSessionModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNewSession} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Código de Proceso UPT:
                </label>
                <select
                  value={newProcessCode}
                  onChange={(e) => {
                    const code = e.target.value as ProcessLevel0;
                    setNewProcessCode(code);
                    if (code === 'PE.01') {
                      setNewProcessName('Planeamiento Institucional');
                      setNewOffice('Jefe de la Oficina de Planeamiento y Desarrollo');
                      setNewResponsible('Jefe de la Oficina de Planeamiento y Desarrollo');
                    } else if (code === 'PE.02') {
                      setNewProcessName('Gestión de la Calidad Institucional');
                      setNewOffice('Jefe de la Oficina de Gestión de la Calidad');
                      setNewResponsible('Jefe de la Oficina de Gestión de la Calidad');
                    } else if (code === 'PM.01') {
                      setNewProcessName('Formación Profesional y Docencia');
                      setNewOffice('Facultades y Escuelas Profesionales / GPAD');
                      setNewResponsible('Director de Escuela / GPAD');
                    } else if (code === 'PM.02') {
                      setNewProcessName('Investigación, Desarrollo e Innovación');
                      setNewOffice('Vicerrectorado de Investigación / Escuela de Posgrado');
                      setNewResponsible('Vicerrectorado de Investigación / PITT');
                    } else if (code === 'PM.03') {
                      setNewProcessName('Responsabilidad Social Universitaria');
                      setNewOffice('Jefe de la Oficina de Responsabilidad Social Universitaria');
                      setNewResponsible('Jefe de la Oficina de Responsabilidad Social Universitaria');
                    } else if (code === 'PS.01') {
                      setNewProcessName('Gestión del Potencial Humano');
                      setNewOffice('Jefe del Área de Potencial Humano');
                      setNewResponsible('Jefe del Área de Potencial Humano');
                    } else if (code === 'PS.04') {
                      setNewProcessName('Tecnologías de la Información y Conectividad');
                      setNewOffice('Jefe de la Oficina de Tecnología de Información');
                      setNewResponsible('Jefe de la Oficina de Tecnología de Información');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PE.01">PE.01 - Planeamiento Institucional</option>
                  <option value="PE.02">PE.02 - Gestión de la Calidad</option>
                  <option value="PM.01">PM.01 - Formación Profesional y Docencia</option>
                  <option value="PM.02">PM.02 - Investigación, Desarrollo e Innovación</option>
                  <option value="PM.03">PM.03 - Responsabilidad Social Universitaria</option>
                  <option value="PS.01">PS.01 - Potencial Humano (APHU)</option>
                  <option value="PS.02">PS.02 - Gestión de Biblioteca y Recursos</option>
                  <option value="PS.04">PS.04 - Tecnologías de la Información (TEIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dependencia u Oficina Auditada:
                </label>
                <input
                  type="text"
                  value={newOffice}
                  onChange={(e) => setNewOffice(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Fecha de Auditoría:
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Horario Programado:
                  </label>
                  <input
                    type="text"
                    value={newSchedule}
                    onChange={(e) => setNewSchedule(e.target.value)}
                    placeholder="09:00 - 12:00"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Auditor Asignado:
                </label>
                <input
                  type="text"
                  value={newAuditor}
                  onChange={(e) => setNewAuditor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cláusulas Normativas a Evaluar (separadas por coma):
                </label>
                <input
                  type="text"
                  value={newClauses}
                  onChange={(e) => setNewClauses(e.target.value)}
                  placeholder="Ej: 7.2, 8.2 & 8.3, 8.5.1.3"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-blue-300" />
                  <span>Programar en el Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: APERTURAR NUEVO AÑO DE AUDITORÍA                   */}
      {/* ======================================================== */}
      {isOpeningYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Aperturar Ciclo de Auditoría SGC
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpeningYearModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewYear} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Como Administrador del SGC (GECA), puede habilitar un nuevo año para el Plan y Programa de Auditorías Internas (ISO 21001:2018 / ISO 19011).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Año de Auditoría:
                </label>
                <input
                  type="number"
                  min="2026"
                  max="2035"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(parseInt(e.target.value, 10) || 2027)}
                  className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-700 shrink-0" />
                  Gobernanza del Ciclo Anual
                </div>
                <p className="mt-1 text-[11px] text-blue-800 leading-relaxed">
                  El nuevo período se aperturará en estado <strong>Abierto</strong>, permitiendo agendar sesiones por oficina y dictaminar hallazgos hasta su cierre formal.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpeningYearModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-blue-300" />
                  <span>Aperturar Año {newYearInput}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
