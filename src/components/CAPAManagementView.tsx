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
  ChevronRight,
  Columns,
  Grid,
  TrendingUp,
  ArrowRight,
  Clock,
  FileText,
  UserCheck,
  PenTool,
  GitBranch,
  Building2,
  Calendar,
  Lock,
  ExternalLink,
  Award,
  Sparkles,
  Layers,
  Check,
  FileCheck2,
  Send
} from 'lucide-react';
import { 
  NonConformity, 
  NonConformitySeverity, 
  NonConformityStatus,
  CorrectiveAction,
  UserProfile,
  ProcessLevel0,
  IshikawaAnalysis
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

const SEVERITY_CONFIG: Record<NonConformitySeverity, { label: string; color: string; badge: string; border: string }> = {
  mayor: { label: 'Mayor', color: 'text-rose-700 bg-rose-50 border-rose-200', badge: 'bg-rose-600', border: 'border-rose-300' },
  menor: { label: 'Menor', color: 'text-amber-700 bg-amber-50 border-amber-200', badge: 'bg-amber-500', border: 'border-amber-300' },
  observacion: { label: 'Observación', color: 'text-blue-700 bg-blue-50 border-blue-200', badge: 'bg-blue-500', border: 'border-blue-300' },
};

// Catálogo Oficial de Cláusulas de la Norma ISO 21001:2025 para Organizaciones Educativas
const ISO_21001_CLAUSES = [
  { code: '4.1/4.2', label: 'Cláusula 4.1 & 4.2 - Contexto y partes interesadas educativas' },
  { code: '4.4', label: 'Cláusula 4.4 - Sistema de Gestión para Organizaciones Educativas (SGOE)' },
  { code: '5.1/5.2', label: 'Cláusula 5.1 & 5.2 - Liderazgo, compromiso y política de calidad UPT' },
  { code: '5.3', label: 'Cláusula 5.3 - Roles, responsabilidades y autoridades institucionales' },
  { code: '6.1', label: 'Cláusula 6.1 - Acciones para abordar riesgos y oportunidades (IPERC)' },
  { code: '6.2', label: 'Cláusula 6.2 - Objetivos del SGOE y planificación para lograrlos' },
  { code: '7.1', label: 'Cláusula 7.1 - Recursos, instalaciones, laboratorios y campus' },
  { code: '7.2/7.3', label: 'Cláusula 7.2 & 7.3 - Competencia y toma de conciencia del personal docente y admin' },
  { code: '7.5', label: 'Cláusula 7.5 - Información documentada y trazabilidad (Manuales/Procedimientos)' },
  { code: '8.1', label: 'Cláusula 8.1 - Planificación y control operacional del servicio educativo' },
  { code: '8.2', label: 'Cláusula 8.2 - Requisitos para los productos y servicios educativos' },
  { code: '8.5.1', label: 'Cláusula 8.5.1 - Provisión del servicio educativo y entrega de enseñanza' },
  { code: '8.5.1.3', label: 'Cláusula 8.5.1.3 - Estudiantes con necesidades educativas especiales (NEE)' },
  { code: '8.7', label: 'Cláusula 8.7 - Control de las salidas educativas no conformes (RG06)' },
  { code: '9.1', label: 'Cláusula 9.1 - Seguimiento, medición, análisis y evaluación (61 KPIs)' },
  { code: '9.2', label: 'Cláusula 9.2 - Auditoría interna del SGOE (PE.02.04.01)' },
  { code: '9.3', label: 'Cláusula 9.3 - Revisión por la dirección (Consejo Universitario)' },
  { code: '10.1', label: 'Cláusula 10.1 - No conformidad y acción correctiva (RG08.PE.02)' },
  { code: '10.2', label: 'Cláusula 10.2 - Mejora continua institucional' },
];

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
  const isAuditor = activeUser.role === 'auditor' || isAdmin;

  // Estado de Vista: 'pdca' (Kanban 4 Fases) vs 'grid' (Cuadrícula Clásica)
  const [viewMode, setViewMode] = useState<'pdca' | 'grid'>('pdca');

  // Filtros de Búsqueda y Severidad
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'mayor' | 'menor' | 'observacion'>('all');

  // No Conformidad Activa para Inspección Detallada
  const [activeNC, setActiveNC] = useState<NonConformity | null>(null);

  // Sub-pestaña dentro del Modal de Causa Raíz: 'why' (5 Porqués) vs 'ishikawa' (Espina de Pescado 4M)
  const [rootCauseTab, setRootCauseTab] = useState<'why' | 'ishikawa'>('why');

  // Pestaña principal dentro del Modal de Detalle: 'causa' | 'acciones' | 'cierre'
  const [detailModalTab, setDetailModalTab] = useState<'causa' | 'acciones' | 'cierre'>('causa');

  // Formulario para Nueva Acción Correctiva
  const [newActionText, setNewActionText] = useState('');
  const [newActionResponsible, setNewActionResponsible] = useState(activeUser.name);
  const [newActionDeadline, setNewActionDeadline] = useState('');

  // Formulario de Cierre / Verificación
  const [closeNotes, setCloseNotes] = useState('');
  const [evidenceNameInput, setEvidenceNameInput] = useState('');
  const [evidenceUrlInput, setEvidenceUrlInput] = useState('');

  // Estado para Nuevo Registro de Hallazgo (Modal Crystalline)
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
    isoClause: 'Cláusula 8.5.1 - Provisión del servicio educativo y entrega de enseñanza',
    department: 'Facultades y Escuelas Profesionales UPT',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: activeUser.name,
  });

  // Filtrado de No Conformidades
  const filteredNCs = nonConformities.filter((nc) => {
    const matchesSeverity = severityFilter === 'all' || nc.severity === severityFilter;

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      nc.title.toLowerCase().includes(term) ||
      nc.code.toLowerCase().includes(term) ||
      nc.department.toLowerCase().includes(term) ||
      nc.isoClause.toLowerCase().includes(term) ||
      nc.processCode.toLowerCase().includes(term);

    let matchesScope = true;
    if (scopeMode === 'my_office' && !isAdmin && !isRectorado && activeUser.role !== 'auditor') {
      const officeTerm = (activeUser.officeName || activeUser.department).toLowerCase();
      const matchesProc = activeUser.processCodes && activeUser.processCodes.includes(nc.processCode);
      const matchesDept = nc.department.toLowerCase().includes(officeTerm) || officeTerm.includes(nc.department.toLowerCase());
      matchesScope = Boolean(matchesProc || matchesDept);
    }

    return matchesSeverity && matchesSearch && matchesScope;
  });

  // Conteo por Fases PDCA
  const pdcaCounts = {
    plan: filteredNCs.filter(nc => nc.status === 'abierta' || nc.status === 'analisis_causa').length,
    do: filteredNCs.filter(nc => nc.status === 'plan_aprobado' || nc.status === 'en_implementacion').length,
    check: filteredNCs.filter(nc => nc.status === 'en_verificacion').length,
    act: filteredNCs.filter(nc => nc.status === 'cerrada').length,
    total: filteredNCs.length,
  };

  // Creación de No Conformidad (Formulario Crystalline)
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
      ishikawaAnalysis: {
        method: '',
        people: '',
        materials: '',
        measurement: '',
      },
      actions: [],
    };

    onSaveCAPA(newNC);
    onCloseNewModal();
  };

  // Transición rápida entre fases PDCA
  const handleAdvancePDCAStep = (nc: NonConformity, nextStatus: NonConformityStatus) => {
    const updatedNC: NonConformity = {
      ...nc,
      status: nextStatus,
    };
    onSaveCAPA(updatedNC);
    if (activeNC && activeNC.id === nc.id) {
      setActiveNC(updatedNC);
    }
  };

  // Agregar Acción Correctiva
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

  // Toggle estado de acción correctiva
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

  // Guardar Análisis de Causa Raíz
  const handleSaveRootCauseAnalysis = () => {
    if (!activeNC) return;
    onSaveCAPA(activeNC);
    alert('Análisis de Causa Raíz (5 Porqués / Ishikawa) guardado exitosamente en el formato RG08.PE.02.');
  };

  // Firma del Auditado (Dueño del Proceso)
  const handleSignAsAudited = () => {
    if (!activeNC) return;
    const updatedNC: NonConformity = {
      ...activeNC,
      auditedSignature: activeUser.name,
      auditedSignedAt: new Date().toISOString().split('T')[0],
      evidenceName: evidenceNameInput || activeNC.evidenceName || 'Plan_de_Subsanacion_y_Evidencias.pdf',
      evidenceUrl: evidenceUrlInput || activeNC.evidenceUrl || '',
    };
    onSaveCAPA(updatedNC);
    setActiveNC(updatedNC);
    alert(`Firma del Auditado registrada: ${activeUser.name} ha ratificado el compromiso de subsanación.`);
  };

  // Verificación y Firma de Eficacia (Auditor / Calidad GECA)
  const handleCloseVerification = () => {
    if (!activeNC) return;
    if (!closeNotes && !activeNC.verificationNotes) {
      alert('Debes ingresar las conclusiones de verificación de eficacia.');
      return;
    }
    const notes = closeNotes || activeNC.verificationNotes || 'Eficacia verificada conforme por Calidad.';
    
    // Guardar con firmas completas
    const updatedNC: NonConformity = {
      ...activeNC,
      status: 'cerrada',
      verificationDate: new Date().toISOString().split('T')[0],
      verifiedBy: activeUser.name,
      verificationNotes: notes,
      auditorSignature: activeUser.name,
      auditorSignedAt: new Date().toISOString().split('T')[0],
      evidenceName: evidenceNameInput || activeNC.evidenceName,
    };

    onSaveCAPA(updatedNC);
    onCloseCAPA(activeNC.id, activeUser.name, notes);
    setActiveNC(null);
    setCloseNotes('');
    alert('No Conformidad cerrada eficazmente en el SGC UPT (ISO 21001 Cl. 10.2).');
  };

  const renderPDCACard = (nc: NonConformity, stage: 'plan' | 'do' | 'check' | 'act') => {
    const sev = SEVERITY_CONFIG[nc.severity];
    const completedActions = nc.actions.filter(a => a.status === 'completada').length;
    const totalActions = nc.actions.length;
    const progressPct = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

    return (
      <div
        key={nc.id}
        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
      >
        <div className="space-y-2.5">
          {/* Encabezado con Código y Severidad */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-black tracking-wider bg-slate-900 text-white font-mono shadow-2xs">
              {nc.code}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${sev.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sev.badge}`}></span>
              <span>{sev.label}</span>
            </span>
          </div>

          {/* Título del Hallazgo */}
          <h4 
            onClick={() => {
              setActiveNC(nc);
              setDetailModalTab('causa');
            }}
            className="font-bold text-slate-900 text-xs leading-snug cursor-pointer hover:text-blue-900 hover:underline line-clamp-2"
            title={nc.title}
          >
            {nc.title}
          </h4>

          {/* Chip de Cláusula ISO */}
          <div className="text-[10px] text-slate-600 font-semibold bg-slate-50 border border-slate-200/70 p-1.5 rounded-xl truncate" title={nc.isoClause}>
            <span className="text-[#9C7D0F] font-bold">ISO: </span>
            <span>{nc.isoClause.replace(/^Cláusula\s*/i, '')}</span>
          </div>

          {/* Información de Proceso y Dependencia */}
          <div className="text-[10px] text-slate-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Proceso:</span>
              <span className="font-bold text-slate-800">{nc.processCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Área:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={nc.department}>
                {nc.department}
              </span>
            </div>
          </div>

          {/* Barra de Progreso de Acciones Correctivas */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Acciones:</span>
              <span className="font-bold text-slate-800">{completedActions}/{totalActions} ({progressPct}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPct === 100 ? 'bg-emerald-500' : progressPct > 0 ? 'bg-amber-500' : 'bg-slate-300'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Acciones y Transición de Fases PDCA */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setActiveNC(nc);
              setDetailModalTab('causa');
            }}
            className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer hover:underline"
          >
            Detalles
          </button>

          {!isRectorado && (
            <div>
              {stage === 'plan' && (
                <button
                  type="button"
                  onClick={() => handleAdvancePDCAStep(nc, 'en_implementacion')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] shadow-2xs transition-colors cursor-pointer"
                  title="Avanzar a la fase de Hacer (Ejecución de Acciones)"
                >
                  <span>A Hacer (D)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {stage === 'do' && (
                <button
                  type="button"
                  onClick={() => handleAdvancePDCAStep(nc, 'en_verificacion')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-[10px] shadow-2xs transition-colors cursor-pointer"
                  title="Enviar a Verificación formal por Calidad"
                >
                  <span>A Verificar (C)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {stage === 'check' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveNC(nc);
                    setDetailModalTab('cierre');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[10px] shadow-2xs transition-colors cursor-pointer"
                  title="Auditar eficacia y cerrar hallazgo"
                >
                  <span>Cerrar (A)</span>
                  <ShieldCheck className="w-3 h-3" />
                </button>
              )}
              {stage === 'act' && (
                <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Eficaz</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* CABECERA INSTITUCIONAL STITCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wider text-[#0d2d3f] bg-[#0d2d3f]/10 border border-[#0d2d3f]/20 font-mono shadow-2xs">
              RG08.PE.02
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <Sparkles className="w-3 h-3 text-[#9C7D0F]" />
              <span>Cláusula 10 &bull; ISO 21001:2025</span>
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Auditorías y Gestión de No Conformidades (CAPA - PDCA)
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Gestión del ciclo de mejora continua en la Universidad Privada de Tacna mediante el <strong>Tablero Interactivo de Fases PDCA</strong>, <strong>análisis de causa raíz (Ishikawa / 5 Porqués)</strong> y <strong>dictamen formal de eficacia</strong>.
          </p>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isRectorado ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Supervisión Alta Dirección (Solo Lectura)</span>
            </div>
          ) : (
            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0d2d3f] hover:bg-[#001826] text-white font-bold text-xs shadow-md shadow-[#0d2d3f]/25 border border-[#9C7D0F]/40 transition-all cursor-pointer"
              title="Aperturar una nueva No Conformidad o Hallazgo de Auditoría"
            >
              <Plus className="w-4 h-4 text-[#9C7D0F]" />
              <span>Reportar Hallazgo (RG08)</span>
            </button>
          )}
        </div>
      </div>

      {/* TARJETA DE RESUMEN PDCA (4 FASES DEL CICLO DE MEJORA) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Fase P - Planificar */}
        <div className="bg-gradient-to-br from-blue-900 to-[#0d2d3f] text-white p-4 rounded-3xl border border-blue-700/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>1. Planificar (P)</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
              {pdcaCounts.plan}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black">{pdcaCounts.plan}</div>
            <div className="text-[10px] text-blue-200/80 mt-0.5">Detección y Causa Raíz</div>
          </div>
        </div>

        {/* Fase D - Hacer */}
        <div className="bg-gradient-to-br from-amber-900 to-[#4a3400] text-white p-4 rounded-3xl border border-amber-700/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>2. Hacer (D)</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
              {pdcaCounts.do}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black">{pdcaCounts.do}</div>
            <div className="text-[10px] text-amber-200/80 mt-0.5">Acciones en Ejecución</div>
          </div>
        </div>

        {/* Fase C - Verificar */}
        <div className="bg-gradient-to-br from-purple-950 to-[#2e1065] text-white p-4 rounded-3xl border border-purple-700/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>3. Verificar (C)</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
              {pdcaCounts.check}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black">{pdcaCounts.check}</div>
            <div className="text-[10px] text-purple-200/80 mt-0.5">Auditoría de Eficacia</div>
          </div>
        </div>

        {/* Fase A - Actuar */}
        <div className="bg-gradient-to-br from-emerald-950 to-[#064e3b] text-white p-4 rounded-3xl border border-emerald-700/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>4. Actuar (A)</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
              {pdcaCounts.act}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black">{pdcaCounts.act}</div>
            <div className="text-[10px] text-emerald-200/80 mt-0.5">Cierre y Estandarización</div>
          </div>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS: SELECTOR DE VISTA (PDCA vs GRID) Y BUSCADOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-3xl border border-slate-200 shadow-2xs">
        {/* Selector de Modo de Vista */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('pdca')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'pdca'
                  ? 'bg-[#0d2d3f] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Tablero PDCA (4 Fases)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-[#0d2d3f] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Fichas / Lista ({filteredNCs.length})</span>
            </button>
          </div>

          {/* Filtro por Severidad */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                severityFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSeverityFilter('mayor')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                severityFilter === 'mayor' ? 'bg-rose-700 text-white' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Mayores
            </button>
            <button
              onClick={() => setSeverityFilter('menor')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                severityFilter === 'menor' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Menores
            </button>
            <button
              onClick={() => setSeverityFilter('observacion')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                severityFilter === 'observacion' ? 'bg-blue-700 text-white' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              Observaciones
            </button>
          </div>
        </div>

        {/* Buscador Rápido */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, título, cláusula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-slate-50/50"
          />
        </div>
      </div>

      {/* VISTA 1: TABLERO INTERACTIVO DE FASES PDCA (4 COLUMNAS KANBAN) */}
      {viewMode === 'pdca' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {/* COLUMNA 1: PLANIFICAR (P) */}
          <div className="bg-slate-100/70 p-3.5 rounded-3xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="font-black text-xs uppercase tracking-wider text-blue-950">
                  Planificar (P)
                </span>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                {pdcaCounts.plan}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 px-1">Detección del hallazgo y determinación de causa raíz</p>

            <div className="space-y-3">
              {filteredNCs
                .filter((nc) => nc.status === 'abierta' || nc.status === 'analisis_causa')
                .map((nc) => renderPDCACard(nc, 'plan'))}
              {pdcaCounts.plan === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                  Sin hallazgos en fase de Planificación.
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 2: HACER (D) */}
          <div className="bg-slate-100/70 p-3.5 rounded-3xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="font-black text-xs uppercase tracking-wider text-amber-950">
                  Hacer (D)
                </span>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {pdcaCounts.do}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 px-1">Ejecución de acciones correctivas y compromisos</p>

            <div className="space-y-3">
              {filteredNCs
                .filter((nc) => nc.status === 'plan_aprobado' || nc.status === 'en_implementacion')
                .map((nc) => renderPDCACard(nc, 'do'))}
              {pdcaCounts.do === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                  Sin acciones en fase de Ejecución.
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 3: VERIFICAR (C) */}
          <div className="bg-slate-100/70 p-3.5 rounded-3xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <span className="font-black text-xs uppercase tracking-wider text-purple-950">
                  Verificar (C)
                </span>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                {pdcaCounts.check}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 px-1">Auditoría formal de eficacia y contraste de evidencias</p>

            <div className="space-y-3">
              {filteredNCs
                .filter((nc) => nc.status === 'en_verificacion')
                .map((nc) => renderPDCACard(nc, 'check'))}
              {pdcaCounts.check === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                  Sin hallazgos en fase de Verificación.
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 4: ACTUAR (A) */}
          <div className="bg-slate-100/70 p-3.5 rounded-3xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="font-black text-xs uppercase tracking-wider text-emerald-950">
                  Actuar (A)
                </span>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                {pdcaCounts.act}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 px-1">Cierre formal eficaz, estandarización y lecciones</p>

            <div className="space-y-3">
              {filteredNCs
                .filter((nc) => nc.status === 'cerrada')
                .map((nc) => renderPDCACard(nc, 'act'))}
              {pdcaCounts.act === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                  Sin hallazgos cerrados todavía.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: CUADRÍCULA / LISTA DE FICHAS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNCs.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200">
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
                  onClick={() => {
                    setActiveNC(nc);
                    setDetailModalTab('causa');
                  }}
                  className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isClosed ? 'border-slate-200 bg-slate-50/40 opacity-85' : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wider bg-slate-900 text-white font-mono shadow-2xs">
                        {nc.code}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${sev.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sev.badge}`}></span>
                        <span>{sev.label}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                        {nc.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {nc.description}
                      </p>
                    </div>

                    {/* Cláusula ISO vinculada */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 max-w-full truncate">
                      <Sparkles className="w-3 h-3 text-[#9C7D0F] shrink-0" />
                      <span className="truncate">{nc.isoClause}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Proceso UPT:</span>
                        <span className="font-bold text-slate-800">{nc.processCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Dependencia:</span>
                        <span className="font-bold text-slate-700 truncate max-w-[180px]">{nc.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      {isClosed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cerrada eficaz</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          Acciones: <strong className="text-slate-900">{completedActions}/{nc.actions.length}</strong>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[#0d2d3f] font-bold text-xs hover:underline">
                      <span>Gestionar</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL CRYSTALLINE: APERTURA DE NO CONFORMIDAD / HALLAZGO (RG08.PE.02) */}
      {isOpenNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera Crystalline con Identidad Stitch */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-[#0d2d3f] to-[#001826] text-white flex items-center justify-between border-b border-[#9C7D0F]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#9C7D0F]/20 border border-[#9C7D0F]/40 flex items-center justify-center text-[#9C7D0F]">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white tracking-wide">
                    Apertura de No Conformidad / Hallazgo
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Formato Oficial RG08.PE.02 &bull; Sistema de Gestión de Calidad UPT
                  </p>
                </div>
              </div>
              <button 
                onClick={onCloseNewModal}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNC} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título del Hallazgo / Desviación Detectada *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Incumplimiento en plazo de publicación de sílabos o actas..."
                  value={newNCData.title}
                  onChange={(e) => setNewNCData({ ...newNCData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Origen del Hallazgo
                  </label>
                  <select
                    value={newNCData.source}
                    onChange={(e) => setNewNCData({ ...newNCData, source: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-white font-medium"
                  >
                    <option value="Auditoría Interna ISO 21001 (PE.02.04.01)">Auditoría Interna ISO 21001</option>
                    <option value="Auditoría Externa / SUNEDU">Auditoría Externa / SUNEDU</option>
                    <option value="Queja / Reclamo Estudiantil (PE.02.01.04)">Queja / Reclamo (Libro Reclamaciones)</option>
                    <option value="Salida No Conforme (PE.02.01.03)">Salida No Conforme (RG06.PE.02)</option>
                    <option value="Revisión por la Dirección (PE.02.01.01)">Revisión por la Dirección (Consejo Univ.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nivel de Severidad
                  </label>
                  <select
                    value={newNCData.severity}
                    onChange={(e) => setNewNCData({ ...newNCData, severity: e.target.value as NonConformitySeverity })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-white font-bold"
                  >
                    <option value="mayor">🔴 Mayor (Incumplimiento crítico de norma/CBC)</option>
                    <option value="menor">🟡 Menor (Desviación puntual sin impacto severo)</option>
                    <option value="observacion">🔵 Observación (Oportunidad de mejora preventiva)</option>
                  </select>
                </div>
              </div>

              {/* Selector Estructurado de Cláusula ISO 21001 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Cláusula ISO 21001:2025 Afectada *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Selecciona del catálogo institucional</span>
                </label>
                <select
                  value={newNCData.isoClause}
                  onChange={(e) => setNewNCData({ ...newNCData, isoClause: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-white font-semibold text-slate-800"
                >
                  {ISO_21001_CLAUSES.map((clause) => (
                    <option key={clause.code} value={clause.label}>
                      {clause.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proceso UPT Afectado *
                  </label>
                  <select
                    value={newNCData.processCode}
                    onChange={(e) => setNewNCData({ ...newNCData, processCode: e.target.value as ProcessLevel0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-white"
                  >
                    {UPT_PROCESSES.map((proc) => (
                      <option key={proc.code} value={proc.code}>
                        {proc.code} - {proc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dependencia / Área Auditada *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Facultad de Ingeniería / OPLA..."
                    value={newNCData.department}
                    onChange={(e) => setNewNCData({ ...newNCData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plazo Límite de Subsanación
                  </label>
                  <input
                    type="date"
                    required
                    value={newNCData.deadline}
                    onChange={(e) => setNewNCData({ ...newNCData, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Responsable Asignado
                  </label>
                  <input
                    type="text"
                    required
                    value={newNCData.assignedTo}
                    onChange={(e) => setNewNCData({ ...newNCData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción Detallada de la Evidencia Objetiva Encontrada
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalla qué evidencia se encontró que sustenta el hallazgo según el formato RG08..."
                  value={newNCData.description}
                  onChange={(e) => setNewNCData({ ...newNCData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-slate-50/50 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseNewModal}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#0d2d3f] hover:bg-[#001826] rounded-xl shadow-xs transition-colors cursor-pointer border border-[#9C7D0F]/40"
                >
                  Registrar No Conformidad (Fase P)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE GESTIÓN INTEGRAL RG08: CAUSA RAÍZ (5 PORQUÉS / ISHIKAWA), ACCIONES Y FIRMAS */}
      {activeNC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera del Hallazgo */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wider bg-slate-900 text-white font-mono shadow-2xs">
                  {activeNC.code}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {activeNC.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Proceso: {activeNC.processCode} &bull; {activeNC.department} &bull; {activeNC.isoClause}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveNC(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas de Gestión Integral del Hallazgo */}
            <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-2 bg-white">
              <button
                onClick={() => setDetailModalTab('causa')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'causa'
                    ? 'border-[#0d2d3f] text-[#0d2d3f]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>1. Causa Raíz (Ishikawa / 5 Porqués)</span>
              </button>
              <button
                onClick={() => setDetailModalTab('acciones')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'acciones'
                    ? 'border-[#0d2d3f] text-[#0d2d3f]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>2. Acciones Correctivas ({activeNC.actions.length})</span>
              </button>
              <button
                onClick={() => setDetailModalTab('cierre')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'cierre'
                    ? 'border-[#0d2d3f] text-[#0d2d3f]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3. Evidencias y Firmas (Cierre Eficaz)</span>
              </button>
            </div>

            {/* CUERPO DEL MODAL SEGÚN PESTAÑA */}
            <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              {/* DESCRIPCIÓN BASE DEL HALLAZGO */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-0.5">Evidencia Objetiva Inicial:</span>
                {activeNC.description}
              </div>

              {/* PESTAÑA 1: INVESTIGACIÓN DE CAUSA RAÍZ (5 PORQUÉS vs ISHIKAWA) */}
              {detailModalTab === 'causa' && (
                <div className="space-y-4">
                  {/* Selector entre 5 Porqués e Ishikawa */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setRootCauseTab('why')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          rootCauseTab === 'why' ? 'bg-[#0d2d3f] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Método de los 5 Porqués
                      </button>
                      <button
                        type="button"
                        onClick={() => setRootCauseTab('ishikawa')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          rootCauseTab === 'ishikawa' ? 'bg-[#0d2d3f] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Diagrama de Ishikawa (Espina de Pescado 4M)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveRootCauseAnalysis}
                      className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                    >
                      Guardar Análisis
                    </button>
                  </div>

                  {/* 1.1 MÉTODO DE LOS 5 PORQUÉS */}
                  {rootCauseTab === 'why' && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                      <div className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-700" />
                        <span>Indagación Secuencial de Causas (5 Porqués)</span>
                      </div>

                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const key = ('why' + num) as keyof typeof activeNC.whyAnalysis;
                          const val = (activeNC.whyAnalysis && activeNC.whyAnalysis[key]) || '';
                          return (
                            <div key={num} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-amber-900 w-24 shrink-0 font-mono">
                                {'¿Por qué ' + num + '?'}
                              </span>
                              <input
                                type="text"
                                placeholder={'Causa intermedia ' + num + '...'}
                                value={val}
                                onChange={(e) => {
                                  const updatedWhy = {
                                    ...(activeNC.whyAnalysis || { why1: '', why2: '', why3: '', why4: '', why5: '', rootCause: '' }),
                                    [key]: e.target.value,
                                  };
                                  setActiveNC({ ...activeNC, whyAnalysis: updatedWhy });
                                }}
                                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 1.2 DIAGRAMA DE ISHIKAWA (ESPINA DE PESCADO SIMPLIFICADO 4M) */}
                  {rootCauseTab === 'ishikawa' && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                      <div className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4 text-blue-700" />
                        <span>Espina de Pescado (Ishikawa 4M Educativo)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* M1: Método y Procedimientos */}
                        <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
                          <label className="font-bold text-slate-800 block">
                            📋 Métodos / Procedimientos:
                          </label>
                          <input
                            type="text"
                            placeholder="Deficiencias en directivas, plazos o flujos..."
                            value={activeNC.ishikawaAnalysis?.method || ''}
                            onChange={(e) => {
                              const updatedIshikawa = {
                                ...(activeNC.ishikawaAnalysis || {}),
                                method: e.target.value,
                              };
                              setActiveNC({ ...activeNC, ishikawaAnalysis: updatedIshikawa });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        {/* M2: Personal y Docencia */}
                        <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
                          <label className="font-bold text-slate-800 block">
                            👥 Personal / Competencias:
                          </label>
                          <input
                            type="text"
                            placeholder="Falta de inducción, capacitación o carga docente..."
                            value={activeNC.ishikawaAnalysis?.people || ''}
                            onChange={(e) => {
                              const updatedIshikawa = {
                                ...(activeNC.ishikawaAnalysis || {}),
                                people: e.target.value,
                              };
                              setActiveNC({ ...activeNC, ishikawaAnalysis: updatedIshikawa });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        {/* M3: Recursos y Tecnología */}
                        <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
                          <label className="font-bold text-slate-800 block">
                            💻 Recursos / TI e Infraestructura:
                          </label>
                          <input
                            type="text"
                            placeholder="Sistemas, software, laboratorios o conectividad..."
                            value={activeNC.ishikawaAnalysis?.materials || ''}
                            onChange={(e) => {
                              const updatedIshikawa = {
                                ...(activeNC.ishikawaAnalysis || {}),
                                materials: e.target.value,
                              };
                              setActiveNC({ ...activeNC, ishikawaAnalysis: updatedIshikawa });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        {/* M4: Medición y Control */}
                        <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-1">
                          <label className="font-bold text-slate-800 block">
                            📊 Medición / Supervisión:
                          </label>
                          <input
                            type="text"
                            placeholder="Falta de alertas tempranas o indicadores..."
                            value={activeNC.ishikawaAnalysis?.measurement || ''}
                            onChange={(e) => {
                              const updatedIshikawa = {
                                ...(activeNC.ishikawaAnalysis || {}),
                                measurement: e.target.value,
                              };
                              setActiveNC({ ...activeNC, ishikawaAnalysis: updatedIshikawa });
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAUSA RAÍZ CONCLUYENTE */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-900">
                      🎯 Causa Raíz Concluyente (Determinación Definitiva)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Conclusión final de la causa raíz identificada..."
                      value={activeNC.whyAnalysis?.rootCause || ''}
                      onChange={(e) => {
                        const updatedWhy = {
                          ...(activeNC.whyAnalysis || { why1: '', why2: '', why3: '', why4: '', why5: '', rootCause: '' }),
                          rootCause: e.target.value,
                        };
                        setActiveNC({ ...activeNC, whyAnalysis: updatedWhy });
                      }}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                    />
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: PLAN DE ACCIONES CORRECTIVAS */}
              {detailModalTab === 'acciones' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Acciones Correctivas Comprometidas
                    </h4>
                    <span className="text-xs text-slate-500">
                      {activeNC.actions.filter(a => a.status === 'completada').length} de {activeNC.actions.length} completadas
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeNC.actions.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        Aún no se han formulado acciones correctivas.
                      </div>
                    ) : (
                      activeNC.actions.map((action) => {
                        const isDone = action.status === 'completada';
                        return (
                          <div
                            key={action.id}
                            className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                              isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'
                            }`}
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
                              <p className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {action.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-1">
                                <span>Responsable: <strong className="text-slate-700">{action.responsible}</strong></span>
                                <span>Plazo: <strong className="text-slate-700">{action.deadline}</strong></span>
                                {action.evidenceNotes && (
                                  <span className="text-emerald-700 font-semibold truncate">Evidencia: {action.evidenceNotes}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Formulario para Agregar Nueva Acción */}
                  {!isRectorado && (
                    <form onSubmit={handleAddAction} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Descripción de la acción correctiva a ejecutar..."
                        value={newActionText}
                        onChange={(e) => setNewActionText(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                      />
                      <input
                        type="text"
                        placeholder="Responsable"
                        value={newActionResponsible}
                        onChange={(e) => setNewActionResponsible(e.target.value)}
                        className="w-full sm:w-36 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                      />
                      <input
                        type="date"
                        value={newActionDeadline}
                        onChange={(e) => setNewActionDeadline(e.target.value)}
                        className="w-full sm:w-32 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0d2d3f] hover:bg-[#001826] text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        + Agregar Acción
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* PESTAÑA 3: EVIDENCIAS DOCUMENTADAS Y FIRMAS (AUDITOR Y AUDITADO) */}
              {detailModalTab === 'cierre' && (
                <div className="space-y-4">
                  {/* SECCIÓN A: EVIDENCIA DOCUMENTADA */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                      <FileText className="w-4 h-4 text-blue-700" />
                      <span>Evidencia Documentada de Subsanación / Plan de Trabajo</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        placeholder="Nombre del archivo (ej. Informe_Subsanacion_FACS_2026.pdf)"
                        value={evidenceNameInput || activeNC.evidenceName || ''}
                        onChange={(e) => setEvidenceNameInput(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                      />
                      <input
                        type="text"
                        placeholder="Enlace URL SharePoint / Nube (Opcional)"
                        value={evidenceUrlInput || activeNC.evidenceUrl || ''}
                        onChange={(e) => setEvidenceUrlInput(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                      />
                    </div>
                  </div>

                  {/* SECCIÓN B: CUADRO DE FIRMAS DIGITALES CRUZADAS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Firma del Auditado (Dueño del Proceso) */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-blue-700" />
                          <span>Firma del Auditado (Dueño de Proceso)</span>
                        </span>
                        {activeNC.auditedSignature && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Ratificado
                          </span>
                        )}
                      </div>

                      {activeNC.auditedSignature ? (
                        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
                          <div className="font-bold text-blue-950">✍️ {activeNC.auditedSignature}</div>
                          <div className="text-[11px] text-blue-800">Fecha: {activeNC.auditedSignedAt}</div>
                          <div className="text-[10px] text-slate-500 italic">Compromiso de plan de acción formalizado.</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-500">
                            El responsable del proceso debe ratificar el compromiso de ejecución del plan correctivo.
                          </p>
                          {!isRectorado && (
                            <button
                              type="button"
                              onClick={handleSignAsAudited}
                              className="w-full py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <PenTool className="w-3.5 h-3.5" />
                              <span>Firmar y Ratificar como Auditado</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. Firma del Auditor Líder (Oficina de Calidad GECA) */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>Firma del Auditor Líder (Calidad GECA)</span>
                        </span>
                        {activeNC.auditorSignature && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Cerrada Eficaz
                          </span>
                        )}
                      </div>

                      {activeNC.auditorSignature ? (
                        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1">
                          <div className="font-bold text-emerald-950">🛡️ {activeNC.auditorSignature}</div>
                          <div className="text-[11px] text-emerald-800">Fecha de Cierre: {activeNC.auditorSignedAt || activeNC.verificationDate}</div>
                          <div className="text-[10px] text-slate-600 mt-1">{activeNC.verificationNotes}</div>
                        </div>
                      ) : isRectorado ? (
                        <p className="text-[11px] text-amber-800 p-3 bg-amber-50 rounded-xl">
                          Modo solo consulta ejecutiva. La validación formal corresponde a Calidad (GECA).
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            placeholder="Conclusiones de verificación de eficacia..."
                            value={closeNotes}
                            onChange={(e) => setCloseNotes(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={handleCloseVerification}
                            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Validar Eficacia y Firmar Cierre Formal (RG08)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PIE DEL MODAL */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex justify-between items-center">
              <button
                onClick={() => alert(`Imprimiendo Acta Oficial RG08.PE.02 de No Conformidad UPT para: ${activeNC.code}`)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-bold cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#0d2d3f]" />
                <span>Imprimir Formato Oficial RG08.PE.02</span>
              </button>
              <button
                onClick={() => setActiveNC(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
