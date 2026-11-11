import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Download,
  Upload,
  Link2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Files,
  Trash2,
  Edit3,
  Check,
  X,
  Copy,
  ExternalLink,
  Building2,
} from 'lucide-react';
import {
  UserProfile,
  ProcedureActivityEvidence,
  ActivityEvidenceFormat,
  ActivityEvidenceStatus,
} from '../types';
import { UPT_PROCEDURES_DETAILED, ProcedureActivity } from '../data/proceduresDetailed';
import {
  FACULTY_PROCEDURE_CODES,
  ORGANIZATION_UNITS,
  resolveUserOrganizationUnit,
} from '../data/organizationHierarchy';
import {
  getActivityEvidences,
  saveActivityEvidence,
  deleteActivityEvidence,
  mergeCloudActivityEvidences,
} from '../services/storage';
import {
  saveActivityEvidenceToCloud,
  deleteActivityEvidenceFromCloud,
  fetchActivityEvidencesFromCloud,
} from '../services/firebaseClient';

interface ProcedureActivitiesSidePanelProps {
  procedureCode: string;
  procedureTitle: string;
  activeUser: UserProfile;
  onJumpToActivitiesPage?: () => void;
  activitiesPage?: number;
}

const FACULTY_UNITS = [
  { id: 'faing', short: 'FAING', name: 'Facultad de Ingeniería (FAING)' },
  { id: 'facsa', short: 'FACSA', name: 'Facultad de Ciencias de la Salud (FACSA)' },
  { id: 'facem', short: 'FACEM', name: 'Facultad de Ciencias Empresariales (FACEM)' },
  { id: 'faedcoh', short: 'FAEDCOH', name: 'Facultad de Educación, CC. y Humanidades (FAEDCOH)' },
  { id: 'fau', short: 'FAU', name: 'Facultad de Arquitectura y Urbanismo (FAU)' },
  { id: 'fade', short: 'FADE', name: 'Facultad de Derecho y Ciencias Políticas (FADE)' },
];

const UNIT_FOLDER_MAP: Record<string, string> = {
  'rectorado': '01_RECTORADO/01_REDO_Despacho_Rectoral',
  'opla': '01_RECTORADO/02_OPLA_Planeamiento_y_Desarrollo',
  'sege': '01_RECTORADO/03_SEGE_Secretaria_General',
  'ajul': '01_RECTORADO/04_AJUL_Asesoria_Juridica',
  'diga': '01_RECTORADO/05_DIGA_Direccion_Administracion',
  'diga-aima': '01_RECTORADO/05A_DIGA_AIMA_Infraestructura',
  'diga-alog': '01_RECTORADO/05B_DIGA_ALOG_Logistica',
  'diga-patrimonio': '01_RECTORADO/05C_DIGA_Patrimonio',
  'diga-aphu': '01_RECTORADO/05D_DIGA_APHU_Potencial_Humano',
  'diga-tesoreria': '01_RECTORADO/05E_DIGA_Tesoreria',
  'diga-contabilidad': '01_RECTORADO/05F_DIGA_Contabilidad',
  'tein': '01_RECTORADO/06_TEIN_Tecnologia_Informacion',
  'reni': '01_RECTORADO/07_RENI_Relaciones_Nacionales_Int',
  'geca-office': '01_RECTORADO/08_GECA_Gestion_de_la_Calidad',
  'imai': '01_RECTORADO/09_IMAI_Imagen_Institucional',
  'vrac': '02_VRAC/01_VRAC_Despacho_Vicerrectorado',
  'gpad': '02_VRAC/02_GPAD_Procesos_Academicos',
  'adma': '02_VRAC/03_ADMA_Admision_y_Marketing',
  'obun': '02_VRAC/04_OBUN_Bienestar_Universitario',
  'resu': '02_VRAC/05_RESU_Responsabilidad_Social',
  'vrin': '03_VRIN/01_VRIN_Despacho_Investigacion',
  'pitt': '03_VRIN/02_PITT_Investigacion_y_Transf',
  'bisa': '03_VRIN/03_BISA_Biblioteca',
  'faing': '04_FACULTADES/01_FAING_Facultad_Ingenieria',
  'facsa': '04_FACULTADES/02_FACSA_Facultad_Ciencias_Salud',
  'facem': '04_FACULTADES/03_FACEM_Facultad_Empresariales',
  'faedcoh': '04_FACULTADES/04_FAEDCOH_Facultad_Educacion',
  'fau': '04_FACULTADES/05_FAU_Facultad_Arquitectura',
  'fade': '04_FACULTADES/06_FADE_Facultad_Derecho',
};

function detectFormatFromName(name: string, defaultFormat: ActivityEvidenceFormat = 'pdf'): ActivityEvidenceFormat {
  const lower = name.toLowerCase().trim();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) return 'excel';
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'word';
  if (lower.endsWith('.pdf')) return 'pdf';
  return defaultFormat;
}

function getOneDriveFolderPath(procedureCode: string, scopeUnitId: string): string {
  if (scopeUnitId !== 'general' && UNIT_FOLDER_MAP[scopeUnitId]) {
    return `SGC_UPT_EVIDENCIAS/2026/${UNIT_FOLDER_MAP[scopeUnitId]}/${procedureCode}`;
  }
  const ownerUnit = ORGANIZATION_UNITS.find(
    (u) => u.id !== 'rectorado' && u.id !== 'vrac' && u.id !== 'vrin' && u.ownProcedures.includes(procedureCode)
  ) || ORGANIZATION_UNITS.find((u) => u.ownProcedures.includes(procedureCode));
  const folder = ownerUnit ? UNIT_FOLDER_MAP[ownerUnit.id] || ownerUnit.id : 'OFICINA';
  return `SGC_UPT_EVIDENCIAS/2026/${folder}/${procedureCode}`;
}

export const ProcedureActivitiesSidePanel: React.FC<ProcedureActivitiesSidePanelProps> = ({
  procedureCode,
  procedureTitle,
  activeUser,
  onJumpToActivitiesPage,
  activitiesPage,
}) => {
  const isFacultyProcedure = FACULTY_PROCEDURE_CODES.includes(procedureCode);
  const userUnit = resolveUserOrganizationUnit(activeUser);
  const isUserFromSpecificFaculty = userUnit?.level === 'facultad';
  const canInspectAllFaculties =
    activeUser.role === 'geca' ||
    activeUser.role === 'auditor' ||
    activeUser.role === 'rectorado' ||
    activeUser.role === 'vrac' ||
    userUnit?.id === 'geca-office';

  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(() => {
    if (isFacultyProcedure) {
      if (isUserFromSpecificFaculty && userUnit?.id) return userUnit.id;
      return 'faing';
    }
    return 'general';
  });

  useEffect(() => {
    if (isFacultyProcedure) {
      if (isUserFromSpecificFaculty && userUnit?.id) {
        setSelectedFacultyId(userUnit.id);
      } else if (selectedFacultyId === 'general') {
        setSelectedFacultyId('faing');
      }
    } else {
      setSelectedFacultyId('general');
    }
  }, [procedureCode, isFacultyProcedure, isUserFromSpecificFaculty, userUnit?.id]);

  const scopeUnitId = isFacultyProcedure ? selectedFacultyId : 'general';

  const [evidencesMap, setEvidencesMap] = useState<Record<string, ProcedureActivityEvidence>>(() =>
    getActivityEvidences()
  );

  // Estado para formulario de adjuntar/editar por actividad
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [formFileName, setFormFileName] = useState('');
  const [formOneDriveUrl, setFormOneDriveUrl] = useState('');
  const [formUploadFolderUrl, setFormUploadFolderUrl] = useState('');
  const [formFormat, setFormFormat] = useState<ActivityEvidenceFormat>('pdf');
  const [formStatus, setFormStatus] = useState<ActivityEvidenceStatus>('conforme');
  const [formDataUrl, setFormDataUrl] = useState<string | undefined>(undefined);

  // Menú de 3 puntos abierto por step
  const [openMenuStep, setOpenMenuStep] = useState<number | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetStep, setUploadTargetStep] = useState<number | null>(null);

  // Sincronización con Cloud Firestore al abrir el procedimiento
  useEffect(() => {
    let mounted = true;
    fetchActivityEvidencesFromCloud()
      .then((cloudList) => {
        if (!mounted || !cloudList.length) return;
        const merged = mergeCloudActivityEvidences(cloudList);
        setEvidencesMap({ ...merged });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [procedureCode]);

  const detailed = UPT_PROCEDURES_DETAILED[procedureCode];
  const activities: ProcedureActivity[] =
    detailed && detailed.activities && detailed.activities.length > 0
      ? detailed.activities
      : [
          { step: 1, task: `Planificación y registro inicial (${procedureCode})`, unit: 'Unidad Orgánica Responsable', responsible: 'Responsable Designado' },
          { step: 2, task: `Ejecución y control de actividades (${procedureCode})`, unit: 'Unidad Orgánica Responsable', responsible: 'Responsable Designado' },
          { step: 3, task: `Revisión, informe y archivo de evidencias (${procedureCode})`, unit: 'Unidad Orgánica Responsable', responsible: 'Responsable Designado' },
        ];

  const getEvidenceKey = (step: number) => `${scopeUnitId}__${procedureCode}__step_${step}`;

  const completedCount = activities.filter((a) => Boolean(evidencesMap[getEvidenceKey(a.step)])).length;
  const totalCount = activities.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isAdminOrAuditor =
    activeUser.role === 'geca' ||
    activeUser.role === 'auditor' ||
    userUnit?.id === 'geca-office';

  const startEditingStep = (act: ProcedureActivity) => {
    const existing = evidencesMap[getEvidenceKey(act.step)];
    setEditingStep(act.step);
    setOpenMenuStep(null);
    if (existing) {
      setFormFileName(existing.fileName);
      setFormOneDriveUrl(existing.oneDriveUrl);
      setFormUploadFolderUrl(existing.uploadFolderUrl || '');
      setFormFormat(existing.fileFormat);
      setFormStatus(existing.status);
      setFormDataUrl(existing.fileDataUrl);
    } else {
      const cleanTask = act.task.split(' ').slice(0, 4).join('_').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]/g, '');
      setFormFileName(`${cleanTask || `Evidencia_Act_${act.step}`}_2026.pdf`);
      setFormOneDriveUrl('');
      setFormUploadFolderUrl('');
      setFormFormat('pdf');
      setFormStatus('conforme');
      setFormDataUrl(undefined);
    }
  };

  const handleSaveStepEvidence = async (e: React.FormEvent, step: number) => {
    e.preventDefault();
    const id = getEvidenceKey(step);
    const finalName = formFileName.trim() || `Evidencia_Actividad_${step}.pdf`;
    const finalUrl = formOneDriveUrl.trim();

    const newEvidence: ProcedureActivityEvidence = {
      id,
      procedureCode,
      step,
      scopeUnitId,
      fileName: finalName,
      fileFormat: formFormat,
      oneDriveUrl: finalUrl,
      uploadFolderUrl: formUploadFolderUrl.trim() || finalUrl,
      fileDataUrl: formDataUrl,
      status: formStatus,
      uploadedBy: activeUser.name,
      uploadedByUnit: activeUser.officeName || activeUser.department,
      updatedAt: new Date().toISOString(),
    };

    const updated = saveActivityEvidence(newEvidence);
    setEvidencesMap({ ...updated });
    setEditingStep(null);

    try {
      await saveActivityEvidenceToCloud(newEvidence);
    } catch {
      // Fallback local ya guardado
    }
  };

  const handleQuickStatusChange = async (evidence: ProcedureActivityEvidence, newStatus: ActivityEvidenceStatus) => {
    const updatedItem: ProcedureActivityEvidence = {
      ...evidence,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    const updated = saveActivityEvidence(updatedItem);
    setEvidencesMap({ ...updated });
    setOpenMenuStep(null);
    try {
      await saveActivityEvidenceToCloud(updatedItem);
    } catch {}
  };

  const handleRemoveEvidence = async (step: number) => {
    const id = getEvidenceKey(step);
    const updated = deleteActivityEvidence(id);
    setEvidencesMap({ ...updated });
    setOpenMenuStep(null);
    try {
      await deleteActivityEvidenceFromCloud(id);
    } catch {}
  };

  const triggerFilePickerForStep = (step: number) => {
    setUploadTargetStep(step);
    setOpenMenuStep(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadTargetStep === null) return;

    const detectedFormat = detectFormatFromName(file.name, 'pdf');
    const existing = evidencesMap[getEvidenceKey(uploadTargetStep)];

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : undefined;

      // Si ya tenía enlace de OneDrive configurado, actualizamos directo la tarjeta con el nuevo archivo
      if (existing && existing.oneDriveUrl) {
        const updatedEvidence: ProcedureActivityEvidence = {
          ...existing,
          fileName: file.name,
          fileFormat: existing.fileFormat === 'multi_files' ? 'multi_files' : detectedFormat,
          fileDataUrl: file.size <= 300000 ? dataUrl : existing.fileDataUrl,
          uploadedBy: activeUser.name,
          updatedAt: new Date().toISOString(),
        };
        const updatedMap = saveActivityEvidence(updatedEvidence);
        setEvidencesMap({ ...updatedMap });
        try {
          await saveActivityEvidenceToCloud(updatedEvidence);
        } catch {}

        // Además, si tiene enlace de carpeta OneDrive, ofrecemos abrirlo para depositar el archivo en OneDrive Institucional
        const targetFolderUrl = existing.uploadFolderUrl || existing.oneDriveUrl;
        if (targetFolderUrl && targetFolderUrl.startsWith('http')) {
          window.open(targetFolderUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        // Si aún no tenía enlace o está subiendo directo, abrimos el formulario pre-rellenado o guardamos directo
        setEditingStep(uploadTargetStep);
        setFormFileName(file.name);
        setFormFormat(detectedFormat);
        setFormOneDriveUrl(existing?.oneDriveUrl || '');
        setFormUploadFolderUrl(existing?.uploadFolderUrl || '');
        setFormStatus(existing?.status || 'conforme');
        if (file.size <= 300000 && dataUrl) {
          setFormDataUrl(dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const openEvidenceUrl = (evidence: ProcedureActivityEvidence, mode: 'view' | 'download' | 'upload') => {
    if (mode === 'upload') {
      const uploadUrl = evidence.uploadFolderUrl || evidence.oneDriveUrl;
      if (uploadUrl && uploadUrl.startsWith('http')) {
        window.open(uploadUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      triggerFilePickerForStep(evidence.step);
      return;
    }

    if (evidence.oneDriveUrl && evidence.oneDriveUrl.startsWith('http')) {
      window.open(evidence.oneDriveUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (evidence.fileDataUrl) {
      if (mode === 'download') {
        const a = document.createElement('a');
        a.href = evidence.fileDataUrl;
        a.download = evidence.fileName;
        a.click();
      } else {
        const win = window.open();
        if (win) {
          win.document.write(
            `<iframe src="${evidence.fileDataUrl}" style="width:100%;height:100vh;border:none;" title="${evidence.fileName}"></iframe>`
          );
        }
      }
      return;
    }

    alert('Esta actividad aún no tiene un enlace web de OneDrive vinculado. Haga clic en los tres puntos (⋮) para pegar el enlace compartido de OneDrive.');
  };

  const oneDrivePath = getOneDriveFolderPath(procedureCode, scopeUnitId);

  const handleCopyPath = () => {
    navigator.clipboard?.writeText(oneDrivePath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Input de archivo oculto para el botón Subir */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.zip,.png,.jpg"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Cabecera del Panel Lateral */}
      <div className="p-4 bg-white border-b border-slate-200 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              Repositorio OneDrive UPT
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              Evidencias por Actividad ({completedCount}/{totalCount})
            </h3>
          </div>
          {onJumpToActivitiesPage && activitiesPage && (
            <button
              type="button"
              onClick={onJumpToActivitiesPage}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
              title="Ubicar la tabla de actividades en el visor PDF"
            >
              📖 Pág. {activitiesPage}
            </button>
          )}
        </div>

        {/* Barra de progreso de evidencias del procedimiento */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Avance del expediente de auditoría</span>
            <span className="font-bold text-emerald-700">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/70">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Selector de Facultad (Solo en los 11 procedimientos misionales de Facultades, como Facultad) */}
        {isFacultyProcedure && (
          <div className="pt-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-red-700" />
              <span>Facultad Responsable (Evidencias independientes):</span>
            </label>
            {canInspectAllFaculties ? (
              <select
                value={selectedFacultyId}
                onChange={(e) => {
                  setSelectedFacultyId(e.target.value);
                  setEditingStep(null);
                  setOpenMenuStep(null);
                }}
                className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {FACULTY_UNITS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-900">
                {FACULTY_UNITS.find((f) => f.id === selectedFacultyId)?.name || activeUser.officeName}
              </div>
            )}
          </div>
        )}

        {/* Ruta de Carpeta en OneDrive Institucional */}
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 min-w-0">
            <FolderOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-mono text-[10px]" title={`OneDrive - UNIVERSIDAD PRIVADA DE TACNA/${oneDrivePath}`}>
              {oneDrivePath}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyPath}
            className="px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
            title="Copiar ruta de carpeta en OneDrive Institucional"
          >
            {copiedPath ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedPath ? 'Copiado' : 'Ruta'}</span>
          </button>
        </div>
      </div>

      {/* Lista de Tarjetas por Actividad */}
      <div className="p-3.5 overflow-y-auto space-y-3 flex-1 max-h-[640px]">
        {activities.map((act) => {
          const evidence = evidencesMap[getEvidenceKey(act.step)];
          const isEditing = editingStep === act.step;
          const isMenuOpen = openMenuStep === act.step;

          // MODO EDICIÓN / ADJUNTAR ENLACE DE LA ACTIVIDAD
          if (isEditing) {
            return (
              <form
                key={act.step}
                onSubmit={(e) => handleSaveStepEvidence(e, act.step)}
                className="p-3.5 rounded-2xl bg-white border-2 border-blue-600 shadow-md space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Configurar Actividad {act.step}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingStep(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 leading-snug bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <strong>Paso {act.step}:</strong> {act.task}
                </div>

                {/* Tipo de Evidencia: Archivo Único vs Varios Archivos (Carpeta OneDrive) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Tipo de Evidencia en OneDrive
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'pdf', label: '📄 PDF Único' },
                      { id: 'multi_files', label: '🗂️ Varios Archivos (Carpeta)' },
                      { id: 'excel', label: '📊 Excel (.xlsx)' },
                      { id: 'word', label: '📝 Word (.docx)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormFormat(opt.id as ActivityEvidenceFormat)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border text-left transition-all cursor-pointer ${
                          formFormat === opt.id
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nombre del documento o carpeta que se verá en la tarjeta */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {formFormat === 'multi_files'
                      ? 'Nombre del Expediente / Carpeta de la Actividad *'
                      : 'Nombre del Documento Oficial *'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder={
                        formFormat === 'multi_files'
                          ? `Ej: Expediente_Actividad_${act.step}_OneDrive`
                          : `Ej: Diagnostico_PEI_2026.pdf`
                      }
                      value={formFileName}
                      onChange={(e) => setFormFileName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => triggerFilePickerForStep(act.step)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold shrink-0 cursor-pointer border border-slate-200"
                      title="Elegir archivo de tu PC para tomar su nombre automáticamente"
                    >
                      📁 PC
                    </button>
                  </div>
                </div>

                {/* Enlace de OneDrive */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Enlace Compartido de OneDrive (Archivo o Carpeta de la Actividad)
                  </label>
                  <input
                    type="url"
                    placeholder="https://upt-my.sharepoint.com/..."
                    value={formOneDriveUrl}
                    onChange={(e) => setFormOneDriveUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Pegue aquí el link compartido de la carpeta <code className="text-slate-600">Act_{String(act.step).padStart(2, '0')}</code> de su OneDrive Institucional.
                  </span>
                </div>

                {/* Estado de Revisión */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Estado de Conformidad
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'conforme', label: '✅ Conforme', activeCls: 'bg-emerald-50 border-emerald-600 text-emerald-800' },
                      { id: 'en_revision', label: '⏳ En revisión', activeCls: 'bg-amber-50 border-amber-500 text-amber-800' },
                      { id: 'observado', label: '⚠️ Observado', activeCls: 'bg-rose-50 border-rose-600 text-rose-800' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFormStatus(st.id as ActivityEvidenceStatus)}
                        className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          formStatus === st.id
                            ? st.activeCls
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingStep(null)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar Tarjeta</span>
                  </button>
                </div>
              </form>
            );
          }

          // TARJETA VISUAL CUANDO LA ACTIVIDAD YA TIENE EVIDENCIA / ENLACE (Diseño exacto solicitado)
          if (evidence) {
            return (
              <div
                key={act.step}
                className="relative p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Fila Superior: Ícono de Documento (o Varios Documentos) + Nombre de Actividad + Menú ⋮ */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Ícono según sea PDF único, Excel, Word, o Varios Archivos en OneDrive */}
                    {evidence.fileFormat === 'multi_files' ? (
                      <button
                        type="button"
                        onClick={() => openEvidenceUrl(evidence, 'view')}
                        title="Varios documentos en esta actividad — Clic para abrir carpeta en OneDrive"
                        className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs hover:scale-105 transition-transform cursor-pointer group"
                      >
                        {/* Figuras apiladas de múltiples documentos */}
                        <div className="relative flex items-center justify-center">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600 -rotate-12 -mr-2 opacity-90" />
                          <FileText className="w-5 h-5 text-rose-600 z-10 drop-shadow-2xs" />
                          <Files className="w-4 h-4 text-blue-700 rotate-12 -ml-1.5 opacity-90" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-blue-700 text-white text-[8px] font-extrabold uppercase tracking-tighter shadow-2xs">
                          1Drive
                        </span>
                      </button>
                    ) : evidence.fileFormat === 'excel' ? (
                      <button
                        type="button"
                        onClick={() => openEvidenceUrl(evidence, 'view')}
                        title="Abrir documento Excel en OneDrive"
                        className="w-10 h-11 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 shadow-2xs hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-5 h-5" />
                        <span className="text-[8px] font-extrabold uppercase tracking-wider leading-none mt-0.5">
                          XLS
                        </span>
                      </button>
                    ) : evidence.fileFormat === 'word' ? (
                      <button
                        type="button"
                        onClick={() => openEvidenceUrl(evidence, 'view')}
                        title="Abrir documento Word en OneDrive"
                        className="w-10 h-11 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center shrink-0 shadow-2xs hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <FileText className="w-5 h-5" />
                        <span className="text-[8px] font-extrabold uppercase tracking-wider leading-none mt-0.5">
                          DOC
                        </span>
                      </button>
                    ) : (
                      /* Ícono Rojo de PDF idéntico a la imagen del usuario */
                      <button
                        type="button"
                        onClick={() => openEvidenceUrl(evidence, 'view')}
                        title="Abrir documento PDF"
                        className="w-10 h-11 rounded-xl bg-gradient-to-b from-rose-500 to-red-600 text-white flex flex-col items-center justify-center shrink-0 shadow-2xs hover:from-rose-600 hover:to-red-700 transition-colors cursor-pointer"
                      >
                        <FileText className="w-5 h-5 stroke-[2.2]" />
                        <span className="text-[8px] font-extrabold uppercase tracking-wider leading-none mt-0.5">
                          PDF
                        </span>
                      </button>
                    )}

                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-700 leading-snug">
                        Actividad {act.step}:
                      </div>
                      <div
                        onClick={() => openEvidenceUrl(evidence, 'view')}
                        className="text-[13px] font-bold text-slate-900 break-words leading-snug hover:text-blue-700 cursor-pointer"
                        title={act.task}
                      >
                        {evidence.fileName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5" title={act.task}>
                        {act.task}
                      </div>
                    </div>
                  </div>

                  {/* Botón de 3 puntos (⋮) */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenMenuStep(isMenuOpen ? null : act.step)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Opciones de la actividad"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-7 z-30 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => startEditingStep(act)}
                          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Editar enlace / nombre</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerFilePickerForStep(act.step)}
                          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Seleccionar archivo de PC</span>
                        </button>
                        {isAdminOrAuditor && (
                          <>
                            <div className="my-1 border-t border-slate-100" />
                            <div className="px-3 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                              Evaluación Auditoría
                            </div>
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(evidence, 'conforme')}
                              className="w-full px-3 py-1.5 text-left text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Marcar Conforme</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(evidence, 'en_revision')}
                              className="w-full px-3 py-1.5 text-left text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Marcar En Revisión</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(evidence, 'observado')}
                              className="w-full px-3 py-1.5 text-left text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Marcar Observado</span>
                            </button>
                          </>
                        )}
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(act.step)}
                          className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Quitar evidencia</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fila Inferior: Insignia Conforme + Botones Ver, Descargar y Subir */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {/* Píldora de Estado (Conforme / En revisión / Observado) */}
                  {evidence.status === 'conforme' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                      <span>Conforme</span>
                    </span>
                  ) : evidence.status === 'en_revision' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>En revisión</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Observado</span>
                    </span>
                  )}

                  {/* Botones de Acción idénticos a la tarjeta + opción de Subir archivo */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEvidenceUrl(evidence, 'view')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                      title={
                        evidence.fileFormat === 'multi_files'
                          ? 'Abrir carpeta con los documentos de la actividad en OneDrive'
                          : 'Ver documento de la actividad'
                      }
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Ver</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEvidenceUrl(evidence, 'download')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                      title="Descargar o abrir archivo en OneDrive"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Descargar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEvidenceUrl(evidence, 'upload')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                      title="Subir archivo a esta actividad en OneDrive o actualizar documento"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Subir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // TARJETA VACÍA (Sin evidencia aún -> Botón "Adjuntar enlace de la actividad" + "Subir archivo")
          return (
            <div
              key={act.step}
              className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-dashed border-slate-300 hover:border-blue-400 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {act.step}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Actividad {act.step}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 truncate max-w-[150px]" title={act.responsible}>
                  {act.unit}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {act.task}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEditingStep(act)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Adjuntar enlace OneDrive</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerFilePickerForStep(act.step)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Seleccionar archivo PDF/Excel de su equipo para esta actividad"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Subir archivo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
