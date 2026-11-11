import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Files,
  Trash2,
  X,
  Check,
  Copy,
  Building2,
  Plus,
} from 'lucide-react';
import {
  UserProfile,
  ProcedureActivityEvidence,
  ActivityAttachedFile,
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

// --- IndexedDB Helper para almacenar PDFs/Excels pesados en el navegador sin límite de 5MB ---
const IDB_NAME = 'sgc_upt_activity_files_db';
const IDB_STORE = 'files';

function openFilesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveFileBlobToIdb(fileId: string, dataUrl: string): Promise<void> {
  try {
    const db = await openFilesDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(dataUrl, fileId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}

async function getFileBlobFromIdb(fileId: string): Promise<string | null> {
  try {
    const db = await openFilesDb();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(fileId);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function deleteFileBlobFromIdb(fileId: string): Promise<void> {
  try {
    const db = await openFilesDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(fileId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

/**
 * Puente oficial Google Apps Script conectado a la cuenta calidad@virtual.upt.pe
 */
const GOOGLE_DRIVE_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxur4ZbDNzYzQ9V81pmAhiJRhZmYidGHEpoM8CnEdlppAslL3CcAX_9eOJ2MNXFnL5D/exec';

async function uploadToGoogleDriveBridge(params: {
  officeName: string;
  procedureCode: string;
  step: number;
  fileName: string;
  mimeType?: string;
  dataUrl: string;
}): Promise<{ status: string; fileUrl?: string; downloadUrl?: string; fileId?: string } | null> {
  try {
    const payload = JSON.stringify({
      officeName: params.officeName,
      procedureCode: params.procedureCode,
      step: params.step,
      fileName: params.fileName,
      mimeType: params.mimeType || 'application/octet-stream',
      fileData: params.dataUrl,
    });

    const response = await fetch(GOOGLE_DRIVE_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
    });

    if (!response.ok) return null;
    const json = await response.json();
    return json;
  } catch (err) {
    console.warn('Google Drive direct upload notice:', err);
    return null;
  }
}

/**
 * Envía el archivo subido también a la carpeta correspondiente del disco local si está corriendo en PC
 */
async function syncFileWithLocalOneDrive(params: {
  action: 'save' | 'delete';
  organUnitPath: string;
  procedureCode: string;
  step: number;
  fileName: string;
  dataUrl?: string;
}): Promise<void> {
  try {
    await fetch('/api/onedrive-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    // Continúa normalmente
  }
}

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

function detectSingleFileFormat(name: string): 'pdf' | 'excel' | 'word' {
  const lower = name.toLowerCase().trim();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) return 'excel';
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'word';
  return 'pdf';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getOrganUnitSubpath(procedureCode: string, scopeUnitId: string): string {
  if (scopeUnitId !== 'general' && UNIT_FOLDER_MAP[scopeUnitId]) {
    return UNIT_FOLDER_MAP[scopeUnitId];
  }
  const ownerUnit =
    ORGANIZATION_UNITS.find(
      (u) => u.id !== 'rectorado' && u.id !== 'vrac' && u.id !== 'vrin' && u.ownProcedures.includes(procedureCode)
    ) || ORGANIZATION_UNITS.find((u) => u.ownProcedures.includes(procedureCode));
  return ownerUnit ? UNIT_FOLDER_MAP[ownerUnit.id] || ownerUnit.id : '01_RECTORADO/08_GECA_Gestion_de_la_Calidad';
}

function getOneDriveFolderPath(procedureCode: string, scopeUnitId: string): string {
  const subpath = getOrganUnitSubpath(procedureCode, scopeUnitId);
  return `SGC_UPT_EVIDENCIAS/2026/${subpath}/${procedureCode}`;
}

/**
 * Normaliza la lista de archivos de una evidencia (compatible con registros de 1 o varios archivos)
 */
function getNormalizedFiles(evidence?: ProcedureActivityEvidence): ActivityAttachedFile[] {
  if (!evidence) return [];
  if (Array.isArray(evidence.files) && evidence.files.length > 0) {
    return evidence.files;
  }
  if (evidence.fileName && evidence.fileFormat !== 'multi_files') {
    return [
      {
        id: `${evidence.id}__file_0`,
        fileName: evidence.fileName,
        fileFormat: evidence.fileFormat === 'excel' ? 'excel' : evidence.fileFormat === 'word' ? 'word' : 'pdf',
        oneDriveUrl: evidence.oneDriveUrl,
        fileDataUrl: evidence.fileDataUrl,
        uploadedAt: evidence.updatedAt,
        uploadedBy: evidence.uploadedBy,
      },
    ];
  }
  return [];
}

export const ProcedureActivitiesSidePanel: React.FC<ProcedureActivitiesSidePanelProps> = ({
  procedureCode,
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
          {
            step: 1,
            task: `Planificación y registro inicial (${procedureCode})`,
            unit: 'Unidad Orgánica Responsable',
            responsible: 'Responsable Designado',
          },
          {
            step: 2,
            task: `Ejecución y control de actividades (${procedureCode})`,
            unit: 'Unidad Orgánica Responsable',
            responsible: 'Responsable Designado',
          },
          {
            step: 3,
            task: `Revisión, informe y archivo de evidencias (${procedureCode})`,
            unit: 'Unidad Orgánica Responsable',
            responsible: 'Responsable Designado',
          },
        ];

  const getEvidenceKey = (step: number) => `${scopeUnitId}__${procedureCode}__step_${step}`;

  const completedCount = activities.filter((a) => Boolean(evidencesMap[getEvidenceKey(a.step)])).length;
  const totalCount = activities.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isAdminOrAuditor =
    activeUser.role === 'geca' ||
    activeUser.role === 'auditor' ||
    userUnit?.id === 'geca-office';

  const handleQuickStatusChange = async (
    evidence: ProcedureActivityEvidence,
    newStatus: ActivityEvidenceStatus
  ) => {
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
    const existing = evidencesMap[id];
    const organUnitPath = getOrganUnitSubpath(procedureCode, scopeUnitId);
    if (existing) {
      const files = getNormalizedFiles(existing);
      for (const f of files) {
        await deleteFileBlobFromIdb(f.id);
        await syncFileWithLocalOneDrive({
          action: 'delete',
          organUnitPath,
          procedureCode,
          step,
          fileName: f.fileName,
        });
      }
    }
    const updated = deleteActivityEvidence(id);
    setEvidencesMap({ ...updated });
    setOpenMenuStep(null);
    try {
      await deleteActivityEvidenceFromCloud(id);
    } catch {}
  };

  // Elimina un archivo individual dentro de una actividad que tiene varios archivos
  const handleRemoveSingleFileFromStep = async (step: number, fileIdToRemove: string) => {
    const id = getEvidenceKey(step);
    const existing = evidencesMap[id];
    if (!existing) return;

    const currentFiles = getNormalizedFiles(existing);
    const targetFile = currentFiles.find((f) => f.id === fileIdToRemove);
    await deleteFileBlobFromIdb(fileIdToRemove);

    if (targetFile) {
      const organUnitPath = getOrganUnitSubpath(procedureCode, scopeUnitId);
      await syncFileWithLocalOneDrive({
        action: 'delete',
        organUnitPath,
        procedureCode,
        step,
        fileName: targetFile.fileName,
      });
    }

    const remaining = currentFiles.filter((f) => f.id !== fileIdToRemove);

    if (remaining.length === 0) {
      await handleRemoveEvidence(step);
      return;
    }

    const updatedEvidence: ProcedureActivityEvidence = {
      ...existing,
      fileName:
        remaining.length === 1
          ? remaining[0].fileName
          : `${remaining.length} documentos adjuntos`,
      fileFormat: remaining.length > 1 ? 'multi_files' : remaining[0].fileFormat,
      files: remaining,
      updatedAt: new Date().toISOString(),
    };

    const updatedMap = saveActivityEvidence(updatedEvidence);
    setEvidencesMap({ ...updatedMap });
    try {
      await saveActivityEvidenceToCloud(updatedEvidence);
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

  /**
   * Al subir 1 o varios archivos desde la PC:
   * 1. Se acumulan en la Actividad sin borrar los anteriores.
   * 2. Se guardan automáticamente en la carpeta de la Actividad dentro de tu OneDrive Institucional.
   */
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0 || uploadTargetStep === null) return;

    const targetStep = uploadTargetStep;
    const id = getEvidenceKey(targetStep);
    const existing = evidencesMap[id];
    const currentFiles = getNormalizedFiles(existing);
    const organUnitPath = getOrganUnitSubpath(procedureCode, scopeUnitId);

    const newAttachedFiles: ActivityAttachedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileFormat = detectSingleFileFormat(file.name);
      const fileId = `${id}__file_${Date.now()}_${i}`;

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      if (dataUrl) {
        await saveFileBlobToIdb(fileId, dataUrl);
        await syncFileWithLocalOneDrive({
          action: 'save',
          organUnitPath,
          procedureCode,
          step: targetStep,
          fileName: file.name,
          dataUrl,
        });

        // Subida automática en segundo plano a Google Drive Institucional (calidad@virtual.upt.pe)
        uploadToGoogleDriveBridge({
          officeName: organUnitPath,
          procedureCode,
          step: targetStep,
          fileName: file.name,
          mimeType: file.type || (fileFormat === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
          dataUrl,
        }).then((driveRes) => {
          if (driveRes && driveRes.status === 'success' && driveRes.fileUrl) {
            // Actualizar la URL de Drive en la evidencia guardada
            const currentMap = getActivityEvidences();
            const currentEv = currentMap[id];
            if (currentEv && currentEv.files) {
              const updatedFiles = currentEv.files.map((cf) =>
                cf.id === fileId ? { ...cf, oneDriveUrl: driveRes.fileUrl } : cf
              );
              const updatedWithDrive: ProcedureActivityEvidence = {
                ...currentEv,
                files: updatedFiles,
                oneDriveUrl: currentEv.oneDriveUrl || driveRes.fileUrl,
              };
              saveActivityEvidence(updatedWithDrive);
              saveActivityEvidenceToCloud(updatedWithDrive);
              setEvidencesMap({ ...getActivityEvidences() });
            }
          }
        });
      }

      newAttachedFiles.push({
        id: fileId,
        fileName: file.name,
        fileFormat,
        fileSize: formatBytes(file.size),
        fileDataUrl: file.size <= 180000 ? dataUrl : undefined,
        uploadedAt: new Date().toISOString(),
        uploadedBy: activeUser.name,
      });
    }

    // Acumular archivos en la misma actividad
    const mergedFilesMap = new Map<string, ActivityAttachedFile>();
    for (const f of currentFiles) {
      mergedFilesMap.set(f.fileName.toLowerCase(), f);
    }
    for (const nf of newAttachedFiles) {
      mergedFilesMap.set(nf.fileName.toLowerCase(), nf);
    }
    const allFiles = Array.from(mergedFilesMap.values());

    const isMultiple = allFiles.length > 1;
    const displayFileName = isMultiple
      ? `${allFiles.length} documentos adjuntos`
      : allFiles[0]?.fileName || `Evidencia_Actividad_${targetStep}.pdf`;
    const displayFormat: ActivityEvidenceFormat = isMultiple
      ? 'multi_files'
      : allFiles[0]?.fileFormat || 'pdf';

    const updatedEvidence: ProcedureActivityEvidence = {
      id,
      procedureCode,
      step: targetStep,
      scopeUnitId,
      fileName: displayFileName,
      fileFormat: displayFormat,
      oneDriveUrl: existing?.oneDriveUrl || '',
      uploadFolderUrl: existing?.uploadFolderUrl || '',
      fileDataUrl: !isMultiple ? allFiles[0]?.fileDataUrl : undefined,
      files: allFiles,
      status: existing?.status || 'conforme',
      uploadedBy: activeUser.name,
      uploadedByUnit: activeUser.officeName || activeUser.department,
      updatedAt: new Date().toISOString(),
    };

    const updatedMap = saveActivityEvidence(updatedEvidence);
    setEvidencesMap({ ...updatedMap });

    try {
      await saveActivityEvidenceToCloud(updatedEvidence);
    } catch {}
  };

  /**
   * Abre o descarga un archivo específico adjunto a la actividad
   */
  const openAttachedFile = async (
    fileItem: ActivityAttachedFile,
    parentEvidence: ProcedureActivityEvidence,
    mode: 'view' | 'download'
  ) => {
    const dataUrl = fileItem.fileDataUrl || (await getFileBlobFromIdb(fileItem.id));

    if (dataUrl) {
      if (mode === 'download') {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileItem.fileName;
        a.click();
        return;
      }
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
        return;
      } catch {
        const win = window.open();
        if (win) {
          win.document.write(
            `<iframe src="${dataUrl}" style="width:100%;height:100vh;border:none;" title="${fileItem.fileName}"></iframe>`
          );
        }
        return;
      }
    }

    const targetUrl = fileItem.oneDriveUrl || parentEvidence.oneDriveUrl;
    if (targetUrl && targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    alert('Seleccione nuevamente el archivo con el botón "Subir" para visualizarlo en este dispositivo.');
  };

  /**
   * Acción principal de la tarjeta (Ver / Descargar / Subir)
   */
  const openEvidencePrimaryAction = async (
    evidence: ProcedureActivityEvidence,
    mode: 'view' | 'download' | 'upload'
  ) => {
    if (mode === 'upload') {
      triggerFilePickerForStep(evidence.step);
      return;
    }

    const files = getNormalizedFiles(evidence);
    if (files.length >= 1) {
      await openAttachedFile(files[0], evidence, mode);
      return;
    }

    triggerFilePickerForStep(evidence.step);
  };

  const oneDrivePath = getOneDriveFolderPath(procedureCode, scopeUnitId);

  const handleCopyPath = () => {
    navigator.clipboard?.writeText(oneDrivePath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Input de archivo oculto con soporte MULTIPLE (permite elegir 1, 2 o más PDFs/Excels y guardarlos directo en OneDrive) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.zip,.png,.jpg"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Cabecera del Panel Lateral */}
      <div className="p-4 bg-white border-b border-slate-200 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
              <span>Google Drive UPT</span>
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

        {/* Ruta de Carpeta en OneDrive Institucional (Exclusivo Administrador del Sistema / GECA) */}
        {isAdminOrAuditor && (
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 min-w-0">
              <FolderOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span
                className="truncate font-mono text-[10px]"
                title={`OneDrive - UNIVERSIDAD PRIVADA DE TACNA/${oneDrivePath}`}
              >
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
        )}
      </div>

      {/* Lista de Tarjetas por Actividad */}
      <div className="p-3.5 overflow-y-auto space-y-3 flex-1 max-h-[640px]">
        {activities.map((act) => {
          const evidence = evidencesMap[getEvidenceKey(act.step)];
          const attachedFiles = getNormalizedFiles(evidence);
          const hasMultipleFiles = attachedFiles.length > 1;
          const isMenuOpen = openMenuStep === act.step;

          // TARJETA VISUAL CUANDO LA ACTIVIDAD YA TIENE 1 O VARIOS ARCHIVOS SUBIDOS
          if (evidence && attachedFiles.length > 0) {
            return (
              <div
                key={act.step}
                className="relative p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Fila Superior: Ícono de Documento (o Varios Documentos) + Nombre de Actividad + Menú ⋮ */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Ícono izquierdo: Si hay 2+ archivos -> botón con las figuras apiladas de varios documentos */}
                    {hasMultipleFiles ? (
                      <button
                        type="button"
                        onClick={() => openAttachedFile(attachedFiles[0], evidence, 'view')}
                        title={`${attachedFiles.length} documentos cargados en la Actividad ${act.step}`}
                        className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                      >
                        <div className="relative flex items-center justify-center">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600 -rotate-12 -mr-2" />
                          <FileText className="w-5.5 h-5.5 text-rose-600 z-10 drop-shadow-2xs" />
                          <Files className="w-4.5 h-4.5 text-blue-700 rotate-12 -ml-1.5" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-extrabold shadow-2xs">
                          {attachedFiles.length}
                        </span>
                      </button>
                    ) : attachedFiles[0].fileFormat === 'excel' ? (
                      <button
                        type="button"
                        onClick={() => openEvidencePrimaryAction(evidence, 'view')}
                        title="Abrir documento Excel"
                        className="w-10 h-11 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 shadow-2xs hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-5 h-5" />
                        <span className="text-[8px] font-extrabold uppercase tracking-wider leading-none mt-0.5">
                          XLS
                        </span>
                      </button>
                    ) : attachedFiles[0].fileFormat === 'word' ? (
                      <button
                        type="button"
                        onClick={() => openEvidencePrimaryAction(evidence, 'view')}
                        title="Abrir documento Word"
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
                        onClick={() => openEvidencePrimaryAction(evidence, 'view')}
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
                        onClick={() => openEvidencePrimaryAction(evidence, 'view')}
                        className="text-[13px] font-bold text-slate-900 break-words leading-snug hover:text-blue-700 cursor-pointer"
                        title={act.task}
                      >
                        {hasMultipleFiles
                          ? `${attachedFiles.length} documentos en esta actividad`
                          : attachedFiles[0].fileName}
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
                      <div className="absolute right-0 top-7 z-30 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => triggerFilePickerForStep(act.step)}
                          className="w-full px-3 py-1.5 text-left text-blue-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>Agregar otro PDF / Excel</span>
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
                          <span>Vaciar toda la actividad</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Si hay 2 o más archivos subidos, mostramos la lista completa de archivos dentro de la tarjeta */}
                {hasMultipleFiles && (
                  <div className="mt-2.5 space-y-1.5 bg-slate-50/90 p-2 rounded-xl border border-slate-200/80">
                    {attachedFiles.map((fileItem, idx) => (
                      <div
                        key={fileItem.id || idx}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 transition-colors"
                      >
                        <div
                          onClick={() => openAttachedFile(fileItem, evidence, 'view')}
                          className="flex items-center gap-2 min-w-0 cursor-pointer group"
                          title={`Ver ${fileItem.fileName}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md text-white flex items-center justify-center text-[8px] font-extrabold shrink-0 ${
                              fileItem.fileFormat === 'excel'
                                ? 'bg-emerald-600'
                                : fileItem.fileFormat === 'word'
                                ? 'bg-blue-600'
                                : 'bg-rose-600'
                            }`}
                          >
                            {fileItem.fileFormat === 'excel'
                              ? 'XLS'
                              : fileItem.fileFormat === 'word'
                              ? 'DOC'
                              : 'PDF'}
                          </span>
                          <span className="text-[11px] font-bold text-slate-800 truncate group-hover:text-blue-700">
                            {fileItem.fileName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openAttachedFile(fileItem, evidence, 'view')}
                            className="p-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Ver este documento"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openAttachedFile(fileItem, evidence, 'download')}
                            className="p-1 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Descargar este documento"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSingleFileFromStep(act.step, fileItem.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Quitar este archivo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-1.5">
                    {!hasMultipleFiles && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEvidencePrimaryAction(evidence, 'view')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          title="Ver documento"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Ver</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEvidencePrimaryAction(evidence, 'download')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          title="Descargar archivo"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>Descargar</span>
                        </button>
                      </>
                    )}

                    {/* Botón Subir: Permite subir otro PDF o Excel directamente (y lo guarda en OneDrive) */}
                    <button
                      type="button"
                      onClick={() => triggerFilePickerForStep(act.step)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                      title="Subir otro PDF o Excel adicional a esta actividad"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Subir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // TARJETA VACÍA (Sin enlaces manuales: solo botón directo de "Subir archivo")
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
                  <span className="text-xs font-bold text-slate-800">Actividad {act.step}</span>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 truncate max-w-[150px]"
                  title={act.responsible}
                >
                  {act.unit}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{act.task}</p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => triggerFilePickerForStep(act.step)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Seleccionar 1 o varios archivos PDF/Excel de su equipo para subirlos a esta actividad"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir archivo (PDF / Excel / Word)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
