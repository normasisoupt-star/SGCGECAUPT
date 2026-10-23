import React, { useState } from 'react';
import { 
  Search, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  FileText,
  Paperclip,
  Upload,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  BarChart3,
  Calculator,
  History,
  FileCheck,
  Building2,
  FolderOpen,
  Eye,
  PlusCircle,
  AlertTriangle,
  Lock,
  UserCheck,
  ShieldAlert,
  Info
} from 'lucide-react';
import { UPTIndicator, UserProfile, ISODocument, IndicatorMeasurement } from '../types';

interface IndicatorsViewProps {
  indicators: UPTIndicator[];
  documents: ISODocument[];
  activeUser: UserProfile;
  onUpdateIndicator: (indicator: UPTIndicator) => void;
  onAddMeasurement: (code: string, data: Omit<IndicatorMeasurement, 'id' | 'date'>) => void;
  onValidateMeasurement: (code: string, measurementId: string, status: 'validado_conforme' | 'observado', comment: string) => void;
}

export const IndicatorsView: React.FC<IndicatorsViewProps> = ({
  indicators,
  documents,
  activeUser,
  onUpdateIndicator,
  onAddMeasurement,
  onValidateMeasurement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PE' | 'PM' | 'PS'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'validado_conforme' | 'pendiente_validacion' | 'observado'>('ALL');

  // Modales
  const [measuringIndicator, setMeasuringIndicator] = useState<UPTIndicator | null>(null);
  const [auditingIndicator, setAuditingIndicator] = useState<UPTIndicator | null>(null);

  // Form State para Registro de Medición
  const [period, setPeriod] = useState('2026 - Evaluación Anual');
  const [numerator, setNumerator] = useState<number | ''>('');
  const [denominator, setDenominator] = useState<number | ''>('');
  const [directValue, setDirectValue] = useState<number | ''>('');
  const [evidenceType, setEvidenceType] = useState<'file' | 'sharepoint' | 'dms'>('file');
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Form State para Validación de GECA
  const [validationComment, setValidationComment] = useState('');
  const [activeAuditingTab, setActiveAuditingTab] = useState<'sustento' | 'historial'>('sustento');

  // ==========================================
  // MATRIZ DE ROLES Y PERMISOS DE GOBERNANZA
  // ==========================================
  // 1. Administrador: Ve todo, puede registrar y auditar en cualquier indicador
  const isAdmin = activeUser.role === 'geca';
  const isRectorado = activeUser.role === 'rectorado';

  // 2. Auditores o Personal de Calidad designado: Pueden auditar y emitir dictámenes
  const isAuditorOrQuality = !isRectorado && (activeUser.role === 'geca' || activeUser.role === 'auditor');

  // 3. Dueño de Proceso: Puede registrar avance si el proceso le compete (Rectorado nunca es dueño de proceso operativo)
  const isProcessOwner = (ind: UPTIndicator): boolean => {
    if (isRectorado) return false;
    if (isAdmin) return true; // Administrador GECA puede registrar todo

    const pCode = ind.processCode;
    switch (activeUser.role) {
      case 'vrac': // Vicerrectorado Académico
        return pCode === 'PM.01' || pCode === 'PM.03' || pCode === 'PS.02';
      case 'vrin': // Vicerrectorado de Investigación
        return pCode === 'PM.02';
      case 'diga': // Dirección General de Administración
        return pCode.startsWith('PS.') || pCode === 'PE.01'; // Presupuesto y procesos de soporte
      case 'director_escuela': // Decanatos / Directores
        return pCode === 'PM.01' || pCode === 'PM.03';
      case 'auditor':
        return false; // El auditor solo audita e inspecciona
      default:
        return false;
    }
  };

  // Filtrado de Indicadores
  const filtered = indicators.filter((ind) => {
    const matchesSearch = (
      ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.processName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.responsible.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesCategory = 
      categoryFilter === 'ALL' || 
      ind.processCode.startsWith(categoryFilter);

    const currentStatus = ind.validationStatus || 'validado_conforme';
    const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Apertura del modal de registro
  const handleOpenMeasureModal = (ind: UPTIndicator) => {
    if (!isProcessOwner(ind)) {
      alert(`Acceso Restringido: Solo el Dueño de Proceso (${ind.responsible}) o el Administrador pueden registrar avances en este indicador.`);
      return;
    }

    setMeasuringIndicator(ind);
    setPeriod('2026 - Evaluación Anual');
    setEvidenceType('file');
    setEvidenceName(ind.currentEvidenceName || 'Plan_de_Trabajo_Anual_y_Sustento.pdf');
    setEvidenceUrl(ind.currentEvidenceUrl || '');
    setEvidenceNotes('');
    setUploadedFileName('');

    // Pre-cargar valores según tipo de fórmula
    if (ind.formulaType === 'percentage_ratio') {
      const lastMeas = ind.measurements?.[0];
      setNumerator(lastMeas?.numeratorValue ?? Math.round(ind.currentValue * 0.5));
      setDenominator(lastMeas?.denominatorValue ?? 50);
      setDirectValue('');
    } else {
      setNumerator('');
      setDenominator('');
      setDirectValue(ind.currentValue);
    }
  };

  // Cálculo en vivo del valor según variables
  const calculateResultValue = (): number => {
    if (!measuringIndicator) return 0;
    if (measuringIndicator.formulaType === 'percentage_ratio') {
      const num = typeof numerator === 'number' ? numerator : 0;
      const den = typeof denominator === 'number' ? denominator : 1;
      if (den <= 0) return 0;
      return parseFloat(((num / den) * 100).toFixed(1));
    }
    return typeof directValue === 'number' ? directValue : 0;
  };

  // Guardar Medición con Evidencia
  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!measuringIndicator) return;

    if (!evidenceName.trim()) {
      alert('Debe anexar un nombre o archivo de evidencia documental probatoria.');
      return;
    }

    const calculated = calculateResultValue();
    const isDirectApproved = isAdmin; // Si registra el Administrador GECA/Rectorado, se aprueba; si es Dueño de Proceso, va a revisión de calidad

    onAddMeasurement(measuringIndicator.code, {
      indicatorCode: measuringIndicator.code,
      period,
      reportedBy: activeUser.name,
      reportedCharge: activeUser.charge,
      numeratorValue: typeof numerator === 'number' ? numerator : undefined,
      numeratorLabel: measuringIndicator.numeratorLabel,
      denominatorValue: typeof denominator === 'number' ? denominator : undefined,
      denominatorLabel: measuringIndicator.denominatorLabel,
      calculatedValue: calculated,
      unit: measuringIndicator.unit,
      evidenceName: evidenceName.trim(),
      evidenceType,
      evidenceUrl: evidenceUrl.trim() || undefined,
      evidenceNotes: evidenceNotes.trim() || undefined,
      status: isDirectApproved ? 'validado_conforme' : 'pendiente_validacion',
      validatedBy: isDirectApproved ? `${activeUser.name} (${activeUser.charge})` : undefined,
      validatedAt: isDirectApproved ? new Date().toISOString().split('T')[0] : undefined,
      validationComment: isDirectApproved ? 'Validado directamente por la Administración de Calidad' : undefined,
    });

    setMeasuringIndicator(null);
  };

  // Simulación de carga de archivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setEvidenceName(file.name);
      setEvidenceUrl(URL.createObjectURL(file));
    }
  };

  // Seleccionar documento del DMS
  const handleSelectDMSDoc = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    if (!code) return;
    const doc = documents.find(d => d.code === code);
    if (doc) {
      setEvidenceName(`Documento Oficial DMS: ${doc.code} - ${doc.title}`);
      setEvidenceUrl(`/manuals/Manual_de_Procedimientos_Estrategicos_v3.0.pdf#page=40`);
    }
  };

  // Ejecutar Validación de Auditor / Calidad
  const handleValidate = (status: 'validado_conforme' | 'observado') => {
    if (!auditingIndicator) return;
    const latestMeas = auditingIndicator.measurements?.[0];
    if (!latestMeas) return;

    onValidateMeasurement(
      auditingIndicator.code,
      latestMeas.id,
      status,
      validationComment.trim() || (status === 'validado_conforme' ? 'Sustento auditado conforme a requisitos de calidad.' : 'Requiere subsanación documental.')
    );

    setAuditingIndicator(null);
    setValidationComment('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wider bg-blue-900 text-white font-sans shadow-2xs">
              RG04.PE.02
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              Tablero Oficial: Tablero de indicadore 04_10.xlsx
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              61 Indicadores SGC (ISO 21001 / ISO 9001)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            Tablero Oficial de Indicadores de Desempeño
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Estructura institucional oficial basada en <strong>Tablero de indicadore 04_10.xlsx</strong> con <strong>cálculo por variables de fórmula</strong>, anexo de <strong>Plan de Trabajo / evidencias</strong> y <strong>auditoría formal de calidad</strong>.
          </p>
        </div>

        {/* Acciones de Cabecera: SharePoint y Buscador */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <a
            href="https://uptpe-my.sharepoint.com/:x:/g/personal/licencia_institucional_upt_pe/cQpAhYxFB4DSQYDTrW00l2c0EgUCWRroLbxlEUHk8GMiec2r2g"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs cursor-pointer shrink-0"
            title="Abrir Tablero de indicadore 04_10.xlsx en SharePoint UPT (Nube)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
            <span>SharePoint UPT (Excel 04/10)</span>
          </a>

          {/* Buscador Rápido */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por código, nombre, responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Banner de Perfil y Gobernanza Activa */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isRectorado
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : isAdmin 
            ? 'bg-blue-50 border-blue-200 text-blue-950'
            : isAuditorOrQuality 
              ? 'bg-purple-50 border-purple-200 text-purple-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isRectorado
              ? 'bg-amber-600 text-white'
              : isAdmin 
                ? 'bg-blue-700 text-white' 
                : isAuditorOrQuality 
                  ? 'bg-purple-700 text-white' 
                  : 'bg-emerald-700 text-white'
          }`}>
            {isRectorado ? <Eye className="w-5 h-5" /> : isAdmin ? <ShieldCheck className="w-5 h-5" /> : isAuditorOrQuality ? <FileCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">
              {isRectorado 
                ? 'Perfil: Rectorado / Alta Dirección (Supervisión Ejecutiva - Modo Solo Visualización)' 
                : isAdmin 
                  ? 'Perfil: Administrador del Sistema (GECA)' 
                  : isAuditorOrQuality 
                    ? 'Perfil: Auditor Interno / Personal de Calidad' 
                    : `Perfil: Dueño de Proceso (${activeUser.charge})`}
            </div>
            <div className="text-xs mt-0.5 opacity-90">
              {isRectorado && 'Supervisión global de metas, cumplimiento y evidencias documentales para la Revisión por la Dirección (ISO 21001 Cl. 9.3). Modo consulta estricto.'}
              {!isRectorado && isAdmin && 'Tiene permisos completos para registrar avances y validar evidencias en todos los procesos.'}
              {!isRectorado && isAuditorOrQuality && 'Habilitado para auditar sustentos documentales y emitir dictámenes de validación formal.'}
              {!isRectorado && !isAdmin && !isAuditorOrQuality && 'Habilitado para registrar avances y adjuntar el Plan de Trabajo en los procesos que están bajo su cargo.'}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white shadow-2xs border border-slate-200 text-slate-700">
            Usuario: {activeUser.name.split('/')[0].trim()}
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100/70 p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({indicators.length})
          </button>
          <button
            onClick={() => setCategoryFilter('PE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'PE'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Estratégicos PE ({indicators.filter(i => i.processCode.startsWith('PE')).length})
          </button>
          <button
            onClick={() => setCategoryFilter('PM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'PM'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Misionales PM ({indicators.filter(i => i.processCode.startsWith('PM')).length})
          </button>
          <button
            onClick={() => setCategoryFilter('PS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'PS'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Soporte PS ({indicators.filter(i => i.processCode.startsWith('PS')).length})
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <span className="text-[11px] font-bold text-slate-500">Filtrar por Auditoría:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="validado_conforme">🟢 Conforme (Validado Calidad)</option>
            <option value="pendiente_validacion">🟡 Pendiente de Validación</option>
            <option value="observado">🔴 Observado</option>
          </select>
        </div>
      </div>

      {/* Grid de Indicadores Oficiales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((ind) => {
          const status = ind.validationStatus || 'validado_conforme';
          const hasMeasurements = ind.measurements && ind.measurements.length > 0;
          const latestMeas = hasMeasurements ? ind.measurements![0] : null;
          const canRegister = isProcessOwner(ind);
          const canAudit = isAuditorOrQuality || isAdmin;

          return (
            <div
              key={ind.code}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Cabecera del Indicador */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wider bg-slate-900 text-white font-mono shadow-2xs">
                    {ind.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {status === 'validado_conforme' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Validado Calidad</span>
                      </span>
                    )}
                    {status === 'pendiente_validacion' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Por Validar</span>
                      </span>
                    )}
                    {status === 'observado' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Observado</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {ind.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{ind.processCode} &bull; {ind.processName}</span>
                  </div>
                </div>

                {/* Fórmula y Método Oficial */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 space-y-2">
                  <div className="flex items-start gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Fórmula Oficial Aprobada</div>
                      <div className="font-medium text-slate-700 italic">{ind.calculationMethod}</div>
                    </div>
                  </div>

                  {/* Si tiene desglose de fórmula */}
                  {ind.formulaType === 'percentage_ratio' && latestMeas && (
                    <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-100 text-[10px] space-y-1">
                      <div className="font-semibold text-blue-900 flex justify-between">
                        <span>{ind.numeratorLabel || 'Metas ejecutadas'}:</span>
                        <strong className="text-blue-950 font-mono">{latestMeas.numeratorValue ?? '-'}</strong>
                      </div>
                      <div className="font-semibold text-blue-900 flex justify-between">
                        <span>{ind.denominatorLabel || 'Metas programadas en Plan'}:</span>
                        <strong className="text-blue-950 font-mono">{latestMeas.denominatorValue ?? '-'}</strong>
                      </div>
                    </div>
                  )}

                  {/* Evidencia Documental Anexa */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-start gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Evidencia / Plan de Sustento</div>
                      <div className="text-[11px] font-semibold text-blue-800 truncate" title={ind.currentEvidenceName || 'Sin evidencia adjunta'}>
                        {ind.currentEvidenceName || '⚠️ Pendiente de anexar Plan de Trabajo'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas y Acciones según Criterio de Roles */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meta Oficial: {ind.target}</div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1 mt-0.5">
                      <span>{ind.currentValue}</span>
                      <span className="text-xs font-bold text-slate-500">{ind.unit}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Frecuencia: {ind.frequency}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Dueño: {ind.responsible.split('(')[0].trim()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Botón de Auditoría o Consulta */}
                  <button
                    onClick={() => setAuditingIndicator(ind)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      canAudit
                        ? 'border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                    title={canAudit ? 'Auditar sustento y dictaminar conformidad' : 'Ver ficha de sustento y documento probatorio'}
                  >
                    {canAudit ? <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{canAudit ? 'Auditar Sustento' : 'Ver Evidencias'}</span>
                  </button>

                  {/* Botón de Registrar Avance: Solo Dueños de Proceso o Administrador */}
                  {isRectorado ? (
                    <div 
                      className="w-full py-2 px-2 rounded-xl bg-slate-50 text-slate-500 font-semibold text-[11px] flex items-center justify-center gap-1.5 select-none border border-slate-200"
                      title="Rectorado y Alta Dirección supervisa los avances de indicadores en modo solo lectura"
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Solo Visualiza</span>
                    </div>
                  ) : canRegister ? (
                    <button
                      onClick={() => handleOpenMeasureModal(ind)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Registrar nuevo avance con fórmula y evidencia"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-blue-200" />
                      <span>Registrar Avance</span>
                    </button>
                  ) : (
                    <div 
                      className="w-full py-2 px-2 rounded-xl bg-slate-100 text-slate-400 font-medium text-[10px] flex items-center justify-center gap-1 select-none border border-slate-200"
                      title={`Solo el Dueño de Proceso (${ind.responsible}) puede registrar avances`}
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Solo Dueño</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: REGISTRAR NUEVA MEDICIÓN CON FÓRMULA Y EVIDENCIA */}
      {measuringIndicator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-900 text-white font-mono">
                  {measuringIndicator.code}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Registrar Avance por Dueño de Proceso
                </h3>
              </div>
              <button 
                onClick={() => setMeasuringIndicator(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="p-6 space-y-5">
              {/* Resumen del Indicador */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-slate-900 text-xs">
                  {measuringIndicator.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  <strong>Responsable Oficial:</strong> {measuringIndicator.responsible}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  <strong>Método:</strong> {measuringIndicator.calculationMethod}
                </div>
              </div>

              {/* Período de Medición */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Período Evaluado
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                >
                  <option value="2026 - Evaluación Anual">2026 - Evaluación Anual</option>
                  <option value="2026 - Semestre I">2026 - Semestre I</option>
                  <option value="2026 - Semestre II">2026 - Semestre II</option>
                  <option value="2026 - Trimestre IV">2026 - Trimestre IV</option>
                  <option value="2026 - Trimestre III">2026 - Trimestre III</option>
                </select>
              </div>

              {/* SECCIÓN A: DESGLOSE DE FÓRMULA (Variables reales) */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                  <Calculator className="w-4 h-4 text-blue-700" />
                  <span>1. Desglose de Variables de la Fórmula (Cálculo Automático)</span>
                </div>

                {measuringIndicator.formulaType === 'percentage_ratio' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Variable Numerador: {measuringIndicator.numeratorLabel || 'Metas ejecutadas'}
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        placeholder="Ej. 16"
                        value={numerator}
                        onChange={(e) => setNumerator(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Variable Denominador: {measuringIndicator.denominatorLabel || 'Total de metas programadas en el Plan'}
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        required
                        placeholder="Ej. 20"
                        value={denominator}
                        onChange={(e) => setDenominator(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold bg-white"
                      />
                    </div>

                    {/* Visor del Cálculo en Tiempo Real */}
                    <div className="p-3 rounded-xl bg-white border border-blue-300 flex items-center justify-between">
                      <div className="text-xs text-blue-900 font-medium">
                        Fórmula: <code>({numerator || 0} / {denominator || 1}) &times; 100</code>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Porcentaje Calculado:</span>
                        <span className="text-lg font-black text-blue-950 font-mono">
                          {calculateResultValue()}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Valor Obtenido ({measuringIndicator.unit})
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={directValue}
                      onChange={(e) => setDirectValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold bg-white"
                    />
                  </div>
                )}
              </div>

              {/* SECCIÓN B: EVIDENCIA DOCUMENTAL OBLIGATORIA */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <Paperclip className="w-4 h-4 text-amber-700" />
                  <span>2. Anexar Sustento Documental (Plan de Trabajo / Evidencias)</span>
                </div>

                {/* Tipo de Fuente de Evidencia */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEvidenceType('file')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      evidenceType === 'file'
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📁 Subir Archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvidenceType('dms')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      evidenceType === 'dms'
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📄 Procedimiento / Plan del DMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvidenceType('sharepoint')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      evidenceType === 'sharepoint'
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ☁️ SharePoint Nube
                  </button>
                </div>

                {/* Contenido según tipo */}
                {evidenceType === 'file' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Seleccionar Archivo de Sustento (Plan Anual de Trabajo, Informe POI, Excel, PDF):
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls,.docx,.doc"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                    />
                    {uploadedFileName && (
                      <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Archivo adjunto: {uploadedFileName}</span>
                      </div>
                    )}
                  </div>
                )}

                {evidenceType === 'dms' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Seleccionar Procedimiento o Plan Institucional Custodiado:
                    </label>
                    <select
                      onChange={handleSelectDMSDoc}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                    >
                      <option value="">-- Seleccionar Procedimiento Oficial --</option>
                      {documents.map(d => (
                        <option key={d.code} value={d.code}>
                          {d.code} - {d.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {evidenceType === 'sharepoint' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Enlace Directo en SharePoint Institucional UPT:
                    </label>
                    <input
                      type="url"
                      placeholder="https://uptpe-my.sharepoint.com/..."
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>
                )}

                {/* Nombre descriptivo de la evidencia */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nombre Oficial del Documento Anexo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Plan_Anual_de_Trabajo_2026_Aprobado_Res_0418.pdf"
                    value={evidenceName}
                    onChange={(e) => setEvidenceName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>

                {/* Observaciones metodológicas */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Notas u Observaciones del Cálculo
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Indique resoluciones de aprobación, dependencias evaluadas o aclaraciones metodológicas..."
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  {isAdmin ? (
                    <span className="text-blue-700 font-bold">⭐ Su perfil de Administrador validará directamente la medición.</span>
                  ) : (
                    <span className="text-amber-800 font-bold">ℹ️ Ingresará en estado 'Por Validar' para revisión del Equipo Auditor y Calidad.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMeasuringIndicator(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Guardar y Enviar a Calidad
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AUDITORÍA DE EVIDENCIA Y VALIDACIÓN */}
      {auditingIndicator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
            {/* Cabecera Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-900 text-white font-mono shadow-2xs">
                  {auditingIndicator.code}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Ficha Técnica de Sustento y Auditoría de Calidad
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {auditingIndicator.name}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setAuditingIndicator(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pestañas del Modal */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setActiveAuditingTab('sustento')}
                className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeAuditingTab === 'sustento'
                    ? 'bg-white text-blue-900 border-t-2 border-blue-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-800" />
                <span>Sustento Actual y Evidencias</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveAuditingTab('historial')}
                className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeAuditingTab === 'historial'
                    ? 'bg-white text-blue-900 border-t-2 border-blue-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-4 h-4 text-slate-600" />
                <span>Historial de Mediciones ({auditingIndicator.measurements?.length || 0})</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {activeAuditingTab === 'sustento' && (
                <>
                  {/* Tarjetas de Ficha y Variables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tarjeta 1: Objetivo y Meta */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Especificación del Indicador
                      </div>
                      <div className="text-xs text-slate-800 font-medium">
                        <strong>Objetivo:</strong> {auditingIndicator.objective}
                      </div>
                      <div className="text-xs text-slate-800 font-medium">
                        <strong>Frecuencia:</strong> {auditingIndicator.frequency} &bull; <strong>Dueño:</strong> {auditingIndicator.responsible}
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-semibold">Meta Aprobada:</span>
                        <span className="font-bold text-slate-900">{auditingIndicator.target}</span>
                      </div>
                    </div>

                    {/* Tarjeta 2: Valor Actual y Validación */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                      <div className="text-[10px] font-bold text-blue-950 uppercase tracking-wider flex items-center justify-between">
                        <span>Resultado Auditado Vigente</span>
                        <span className="font-mono text-blue-900">{auditingIndicator.lastEvaluationDate || 'Actual'}</span>
                      </div>
                      <div className="text-3xl font-black text-blue-950 font-mono tracking-tight">
                        {auditingIndicator.currentValue} <span className="text-sm font-bold text-slate-600">{auditingIndicator.unit}</span>
                      </div>
                      <div className="pt-1 text-xs">
                        <span className="text-slate-500">Estado de Calidad: </span>
                        {auditingIndicator.validationStatus === 'validado_conforme' ? (
                          <span className="font-bold text-emerald-700">🟢 Conforme (Validado por Auditoría/Calidad)</span>
                        ) : auditingIndicator.validationStatus === 'observado' ? (
                          <span className="font-bold text-rose-700">🔴 Observado (Requiere subsanación)</span>
                        ) : (
                          <span className="font-bold text-amber-700">🟡 En Revisión por Calidad</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalle de Variables Desglosadas */}
                  {auditingIndicator.formulaType === 'percentage_ratio' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-blue-700" />
                        <span>Desglose de la Fórmula Auditada</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            {auditingIndicator.numeratorLabel || 'Numerador'}
                          </span>
                          <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                            {auditingIndicator.measurements?.[0]?.numeratorValue ?? '-'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            {auditingIndicator.denominatorLabel || 'Denominador'}
                          </span>
                          <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                            {auditingIndicator.measurements?.[0]?.denominatorValue ?? '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DOCUMENTO ANEXO DE EVIDENCIA PROBATORIA */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                        <Paperclip className="w-4 h-4 text-amber-800" />
                        <span>Documento Oficial de Sustento Anexado</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-950">
                        Evidencia Probatoria
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                          <span>{auditingIndicator.currentEvidenceName || 'Plan_de_Trabajo_Anual_y_Sustento.pdf'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Reportado por: {auditingIndicator.measurements?.[0]?.reportedBy || auditingIndicator.responsible}
                        </div>
                      </div>

                      {/* Botón para Abrir Evidencia */}
                      {auditingIndicator.currentEvidenceUrl ? (
                        <a
                          href={auditingIndicator.currentEvidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Abrir Evidencia</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Archivo custodiado institucional</span>
                      )}
                    </div>

                    {auditingIndicator.measurements?.[0]?.evidenceNotes && (
                      <div className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-amber-100">
                        <strong>Notas del responsable:</strong> {auditingIndicator.measurements[0].evidenceNotes}
                      </div>
                    )}
                  </div>

                  {/* SECCIÓN DE VALIDACIÓN Y CONTROL DE CALIDAD POR AUDITORES / GECA */}
                  {isAuditorOrQuality || isAdmin ? (
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Panel de Dictamen de Auditoría y Control de Calidad</span>
                        </div>
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-900/80 px-2 py-0.5 rounded-md">
                          Exclusivo Auditores y Calidad
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        Como auditor o especialista de calidad, valide si el documento del Plan Anual de Trabajo o informe adjunto respalda con rigor las variables y el resultado del indicador.
                      </p>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Dictamen / Observaciones de Auditoría de Calidad:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Evidencia contrastada con el Plan Operativo 2026. Conforme."
                          value={validationComment}
                          onChange={(e) => setValidationComment(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleValidate('observado')}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Observar Sustento</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleValidate('validado_conforme')}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Validar Conforme (Aprobar)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                        {isRectorado ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        {isRectorado ? (
                          <>
                            <div className="font-bold text-amber-900">🏛️ Supervisión de Alta Dirección (Rectorado / Consejo Universitario)</div>
                            <div className="text-[11px] text-amber-800 mt-0.5">
                              Vista ejecutiva de seguimiento y cumplimiento para la Revisión por la Dirección (ISO 21001 / ISO 9001 Cl. 9.3). Modo consulta de evidencias sin emisión de dictámenes operativos.
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-slate-900">Modo Consulta de Evidencia</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              Solo los auditores internos y el personal de calidad designado pueden emitir dictámenes de validación formal.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Pestaña: HISTORIAL AUDITABLE */}
              {activeAuditingTab === 'historial' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500">
                    Registro histórico inmutable de mediciones, responsables que reportaron y estados de validación de calidad:
                  </div>

                  {auditingIndicator.measurements && auditingIndicator.measurements.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Período / Fecha</th>
                            <th className="px-4 py-3">Reportado Por</th>
                            <th className="px-4 py-3">Variables / Resultado</th>
                            <th className="px-4 py-3">Documento Evidencia</th>
                            <th className="px-4 py-3">Estado Auditoría</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {auditingIndicator.measurements.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold text-slate-900">
                                <div>{m.period}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{m.date}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                <div>{m.reportedBy}</div>
                                <div className="text-[10px] text-slate-400">{m.reportedCharge || ''}</div>
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                <div>{m.calculatedValue} {m.unit}</div>
                                {m.numeratorValue !== undefined && m.denominatorValue !== undefined && (
                                  <div className="text-[10px] text-slate-400">
                                    ({m.numeratorValue} / {m.denominatorValue})
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                <div className="flex items-center gap-1 font-semibold text-blue-900 truncate max-w-[180px]">
                                  <FileText className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                                  <span title={m.evidenceName}>{m.evidenceName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {m.status === 'validado_conforme' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    Conforme
                                  </span>
                                ) : m.status === 'observado' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                    Observado
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                    Por Validar
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      No hay mediciones registradas en el historial previo.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pie de Modal */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setAuditingIndicator(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Ficha de Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
