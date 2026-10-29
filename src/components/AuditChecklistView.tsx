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
  FolderOpen,
  Search,
  Edit3,
  Save,
  ExternalLink,
  Sparkles,
  Check,
  Layers,
  ChevronRight
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
  scopeMode?: 'my_office' | 'all';
  onToggleScopeMode?: (mode: 'my_office' | 'all') => void;
}

export const AuditChecklistView: React.FC<AuditChecklistViewProps> = ({
  checklist,
  nonConformities = [],
  activeUser,
  onUpdateItem,
  onCreateCapaFromFinding,
  onNavigateToCapa,
  onOpenNewCapa,
  scopeMode = 'all',
  onToggleScopeMode,
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
  const [searchFilter, setSearchFilter] = useState<string>('');
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

  // Modal para edición rápida de anotaciones de campo del auditor
  const [editingItemNote, setEditingItemNote] = useState<AuditChecklistItem | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  const handleOpenNoteEditor = (item: AuditChecklistItem) => {
    setEditingItemNote(item);
    setTempNoteText(item.notes || '');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemNote) return;
    onUpdateItem({
      ...editingItemNote,
      notes: tempNoteText.trim(),
    });
    setEditingItemNote(null);
  };

  // Filtrar sesiones por año y por alcance de oficina
  const currentYearSessions = useMemo(() => {
    let list = sessions.filter((s) => s.year === selectedYear);
    if (scopeMode === 'my_office' && !isAdmin && !isRectorado && activeUser.role !== 'auditor') {
      const officeTerm = (activeUser.officeName || activeUser.department).toLowerCase();
      list = list.filter((s) => {
        const matchesProc = activeUser.processCodes && activeUser.processCodes.includes(s.processCode);
        const matchesOffice = s.office.toLowerCase().includes(officeTerm) || officeTerm.includes(s.office.toLowerCase());
        const matchesResp = s.responsible.toLowerCase().includes(activeUser.name.toLowerCase());
        return Boolean(matchesProc || matchesOffice || matchesResp);
      });
    }
    return list;
  }, [sessions, selectedYear, scopeMode, activeUser, isAdmin, isRectorado]);

  // Sesiones filtradas por proceso y búsqueda
  const filteredSessions = useMemo(() => {
    return currentYearSessions.filter((s) => {
      const matchesProc = selectedProcessFilter === 'ALL' || s.processCode === selectedProcessFilter;
      const term = searchFilter.toLowerCase().trim();
      const matchesSearch = !term || 
        s.processName.toLowerCase().includes(term) ||
        s.office.toLowerCase().includes(term) ||
        s.responsible.toLowerCase().includes(term) ||
        s.auditor.toLowerCase().includes(term) ||
        s.processCode.toLowerCase().includes(term);
      return matchesProc && matchesSearch;
    });
  }, [currentYearSessions, selectedProcessFilter, searchFilter]);

  // Manejo de crear nueva sesión
  const handleSaveNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (isYearClosed) return;

    const parsedClauses = newClauses.split(',').map((c) => c.trim()).filter(Boolean);
    addAuditSession({
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
      notes: 'Sesión programada en el Plan Anual de Auditoría SGC UPT (NTP-ISO 21001:2026 Cl. 9.2).',
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
  const [matrixSearch, setMatrixSearch] = useState<string>('');

  const filteredChecklist = useMemo(() => {
    return checklist.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const term = matrixSearch.toLowerCase().trim();
      const matchesSearch = !term ||
        item.clause.toLowerCase().includes(term) ||
        item.clauseTitle.toLowerCase().includes(term) ||
        item.requirement.toLowerCase().includes(term) ||
        item.evidenceQuestion.toLowerCase().includes(term) ||
        (item.notes && item.notes.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [checklist, statusFilter, matrixSearch]);

  // Métricas de Checklist Global
  const total = checklist.length;
  const conformeCount = checklist.filter((c) => c.status === 'conforme').length;
  const noConformeCount = checklist.filter((c) => c.status === 'no_conforme').length;
  const observacionCount = checklist.filter((c) => c.status === 'observacion').length;
  const evaluatedCount = total - checklist.filter((c) => c.status === 'no_evaluado').length;
  const score = evaluatedCount > 0 ? Math.round((conformeCount / evaluatedCount) * 100) : 0;

  // Filtrado de No Conformidades vinculadas al año y alcance de oficina
  const currentYearNCs = useMemo(() => {
    let list = nonConformities.filter((nc) => {
      return nc.detectedDate ? nc.detectedDate.includes(String(selectedYear)) : true;
    });
    if (scopeMode === 'my_office' && !isAdmin && !isRectorado && activeUser.role !== 'auditor') {
      const officeTerm = (activeUser.officeName || activeUser.department).toLowerCase();
      list = list.filter((nc) => {
        const matchesProc = activeUser.processCodes && activeUser.processCodes.includes(nc.processCode);
        const matchesDept = nc.department.toLowerCase().includes(officeTerm) || officeTerm.includes(nc.department.toLowerCase());
        return Boolean(matchesProc || matchesDept);
      });
    }
    return list;
  }, [nonConformities, selectedYear, scopeMode, activeUser, isAdmin, isRectorado]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ======================================================== */}
      {/* CABECERA PRINCIPAL CON ESTILO STITCH Y REFERENCIA NORMATIVA OFICIAL */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d2d3f] via-[#133e54] to-[#0a2332] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        {/* Glow decorativo de fondo */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-gradient-to-br from-[#9C7D0F]/20 to-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#9C7D0F]/25 text-[#fbf7ee] border border-[#9C7D0F]/40 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-[#e2c866]" />
              <span>NTP-ISO 21001:2026 (EQV. ISO 21001:2025) Cláusula 9.2 &bull; Directrices ISO 19011:2018</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Programa y Evaluación de Auditoría Interna UPT
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Supervisión sistemática de los 13 macroprocesos institucionales bajo el ciclo <strong>PHVA</strong>.
              Garantiza imparcialidad e independencia de los auditores, verificación de requisitos normativos (Cláusulas 4 a 10) 
              y articulación directa con el tratamiento de hallazgos en el <strong>Registro RG08</strong>.
            </p>
          </div>

          {/* Panel de Métrica de Conformidad SGOE (Sparkline / Traffic Light) */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-2xl shrink-0 min-w-[280px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  Índice de Conformidad SGOE
                </span>
                <div className="text-3xl font-black text-white mt-0.5 flex items-baseline gap-1.5">
                  <span>{score}%</span>
                  <span className="text-xs font-semibold text-slate-300">Conforme</span>
                </div>
              </div>

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-inner ${
                score >= 85 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                  : score >= 60 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
              }`}>
                <PieChart className="w-6 h-6" />
              </div>
            </div>

            {/* Barra de Progreso Semafórica hacia la meta (≥85%) */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Meta SGOE: ≥ 85%</span>
                <span className={`font-bold ${
                  score >= 85 ? 'text-emerald-300' : score >= 60 ? 'text-amber-300' : 'text-rose-300'
                }`}>
                  {score >= 85 ? '🟢 Cumplimiento Óptimo' : score >= 60 ? '🟡 Alerta / Oportunidades' : '🔴 Crítico / No Conforme'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    score >= 85 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                      : score >= 60 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                      : 'bg-gradient-to-r from-rose-600 to-red-400'
                  }`}
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span>0%</span>
                <span className="text-[#e2c866] font-bold">85% Umbral Mínimo</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BARRA DE GOBERNANZA MULTIANUAL STITCH                    */}
      {/* ======================================================== */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Selector de Año y Badge de Estado */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#9C7D0F]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ciclo Anual de Auditoría:
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {years.map((y) => (
              <button
                key={y.year}
                type="button"
                onClick={() => setSelectedYear(y.year)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === y.year
                    ? 'bg-[#0d2d3f] text-white shadow-sm ring-2 ring-[#0d2d3f]/20'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {y.year} {y.year === 2026 && '(Base SGOE)'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {isYearClosed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Expediente Cerrado (Solo Lectura)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ciclo Abierto (En Evaluación)</span>
              </span>
            )}
          </div>
        </div>

        {/* Acciones de Administrador (GECA) */}
        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleCloseYear}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
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
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0d2d3f] hover:bg-[#133e54] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-[#0d2d3f]"
              title="Aperturar un nuevo año para el Plan de Auditorías"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#e2c866]" />
              <span>Aperturar Año</span>
            </button>
          </div>
        )}
      </div>

      {/* BANNER INSTITUCIONAL CUANDO EL EXPEDIENTE ESTÁ CERRADO */}
      {isYearClosed && (
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 shadow-xs">
          <Lock className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-sm text-rose-900">
              Expediente de Auditoría {selectedYear} Cerrado Oficialmente
            </span>
            <p className="mt-0.5 text-rose-800 leading-relaxed">
              El ciclo anual de auditorías internas del año {selectedYear} ha concluido. Todos los dictámenes, evidencias y notas de campo están blindados en modo solo lectura para la Revisión por la Dirección (Cláusula 9.3) y la auditoría externa de certificación.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PESTAÑAS PRINCIPALES DE NAVEGACIÓN (STITCH PILLS)        */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setViewTab('plan_procesos')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              viewTab === 'plan_procesos'
                ? 'bg-[#0d2d3f] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#e2c866]" />
            <span>Plan por Procesos y Dependencias ({currentYearSessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('matriz_global')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              viewTab === 'matriz_global'
                ? 'bg-[#0d2d3f] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-[#e2c866]" />
            <span>Matriz Global NTP-ISO 21001:2026 ({checklist.length} Requisitos)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('trazabilidad_ncs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              viewTab === 'trazabilidad_ncs'
                ? 'bg-[#0d2d3f] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Trazabilidad PHVA de Hallazgos ({currentYearNCs.length})</span>
          </button>
        </div>

        {/* Botón para programar nueva sesión de auditoría */}
        {viewTab === 'plan_procesos' && isAuditorOrAdmin && !isYearClosed && (
          <button
            type="button"
            onClick={() => setIsNewSessionModalOpen(true)}
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#9C7D0F] hover:bg-[#83690d] text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Programar Sesión de Auditoría</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: PLAN Y AGENDA DE AUDITORÍA POR PROCESOS/OFICINAS */}
      {/* ======================================================== */}
      {viewTab === 'plan_procesos' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Banner de Espacio de Trabajo por Oficina */}
          {scopeMode === 'my_office' && !isAdmin && !isRectorado && activeUser.role !== 'auditor' && (
            <div className="p-4 rounded-3xl bg-blue-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0d2d3f] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-blue-800 block">
                    Agenda de Auditoría de Mi Oficina
                  </span>
                  <p className="text-xs text-blue-900 mt-0.5">
                    Mostrando las sesiones y requisitos asignados a: <strong>{activeUser.officeName || activeUser.department}</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleScopeMode?.('all')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#0d2d3f] hover:bg-blue-100 border border-blue-200 transition-colors shadow-xs cursor-pointer shrink-0"
              >
                Ver Plan Institucional Completo
              </button>
            </div>
          )}

          {/* Barra de Búsqueda y Filtro por Macroproceso / Proceso */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por proceso, dependencia o auditor..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedProcessFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  selectedProcessFilter === 'ALL'
                    ? 'bg-[#0d2d3f] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({currentYearSessions.length})
              </button>
              {['PE.01', 'PE.02', 'PE.03', 'PM.01', 'PM.02', 'PM.03', 'PS.01', 'PS.04'].map((pCode) => (
                <button
                  key={pCode}
                  type="button"
                  onClick={() => setSelectedProcessFilter(pCode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    selectedProcessFilter === pCode
                      ? 'bg-[#0d2d3f] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pCode}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Sesiones de Auditoría por Proceso / Dependencia */}
          {filteredSessions.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredSessions.map((session) => {
                // Requisitos que audita esta sesión
                const sessionItems = checklist.filter((item) => 
                  session.clauses.some((cl) => item.clause.includes(cl) || cl.includes(item.clause))
                );

                // No Conformidades asociadas a este proceso
                const sessionNCs = nonConformities.filter((nc) => 
                  nc.processCode === session.processCode || session.clauses.some((cl) => nc.isoClause?.includes(cl))
                );

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-[#9C7D0F]/40 transition-all space-y-5"
                  >
                    {/* Encabezado de la Sesión con Paleta Stitch */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="px-3 py-1 rounded-xl text-xs font-black font-mono bg-[#0d2d3f] text-white shadow-xs">
                            {session.processCode}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {session.processName}
                          </h3>
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            session.status === 'completada'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : session.status === 'en_curso'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {session.status === 'completada' ? '✓ Auditada' : session.status === 'en_curso' ? 'En Auditoría' : 'Programada'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-y-1.5 gap-x-5 pt-1">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#9C7D0F]" />
                            <strong className="text-slate-700">Dependencia:</strong> {session.office}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <strong className="text-slate-700">Auditado:</strong> {session.responsible}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <strong className="text-slate-700">Auditor:</strong> {session.auditor}
                          </span>
                        </div>
                      </div>

                      {/* Fecha, Horario y Acción de Cambio de Estado */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right text-xs">
                          <div className="font-bold text-slate-800 flex items-center justify-end gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#9C7D0F]" />
                            <span>{session.date}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{session.schedule}</span>
                          </div>
                        </div>

                        {isAuditorOrAdmin && !isYearClosed && (
                          <button
                            type="button"
                            onClick={() => handleToggleSessionStatus(session)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border shadow-xs ${
                              session.status === 'completada'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                                : 'bg-[#0d2d3f] hover:bg-[#133e54] text-white border-[#0d2d3f]'
                            }`}
                            title="Cambiar estado de la sesión de auditoría"
                          >
                            {session.status === 'completada' ? 'Reabrir Sesión' : 'Marcar Completada'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Requisitos y Evidencias Evaluadas en esta Dependencia */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#9C7D0F]" />
                          <span>Requisitos y Evidencias Evaluadas ({sessionItems.length})</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Cláusulas asignadas: <strong>{session.clauses.join(', ')}</strong>
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
                        {sessionItems.map((item) => (
                          <div key={item.id} className="p-4 bg-white hover:bg-slate-50/80 transition-colors space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-[#0d2d3f]/10 text-[#0d2d3f] border border-[#0d2d3f]/20">
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
                                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
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
                                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
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
                                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
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

                            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <strong className="text-slate-900">Pregunta y Verificación del Auditor:</strong> {item.evidenceQuestion}
                            </div>

                            {/* Anotación de campo del auditor con botón de edición rápida */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                              <div className="text-slate-600 flex items-center gap-1.5 flex-1">
                                <span className="font-bold text-slate-700">Anotación de campo:</span>
                                <span className="italic text-slate-800">{item.notes || 'Sin anotación registrada.'}</span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isAuditorOrAdmin && !isYearClosed && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenNoteEditor(item)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3 text-[#9C7D0F]" />
                                    <span>Editar Nota</span>
                                  </button>
                                )}

                                {item.status === 'no_conforme' && (
                                  <button
                                    type="button"
                                    onClick={() => onCreateCapaFromFinding(item)}
                                    className="px-3 py-1 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>{item.findingReference ? `Ver Ticket ${item.findingReference}` : '⚡ Aperturar Hallazgo en PHVA'}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Panel de Trazabilidad: No Conformidades detectadas en esta dependencia */}
                    {sessionNCs.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="text-xs font-bold text-rose-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>No Conformidades / Hallazgos Registrados en esta Dependencia ({sessionNCs.length}):</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sessionNCs.map((nc) => (
                            <div
                              key={nc.id}
                              className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col justify-between text-xs space-y-2"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-black text-rose-900 bg-rose-200/80 px-2 py-0.5 rounded-md text-[10px]">
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
                                <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
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
                                    className="font-bold text-[#0d2d3f] hover:text-[#133e54] inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Ver Plan PHVA</span>
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
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">
                No se encontraron sesiones de auditoría programadas
              </div>
              <p className="max-w-md mx-auto text-slate-500">
                Ajuste los filtros o presione "Programar Sesión de Auditoría" para incorporar una nueva dependencia al Plan {selectedYear}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: MATRIZ GLOBAL NTP-ISO 21001:2026 (REQUISITOS)   */}
      {/* ======================================================== */}
      {viewTab === 'matriz_global' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Tarjetas de Métricas de Auditoría */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#0d2d3f] text-white border-[#0d2d3f] shadow-md ring-2 ring-[#0d2d3f]/20'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Requisitos</div>
              <div className="text-2xl font-black mt-1">{total}</div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('conforme')}
              className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
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
              className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
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
              className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
                statusFilter === 'observacion'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-600/20'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Observaciones</div>
              <div className="text-2xl font-black mt-1 text-amber-700">{observacionCount}</div>
            </button>
          </div>

          {/* Barra de Búsqueda de Requisitos */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en matriz por cláusula, título, requisito normativo o evidencia..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
            />
            {matrixSearch && (
              <button
                type="button"
                onClick={() => setMatrixSearch('')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Listado de Requisitos de Auditoría */}
          <div className="space-y-4">
            {filteredChecklist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-[#9C7D0F]/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-[#0d2d3f] text-white shadow-xs">
                      Cláusula {item.clause}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
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

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {item.requirement}
                </p>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-[#0d2d3f] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#9C7D0F]" />
                    Evidencia o Verificación Obligatoria del Auditor:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{item.evidenceQuestion}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-600 flex items-center gap-2 flex-1">
                    <span className="font-bold text-slate-700">Anotación de campo:</span>
                    <span className="italic text-slate-800">{item.notes || 'Sin anotaciones de campo.'}</span>
                    {isAuditorOrAdmin && !isYearClosed && (
                      <button
                        type="button"
                        onClick={() => handleOpenNoteEditor(item)}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-500 cursor-pointer"
                        title="Modificar nota de campo"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#9C7D0F]" />
                      </button>
                    )}
                  </div>

                  {item.status === 'no_conforme' && (item.findingReference || !isRectorado) && (
                    <button
                      type="button"
                      onClick={() => onCreateCapaFromFinding(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 transition-colors cursor-pointer shrink-0"
                    >
                      <span>{item.findingReference ? (`Ver Ticket ${item.findingReference} en PHVA`) : '⚡ Aperturar Hallazgo en Tablero PHVA (RG08)'}</span>
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
      {/* VISTA 3: TRAZABILIDAD DE NO CONFORMIDADES (TABLERO PHVA)   */}
      {/* ======================================================== */}
      {viewTab === 'trazabilidad_ncs' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Padrón Consolidado de Hallazgos y No Conformidades &bull; Cláusula 10.2</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1.5">
                Trazabilidad PHVA de Hallazgos y Acciones Correctivas (Año {selectedYear})
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl mt-0.5 leading-relaxed">
                Cada hallazgo detectado en las auditorías internas se transfiere de inmediato al Tablero PHVA con análisis de causa raíz (Ishikawa / 5 Porqués) y registro formal RG08.
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
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-[#9C7D0F]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-[#0d2d3f] text-white shadow-xs">
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

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Proceso UPT:</span>
                        <span className="font-bold text-[#0d2d3f] font-mono">{nc.processCode}</span>
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
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                        className="font-bold text-[#0d2d3f] hover:text-[#133e54] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Gestionar en PHVA</span>
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
                Los procesos auditados cumplen con los estándares normativos de la NTP-ISO 21001:2026.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PROGRAMAR NUEVA SESIÓN DE AUDITORÍA POR PROCESO  */}
      {/* ======================================================== */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#0d2d3f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#e2c866]" />
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
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
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
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
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
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cláusulas Normativas a Evaluar (NTP-ISO 21001:2026):
                </label>
                <input
                  type="text"
                  value={newClauses}
                  onChange={(e) => setNewClauses(e.target.value)}
                  placeholder="Ej: 7.2, 8.2 & 8.3, 8.5.1.3"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0d2d3f] hover:bg-[#133e54] transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-[#e2c866]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#0d2d3f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[#e2c866]" />
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
                Como Administrador del SGC (GECA), puede habilitar un nuevo año para el Plan y Programa de Auditorías Internas (NTP-ISO 21001:2026 / ISO 19011:2018).
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
                  className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-slate-50"
                  required
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#0d2d3f] shrink-0" />
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
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0d2d3f] hover:bg-[#133e54] transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-[#e2c866]" />
                  <span>Aperturar Año {newYearInput}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDICIÓN RÁPIDA DE NOTAS DE CAMPO DEL AUDITOR       */}
      {/* ======================================================== */}
      {editingItemNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#0d2d3f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-[#e2c866]" />
                <h3 className="text-sm font-bold tracking-tight">
                  Anotación de Campo del Auditor &bull; Cláusula {editingItemNote.clause}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItemNote(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Requisito Auditado:</span>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">{editingItemNote.clauseTitle}</p>
                <p className="text-[11px] text-slate-600 mt-1">{editingItemNote.requirement}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Observaciones, Hallazgo o Evidencia Inspeccionada:
                </label>
                <textarea
                  rows={4}
                  value={tempNoteText}
                  onChange={(e) => setTempNoteText(e.target.value)}
                  placeholder="Detalle los hallazgos observados, actas revisadas, expedientes o evidencias constatadas in situ..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                  required
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <p className="text-[11px] leading-relaxed">
                  💡 <strong>Nota del Auditor:</strong> Esta información queda consignada en el informe oficial de auditoría interna y sustentará el cierre o apertura de tickets en el tablero PHVA.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItemNote(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0d2d3f] hover:bg-[#133e54] transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#e2c866]" />
                  <span>Guardar Anotación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
