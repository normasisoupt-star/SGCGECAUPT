import React, { useState, useMemo } from 'react';
import { 
  Search,
  Unlock,
  Calendar,
  Award,
  BarChart2, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  FileText,
  Paperclip,
  Cloud,
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
import { UPTIndicator, UserProfile, ISODocument, IndicatorMeasurement, EvaluationYear } from '../types';
import { getEvaluationYears, openNewEvaluationYear, toggleYearStatus } from '../services/storage';

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

  // Estados para Gobernanza de Años y Vista
  const [years, setYears] = useState<EvaluationYear[]>(() => getEvaluationYears());
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<'tablero' | 'evolucion'>('tablero');
  const [isOpeningYearModal, setIsOpeningYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState<number>(() => {
    const ys = getEvaluationYears().map((y) => y.year);
    return ys.length > 0 ? Math.max(...ys) + 1 : 2027;
  });

  const selectedYearObj = years.find((y) => y.year === selectedYear) || { year: selectedYear, status: 'abierto' as const };
  const isYearClosed = selectedYearObj.status === 'cerrado';

  const handleToggleCloseYear = () => {
    if (!isAdmin) return;
    const actionWord = isYearClosed ? 'reabrir' : 'cerrar oficialmente';
    const confirmMsg = isYearClosed
      ? `¿Está seguro de REABRIR el año ${selectedYear}? Las dependencias podrán volver a registrar y subsanar evidencias.`
      : `¿Está seguro de CERRAR OFICIALMENTE el año ${selectedYear}? Ningún usuario podrá subir o modificar evidencias. Quedará en modo solo lectura.`;

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

  // Cálculo de Puntuación Global del SGC UPT para el año seleccionado
  const globalScoreData = useMemo(() => {
    let totalScore = 0;
    let counted = 0;
    let peScore = 0, peCount = 0;
    let pmScore = 0, pmCount = 0;
    let psScore = 0, psCount = 0;
    let greenCount = 0;
    let amberCount = 0;
    let redCount = 0;

    indicators.forEach((ind) => {
      const yearMeas = ind.measurements?.find((m) => m.period.includes(String(selectedYear)));
      const value = yearMeas ? yearMeas.calculatedValue : ind.currentValue;

      const targetMatch = ind.target.match(/(\d+(\.\d+)?)/);
      const targetVal = targetMatch ? parseFloat(targetMatch[1]) : 85;

      let score = 0;
      if (ind.expectedTrend === 'Descendente' || ind.target.includes('≤') || ind.target.includes('<=')) {
        score = value <= targetVal ? 100 : Math.max(0, Math.round((targetVal / Math.max(value, 0.1)) * 100));
      } else {
        score = Math.min(100, Math.round((value / Math.max(targetVal, 1)) * 100));
      }

      totalScore += score;
      counted += 1;

      if (score >= 90) greenCount += 1;
      else if (score >= 70) amberCount += 1;
      else redCount += 1;

      if (ind.processCode.startsWith('PE')) {
        peScore += score;
        peCount += 1;
      } else if (ind.processCode.startsWith('PM')) {
        pmScore += score;
        pmCount += 1;
      } else if (ind.processCode.startsWith('PS')) {
        psScore += score;
        psCount += 1;
      }
    });

    return {
      globalAvg: counted > 0 ? Math.round(totalScore / counted) : 0,
      peAvg: peCount > 0 ? Math.round(peScore / peCount) : 0,
      pmAvg: pmCount > 0 ? Math.round(pmScore / pmCount) : 0,
      psAvg: psCount > 0 ? Math.round(psScore / psCount) : 0,
      greenCount,
      amberCount,
      redCount,
      totalCount: counted,
    };
  }, [indicators, selectedYear]);

  // Datos para Gráficos de Evolución Multianual
  const evolutionData = useMemo(() => {
    const historical = [
      { year: 2024, score: 76, pe: 81, pm: 74, ps: 75, status: 'cerrado' as const },
      { year: 2025, score: 82, pe: 86, pm: 81, ps: 82, status: 'cerrado' as const },
    ];

    const currentYearData = {
      year: selectedYear,
      score: globalScoreData.globalAvg,
      pe: globalScoreData.peAvg,
      pm: globalScoreData.pmAvg,
      ps: globalScoreData.psAvg,
      status: selectedYearObj.status,
    };

    const map = new Map<number, any>();
    historical.forEach((h) => map.set(h.year, h));
    years.forEach((y) => {
      if (y.year === selectedYear) {
        map.set(y.year, currentYearData);
      } else if (!map.has(y.year)) {
        map.set(y.year, {
          year: y.year,
          score: y.year < 2026 ? 80 : 88,
          pe: 90,
          pm: 86,
          ps: 88,
          status: y.status,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.year - b.year);
  }, [years, selectedYear, globalScoreData, selectedYearObj]);

  // Modales
  const [measuringIndicator, setMeasuringIndicator] = useState<UPTIndicator | null>(null);
  const [auditingIndicator, setAuditingIndicator] = useState<UPTIndicator | null>(null);

  // Form State para Registro de Medición
  const [period, setPeriod] = useState('2026 - Evaluación Anual');
  const [numerator, setNumerator] = useState<number | ''>('');
  const [denominator, setDenominator] = useState<number | ''>('');
  const [directValue, setDirectValue] = useState<number | ''>('');
  const [evidenceType, setEvidenceType] = useState<'file' | 'sharepoint' | 'dms'>('sharepoint');
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
    if (isYearClosed) {
      alert(`Período Cerrado: El año de evaluación ${selectedYear} se encuentra cerrado oficialmente. Nadie puede registrar nuevos avances ni alterar evidencias.`);
      return;
    }

    if (!isProcessOwner(ind)) {
      alert(`Acceso Restringido: Solo el Dueño de Proceso (${ind.responsible}) o el Administrador pueden registrar avances en este indicador.`);
      return;
    }

    setMeasuringIndicator(ind);
    setPeriod(`${selectedYear} - Evaluación Anual`);
    setEvidenceType('sharepoint');
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

    if (isYearClosed) {
      alert(`Período Cerrado: El año ${selectedYear} está cerrado. No es posible guardar avances.`);
      return;
    }

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

      {/* BARRA DE GOBERNANZA DE AÑOS DE EVALUACIÓN */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Selector de Año y Estado */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Año de Evaluación:
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

          {/* Badge de Estado del Año */}
          <div className="flex items-center gap-1.5">
            {isYearClosed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Período Cerrado (Solo Lectura)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Período Abierto (En Carga)</span>
              </span>
            )}
          </div>
        </div>

        {/* Acciones de Administrador & Selector de Vista */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pestañas: Tablero vs Evolución */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 mr-1">
            <button
              type="button"
              onClick={() => setViewMode('tablero')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'tablero'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Tablero {selectedYear}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('evolucion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'evolucion'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Evolución Multianual</span>
            </button>
          </div>

          {/* Botones Exclusivos de Administrador */}
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
                title={isYearClosed ? 'Reabrir período para subsanaciones' : 'Cerrar período y bloquear carga'}
              >
                {isYearClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isYearClosed ? `Reabrir Año ${selectedYear}` : `Cerrar Año ${selectedYear}`}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpeningYearModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border border-slate-900"
                title="Aperturar un nuevo año de evaluación en el SGC"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-300" />
                <span>Aumentar Año</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BANNER INSTITUCIONAL DE CIERRE (Solo si el año seleccionado está cerrado) */}
      {isYearClosed && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 shadow-2xs">
          <Lock className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-sm text-rose-900">
              Período Anual {selectedYear} Cerrado Oficialmente
            </span>
            <p className="mt-0.5 text-rose-800 leading-relaxed">
              Este período ha sido cerrado por la Oficina de Gestión de la Calidad (GECA). Ninguna dependencia puede subir archivos ni alterar valores calculados. Todas las evidencias se encuentran blindadas en modo solo lectura para la Revisión por la Dirección y auditorías.
            </p>
          </div>
        </div>
      )}

      {/* PANEL DE PUNTUACIÓN GLOBAL DEL SGC UPT (AÑO {selectedYear}) */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Índice Global Consolidado */}
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shrink-0 shadow-inner">
              <span className="text-3xl font-black text-white tracking-tight">
                {globalScoreData.globalAvg}%
              </span>
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-0.5">
                Puntuación
              </span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" />
                <span>
                  {globalScoreData.globalAvg >= 90
                    ? 'Nivel Sobresaliente / Excelencia'
                    : globalScoreData.globalAvg >= 80
                    ? 'Nivel Conforme / Desempeño Satisfactorio'
                    : globalScoreData.globalAvg >= 70
                    ? 'Nivel En Alerta / Seguimiento'
                    : 'Nivel Crítico / Requiere CAPA'}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1.5">
                Índice Global de Calidad UPT &bull; Año {selectedYear}
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                Resultado consolidado de los <strong>{globalScoreData.totalCount} indicadores oficiales</strong> del SGC bajo normas ISO 21001 e ISO 9001. Evidencias auditadas y custodiadas en la nube institucional.
              </p>
            </div>
          </div>

          {/* Desglose por los 3 Pilares Universitarios */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 lg:min-w-[420px]">
            {/* Pilar Estratégico */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                Estratégico (PE)
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {globalScoreData.peAvg}%
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${globalScoreData.peAvg}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Planeamiento, Calidad, Riesgos</div>
            </div>

            {/* Pilar Misional */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                Misional (PM)
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {globalScoreData.pmAvg}%
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${globalScoreData.pmAvg}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Formación, Docencia, I+D, RSU</div>
            </div>

            {/* Pilar Soporte */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <div className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
                Soporte (PS)
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {globalScoreData.psAvg}%
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${globalScoreData.psAvg}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Personal, Finanzas, TI, Logística</div>
            </div>
          </div>
        </div>

        {/* Semáforo de Cumplimiento */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {globalScoreData.greenCount} En Meta (≥90%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              {globalScoreData.amberCount} En Seguimiento (70%-89%)
            </span>
            <span className="flex items-center gap-1.5 text-rose-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              {globalScoreData.redCount} Críticos (&lt;70%)
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Norma ISO 21001:2025 Cláusula 9.1 &bull; Universidad Privada de Tacna
          </span>
        </div>
      </div>

      {viewMode === 'tablero' ? (
        <>
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

                  {/* Botón de Registrar Avance: Bloqueado si el año está cerrado */}
                  {isYearClosed ? (
                    <div 
                      className="w-full py-2 px-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-[11px] flex items-center justify-center gap-1.5 select-none border border-rose-200 shadow-2xs"
                      title="Período anual cerrado oficialmente por GECA (Solo Lectura)"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Período Cerrado</span>
                    </div>
                  ) : isRectorado ? (
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
        </>
      ) : (
        /* VISTA DE EVOLUCIÓN MULTIANUAL */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Cabecera de la Vista de Evolución */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Monitoreo Longitudinal Histórico &bull; ISO 21001:2025 Cláusula 9.1.3</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">
                Evolución Multianual del Desempeño del SGC UPT
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Comparativa histórica de índices globales y evolución por pilares estratégicos, misionales y de soporte. Permite a la Alta Dirección y Decanatos evaluar la madurez y mejora continua del sistema educativo.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('tablero')}
                className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <BarChart3 className="w-4 h-4 text-blue-300" />
                <span>Ver Tablero Detallado ({selectedYear})</span>
              </button>
            </div>
          </div>

          {/* Tarjetas de Desempeño por Año */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {evolutionData.map((yData, idx) => {
              const prevData = idx > 0 ? evolutionData[idx - 1] : null;
              const delta = prevData ? yData.score - prevData.score : null;
              const isSelected = yData.year === selectedYear;

              return (
                <div
                  key={yData.year}
                  onClick={() => setSelectedYear(yData.year)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-900 via-slate-900 to-blue-950 text-white border-blue-800 shadow-xl ring-2 ring-blue-500/50'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Badge de Estado y Año */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      Año {yData.year} {yData.year === 2026 && '(Base)'}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      yData.status === 'cerrado'
                        ? isSelected
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isSelected
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {yData.status === 'cerrado' ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                      <span>{yData.status === 'cerrado' ? 'Cerrado' : 'Abierto'}</span>
                    </span>
                  </div>

                  {/* Puntuación y Delta */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <div className="text-3xl font-black tracking-tight">
                        {yData.score}%
                      </div>
                      <div className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${
                        isSelected ? 'text-blue-200' : 'text-slate-500'
                      }`}>
                        Índice Global
                      </div>
                    </div>

                    {delta !== null && (
                      <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-xl ${
                        delta >= 0
                          ? isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                          : isSelected ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{delta >= 0 ? `+${delta}%` : `${delta}%`}</span>
                      </div>
                    )}
                  </div>

                  {/* Desglose de Pilares */}
                  <div className={`mt-4 pt-3 border-t text-[11px] space-y-1.5 ${
                    isSelected ? 'border-white/10' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={isSelected ? 'text-blue-200' : 'text-slate-500'}>Estratégico (PE):</span>
                      <span className="font-bold">{yData.pe}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isSelected ? 'text-emerald-200' : 'text-slate-500'}>Misional (PM):</span>
                      <span className="font-bold">{yData.pm}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isSelected ? 'text-amber-200' : 'text-slate-500'}>Soporte (PS):</span>
                      <span className="font-bold">{yData.ps}%</span>
                    </div>
                  </div>

                  {/* Barra de Progreso Global */}
                  <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${
                    isSelected ? 'bg-white/15' : 'bg-slate-100'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-emerald-400' : 'bg-blue-600'
                      }`}
                      style={{ width: `${yData.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfico Comparativo de Evolución Global y Pilares */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Barras: Comparativo del Índice Global */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Evolución del Cumplimiento Global UPT
                  </h4>
                  <p className="text-xs text-slate-500">
                    Meta institucional de excelencia: ≥ 85%
                  </p>
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>

              {/* Contenedor de Barras */}
              <div className="space-y-4 pt-2">
                {evolutionData.map((y) => (
                  <div key={y.year} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-2">
                        <span>Año {y.year}</span>
                        {y.year === 2026 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">
                            Base
                          </span>
                        )}
                        {y.status === 'cerrado' ? (
                          <span className="text-[10px] text-slate-400 font-normal">(Cerrado)</span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold">(En Carga)</span>
                        )}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {y.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded-xl overflow-hidden relative border border-slate-200">
                      {/* Línea de Meta 85% */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                        style={{ left: '85%' }}
                        title="Meta Institucional (85%)"
                      />
                      <div
                        className={`h-full rounded-xl transition-all duration-700 ${
                          y.score >= 90
                            ? 'bg-emerald-500'
                            : y.score >= 80
                            ? 'bg-blue-600'
                            : y.score >= 70
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${y.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-rose-500" />
                  Meta Institucional (85%)
                </span>
                <span>Fuente: Fichas de Indicadores UPT</span>
              </div>
            </div>

            {/* Matriz Comparativa por Pilares Universitarios */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Evolución por Pilares Universitarios
                  </h4>
                  <p className="text-xs text-slate-500">
                    Desglose de madurez por macroproceso
                  </p>
                </div>
                <BarChart2 className="w-5 h-5 text-blue-600" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Pilar SGC</th>
                      {evolutionData.map((y) => (
                        <th key={y.year} className="px-3 py-2.5 text-center">
                          {y.year}
                        </th>
                      ))}
                      <th className="px-3 py-2.5 text-right">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-3 py-3 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5 text-blue-900">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>Estratégico (PE)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">Planificación, Calidad, Riesgos</div>
                      </td>
                      {evolutionData.map((y) => (
                        <td key={y.year} className="px-3 py-3 text-center font-mono font-bold text-slate-800">
                          {y.pe}%
                        </td>
                      ))}
                      <td className="px-3 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <TrendingUp className="w-3 h-3" /> Favorable
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-3 py-3 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5 text-emerald-900">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span>Misional (PM)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">Formación, Docencia, I+D, RSU</div>
                      </td>
                      {evolutionData.map((y) => (
                        <td key={y.year} className="px-3 py-3 text-center font-mono font-bold text-slate-800">
                          {y.pm}%
                        </td>
                      ))}
                      <td className="px-3 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <TrendingUp className="w-3 h-3" /> Favorable
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-3 py-3 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5 text-amber-900">
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                          <span>Soporte (PS)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">Personal, TI, Finanzas, Mantenimiento</div>
                      </td>
                      {evolutionData.map((y) => (
                        <td key={y.year} className="px-3 py-3 text-center font-mono font-bold text-slate-800">
                          {y.ps}%
                        </td>
                      ))}
                      <td className="px-3 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <TrendingUp className="w-3 h-3" /> Favorable
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block">Dictamen de Tendencia:</span>
                El SGC muestra una curva de crecimiento sostenida en los 3 pilares desde el 2024 al presente año {selectedYear}. El Pilar Misional refleja un avance significativo gracias a las publicaciones científicas y los proyectos RSU implementados.
              </div>
            </div>
          </div>
        </div>
      )}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Paperclip className="w-4 h-4 text-amber-700" />
                    <span>2. Anexar Sustento Documental (Plan de Trabajo / Evidencias)</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-800 text-white shadow-2xs">
                    <Cloud className="w-3.5 h-3.5 text-amber-200" />
                    <span>Enlace SharePoint Nube / OneDrive / Drive</span>
                  </div>
                </div>

                {/* Enlace a la Nube (SharePoint, OneDrive, Google Drive) */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Enlace Directo del Sustento (SharePoint Nube / OneDrive / Google Drive): *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://uptpe-my.sharepoint.com/... o https://drive.google.com/..."
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-700"
                    />
                  </div>

                  {/* Nombre descriptivo de la evidencia */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nombre Oficial o Relación de Documentos Anexos: *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Ej:&#10;1. Plan_Anual_de_Trabajo_2026_Aprobado_Res_0418.pdf&#10;2. Informe_Trimestral_POI_2026.xlsx&#10;3. Acta_de_Aprobacion_Consejo.pdf"
                      value={evidenceName}
                      onChange={(e) => setEvidenceName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-700 resize-y leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Puedes detallar uno o varios documentos de sustento (un documento por línea o separados por comas).
                    </p>
                  </div>
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
                        <div className="text-xs font-bold text-slate-900 flex items-start gap-1.5">
                          <FileText className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <span className="whitespace-pre-line leading-relaxed">{auditingIndicator.currentEvidenceName || 'Plan_de_Trabajo_Anual_y_Sustento.pdf'}</span>
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
      {/* MODAL 3: APERTURAR NUEVO AÑO DE EVALUACIÓN (SOLO ADMINISTRADOR) */}
      {isOpeningYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Aperturar Nuevo Año de Evaluación
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

            {/* Contenido */}
            <form onSubmit={handleCreateNewYear} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Como Administrador del SGC (GECA), puede habilitar un nuevo período anual para el seguimiento y medición de indicadores institucionales (ISO 21001:2025).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Año de Evaluación:
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
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Por defecto se aperturará en estado <strong>Abierto</strong> para la recolección de evidencias.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-700 shrink-0" />
                  Gobernanza del Período
                </div>
                <p className="mt-1 text-[11px] text-blue-800 leading-relaxed">
                  Solo usted como Administrador podrá posteriormente cerrar este año una vez consolidadas las evidencias de los dueños de proceso, o volver a abrirlo en caso de subsanaciones.
                </p>
              </div>

              {/* Botones */}
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
