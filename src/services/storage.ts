import { 
  ISODocument, 
  NonConformity, 
  AuditChecklistItem, 
  UserProfile, 
  ActivityLog,
  UPTIndicator,
  IndicatorMeasurement,
  EvaluationYear
} from '../types';
import { 
  UPT_DOCUMENTS, 
  UPT_NON_CONFORMITIES, 
  UPT_CHECKLIST, 
  UPT_USERS, 
  UPT_ACTIVITY_LOGS,
  UPT_INDICATORS 
} from '../data/initialData';

const STORAGE_KEYS = {
  DOCS: 'upt_iso21001_documents_v26_10_c',
  CAPAS: 'upt_iso21001_non_conformities',
  CHECKLIST: 'upt_iso21001_audit_checklist',
  USERS: 'upt_iso21001_users',
  ACTIVE_USER: 'upt_iso21001_active_user',
  LOGS: 'upt_iso21001_activity_logs',
  INDICATORS: 'upt_iso21001_indicators_v04_10',
  YEARS: 'upt_iso21001_evaluation_years_v1',
};

const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('upt_iso21001_realtime_sync')
  : null;

function broadcastChange(type: string, payload?: unknown) {
  if (syncChannel) {
    syncChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
}

export function initStorage() {
  if (typeof window === 'undefined') return;

  const storedDocs = localStorage.getItem(STORAGE_KEYS.DOCS);
  if (!storedDocs) {
    try {
      const oldDocs = localStorage.getItem('upt_iso21001_documents_v21_09') || localStorage.getItem('upt_iso21001_documents_v5') || localStorage.getItem('upt_iso21001_documents_v4') || localStorage.getItem('upt_iso21001_documents');
      const officialCodes = new Set(UPT_DOCUMENTS.map(d => d.code));
      if (oldDocs) {
        const oldParsed: ISODocument[] = JSON.parse(oldDocs);
        const customUserDocs = oldParsed.filter(d => !officialCodes.has(d.code));
        localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify([...UPT_DOCUMENTS, ...customUserDocs]));
      } else {
        localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(UPT_DOCUMENTS));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(UPT_DOCUMENTS));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.CAPAS)) {
    localStorage.setItem(STORAGE_KEYS.CAPAS, JSON.stringify(UPT_NON_CONFORMITIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHECKLIST)) {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(UPT_CHECKLIST));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(UPT_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(UPT_USERS[0])); // Default: Jefe de GECA
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(UPT_ACTIVITY_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.YEARS)) {
    localStorage.setItem(
      STORAGE_KEYS.YEARS,
      JSON.stringify([
        { year: 2026, status: 'abierto', openedAt: '2026-01-01', openedBy: 'Jefe de la Oficina de Gestión de la Calidad (GECA)' }
      ])
    );
  }
  const storedIndicators = localStorage.getItem(STORAGE_KEYS.INDICATORS);
  if (!storedIndicators || JSON.parse(storedIndicators).length < 20) {
    localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(UPT_INDICATORS));
  }
}

export function subscribeToRealtime(callback: (type: string, payload: unknown) => void) {
  if (!syncChannel) return () => {};
  const handler = (event: MessageEvent) => {
    callback(event.data.type, event.data.payload);
  };
  syncChannel.addEventListener('message', handler);
  return () => syncChannel.removeEventListener('message', handler);
}

// --- DOCUMENTOS ---
export function getDocuments(): ISODocument[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCS);
    if (!raw) return UPT_DOCUMENTS;
    const parsed: ISODocument[] = JSON.parse(raw);

    // Always ensure official documents use the latest audited storageLocation & description
    const officialMap = new Map(UPT_DOCUMENTS.map(d => [d.code, d]));
    const updated = parsed.map(d => {
      const off = officialMap.get(d.code);
      if (off) {
        return {
          ...d,
          storageLocation: off.storageLocation,
          description: off.description,
          title: off.title,
        };
      }
      return d;
    });

    // Automatically incorporate any official document added to UPT_DOCUMENTS
    const existingCodes = new Set(updated.map(d => d.code));
    const missingOfficial = UPT_DOCUMENTS.filter(d => !existingCodes.has(d.code));
    if (missingOfficial.length > 0) {
      const fullList = [...updated, ...missingOfficial];
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(fullList));
      return fullList;
    }

    return updated;
  } catch {
    return UPT_DOCUMENTS;
  }
}

export function saveDocument(doc: ISODocument, authorName: string): ISODocument {
  const docs = getDocuments();
  const existingIdx = docs.findIndex(d => d.id === doc.id);
  let updatedDoc: ISODocument;

  if (existingIdx >= 0) {
    updatedDoc = {
      ...doc,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    docs[existingIdx] = updatedDoc;
    addActivityLog({
      userName: authorName,
      userRole: getActiveUser().charge,
      action: 'Actualizó documento oficial',
      entityType: 'documento',
      entityId: doc.code,
      details: 'Modificó versión ' + doc.version + ' de ' + doc.title,
    });
  } else {
    updatedDoc = {
      ...doc,
      id: doc.id || 'doc-' + Date.now(),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    docs.unshift(updatedDoc);
    addActivityLog({
      userName: authorName,
      userRole: getActiveUser().charge,
      action: 'Incorporó a Lista Maestra',
      entityType: 'documento',
      entityId: doc.code,
      details: 'Registró ' + doc.code + ' - ' + doc.title,
    });
  }

  localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  broadcastChange('DOCUMENTS_UPDATED', docs);
  return updatedDoc;
}

export function approveDocument(id: string, approverName: string): ISODocument | null {
  const docs = getDocuments();
  const doc = docs.find(d => d.id === id);
  if (!doc) return null;

  doc.status = 'vigente';
  doc.approvedBy = approverName;
  doc.updatedAt = new Date().toISOString().split('T')[0];
  
  localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  addActivityLog({
    userName: approverName,
    userRole: 'Aprobador',
    action: 'Aprobó emisión oficial de documento',
    entityType: 'documento',
    entityId: doc.code,
    details: 'Aprobó ' + doc.code + ' v' + doc.version,
  });
  broadcastChange('DOCUMENTS_UPDATED', docs);
  return doc;
}

export function deleteDocument(id: string, authorName: string): boolean {
  const docs = getDocuments();
  const doc = docs.find(d => d.id === id);
  const filtered = docs.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(filtered));
  if (doc) {
    addActivityLog({
      userName: authorName,
      userRole: getActiveUser().charge,
      action: 'Eliminó documento de Lista Maestra',
      entityType: 'documento',
      entityId: doc.code,
      details: 'Eliminó ' + doc.code,
    });
  }
  broadcastChange('DOCUMENTS_UPDATED', filtered);
  return true;
}

// --- NO CONFORMIDADES (CAPA & RG08/RG06) ---
export function getNonConformities(): NonConformity[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAPAS);
    return raw ? JSON.parse(raw) : UPT_NON_CONFORMITIES;
  } catch {
    return UPT_NON_CONFORMITIES;
  }
}

export function saveNonConformity(nc: NonConformity, authorName: string): NonConformity {
  const capas = getNonConformities();
  const existingIdx = capas.findIndex(c => c.id === nc.id);
  let updatedNC: NonConformity;

  if (existingIdx >= 0) {
    updatedNC = { ...nc };
    capas[existingIdx] = updatedNC;
    addActivityLog({
      userName: authorName,
      userRole: getActiveUser().charge,
      action: 'Actualizó seguimiento CAPA',
      entityType: 'no_conformidad',
      entityId: nc.code,
      details: 'Estado: ' + nc.status + ' | Asignado a: ' + nc.assignedTo,
    });
  } else {
    updatedNC = {
      ...nc,
      id: nc.id || 'nc-' + Date.now(),
      detectedDate: nc.detectedDate || new Date().toISOString().split('T')[0],
    };
    capas.unshift(updatedNC);
    addActivityLog({
      userName: authorName,
      userRole: getActiveUser().charge,
      action: 'Registró No Conformidad (RG08.PE.02)',
      entityType: 'no_conformidad',
      entityId: nc.code,
      details: nc.title + ' (' + nc.severity.toUpperCase() + ')',
    });
  }

  localStorage.setItem(STORAGE_KEYS.CAPAS, JSON.stringify(capas));
  broadcastChange('CAPAS_UPDATED', capas);
  return updatedNC;
}

export function closeNonConformity(id: string, verifierName: string, verificationNotes: string): NonConformity | null {
  const capas = getNonConformities();
  const nc = capas.find(c => c.id === id);
  if (!nc) return null;

  nc.status = 'cerrada';
  nc.verificationDate = new Date().toISOString().split('T')[0];
  nc.verifiedBy = verifierName;
  nc.verificationNotes = verificationNotes;

  localStorage.setItem(STORAGE_KEYS.CAPAS, JSON.stringify(capas));
  addActivityLog({
    userName: verifierName,
    userRole: getActiveUser().charge,
    action: 'Verificó cierre de eficacia formal (Cl. 10.2)',
    entityType: 'no_conformidad',
    entityId: nc.code,
    details: 'Cierre eficaz comprobado: ' + verificationNotes.slice(0, 80),
  });
  broadcastChange('CAPAS_UPDATED', capas);
  return nc;
}

// --- INDICADORES UPT (RG04.PE.02) ---
export function getIndicators(): UPTIndicator[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INDICATORS);
    const parsed: UPTIndicator[] = raw ? JSON.parse(raw) : UPT_INDICATORS;
    const officialMap = new Map(UPT_INDICATORS.map(i => [i.code, i]));
    return parsed.map(ind => {
      const off = officialMap.get(ind.code);
      if (off) {
        return {
          ...off,
          ...ind,
          formulaType: off.formulaType || ind.formulaType,
          numeratorLabel: off.numeratorLabel || ind.numeratorLabel,
          denominatorLabel: off.denominatorLabel || ind.denominatorLabel,
          currentEvidenceName: ind.currentEvidenceName || off.currentEvidenceName,
          currentEvidenceUrl: ind.currentEvidenceUrl || off.currentEvidenceUrl,
          validationStatus: ind.validationStatus || off.validationStatus || 'validado_conforme',
          measurements: ind.measurements && ind.measurements.length > 0 ? ind.measurements : off.measurements || [],
        };
      }
      return ind;
    });
  } catch {
    return UPT_INDICATORS;
  }
}

export function updateIndicator(indicator: UPTIndicator, authorName: string): void {
  const indicators = getIndicators();
  const idx = indicators.findIndex(i => i.code === indicator.code);
  if (idx >= 0) {
    indicators[idx] = indicator;
    localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicators));
    addActivityLog({
      userName: authorName,
      userRole: getActiveUser().charge,
      action: 'Actualizó valor de Indicador UPT',
      entityType: 'indicador',
      entityId: indicator.code,
      details: 'Nuevo valor: ' + indicator.currentValue + ' ' + indicator.unit + ' (Meta: ' + indicator.target + ')',
    });
    broadcastChange('INDICATORS_UPDATED', indicators);
  }
}

export function addIndicatorMeasurement(
  indicatorCode: string,
  measurementData: Omit<IndicatorMeasurement, 'id' | 'date'>,
  author: UserProfile
): UPTIndicator | null {
  const indicators = getIndicators();
  const ind = indicators.find(i => i.code === indicatorCode);
  if (!ind) return null;

  const newMeas: IndicatorMeasurement = {
    ...measurementData,
    id: `meas-${indicatorCode}-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  };

  if (!ind.measurements) ind.measurements = [];
  ind.measurements.unshift(newMeas);

  // Actualizar valores en el indicador
  ind.currentValue = newMeas.calculatedValue;
  ind.currentEvidenceName = newMeas.evidenceName;
  ind.currentEvidenceUrl = newMeas.evidenceUrl;
  ind.validationStatus = newMeas.status;
  ind.lastEvaluationDate = newMeas.date;

  const idx = indicators.findIndex(i => i.code === indicatorCode);
  if (idx >= 0) indicators[idx] = ind;

  localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicators));
  addActivityLog({
    userName: author.name,
    userRole: author.charge,
    action: 'Registró medición y evidencia de Indicador (RG04.PE.02)',
    entityType: 'indicador',
    entityId: ind.code,
    details: `Período ${newMeas.period}: ${newMeas.calculatedValue} ${ind.unit}. Evidencia: ${newMeas.evidenceName} (${newMeas.status.toUpperCase()})`,
  });
  broadcastChange('INDICATORS_UPDATED', indicators);
  return ind;
}

export function validateIndicatorMeasurement(
  indicatorCode: string,
  measurementId: string,
  status: 'validado_conforme' | 'observado',
  comment: string,
  reviewer: UserProfile
): UPTIndicator | null {
  const indicators = getIndicators();
  const ind = indicators.find(i => i.code === indicatorCode);
  if (!ind || !ind.measurements) return null;

  const meas = ind.measurements.find(m => m.id === measurementId);
  if (!meas) return null;

  meas.status = status;
  meas.validationComment = comment;
  meas.validatedBy = `${reviewer.name} (${reviewer.charge})`;
  meas.validatedAt = new Date().toISOString().split('T')[0];

  ind.validationStatus = status;

  const idx = indicators.findIndex(i => i.code === indicatorCode);
  if (idx >= 0) indicators[idx] = ind;

  localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicators));
  addActivityLog({
    userName: reviewer.name,
    userRole: reviewer.charge,
    action: status === 'validado_conforme' ? 'Validó evidencia de Indicador (Conforme)' : 'Observó evidencia de Indicador',
    entityType: 'indicador',
    entityId: ind.code,
    details: `Evaluación de calidad [${meas.period}]: ${status.toUpperCase()} - ${comment || 'Sustento auditado'}`,
  });
  broadcastChange('INDICATORS_UPDATED', indicators);
  return ind;
}

// --- AUDITORÍA & CHECKLIST ---
export function getChecklist(): AuditChecklistItem[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
    return raw ? JSON.parse(raw) : UPT_CHECKLIST;
  } catch {
    return UPT_CHECKLIST;
  }
}

export function updateChecklistItem(item: AuditChecklistItem): void {
  const list = getChecklist();
  const idx = list.findIndex(i => i.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(list));
    broadcastChange('CHECKLIST_UPDATED', list);
  }
}

// --- USUARIOS Y ROLES ---
export function getUsers(): UserProfile[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : UPT_USERS;
  } catch {
    return UPT_USERS;
  }
}

export function getActiveUser(): UserProfile {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    return raw ? JSON.parse(raw) : UPT_USERS[0];
  } catch {
    return UPT_USERS[0];
  }
}

export function setActiveUser(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  broadcastChange('USER_CHANGED', user);
}

// --- HISTORIAL DE ACTIVIDADES ---
export function getLogs(): ActivityLog[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : UPT_ACTIVITY_LOGS;
  } catch {
    return UPT_ACTIVITY_LOGS;
  }
}

export function addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  const logs = getLogs();
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0] + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  
  const newLog: ActivityLog = {
    ...log,
    id: 'log-' + Date.now(),
    timestamp,
  };
  logs.unshift(newLog);
  if (logs.length > 50) logs.pop();
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  broadcastChange('LOGS_UPDATED', logs);
}

// --- BACKUP ---
export function exportBackup(): string {
  const data = {
    institution: 'Universidad Privada de Tacna',
    documents: getDocuments(),
    nonConformities: getNonConformities(),
    indicators: getIndicators(),
    checklist: getChecklist(),
    users: getUsers(),
    logs: getLogs(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.documents) localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(data.documents));
    if (data.nonConformities) localStorage.setItem(STORAGE_KEYS.CAPAS, JSON.stringify(data.nonConformities));
    if (data.indicators) localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(data.indicators));
    if (data.checklist) localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(data.checklist));
    if (data.logs) localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs));
    broadcastChange('ALL_RESET');
    return true;
  } catch (err) {
    console.error('Error importing backup:', err);
    return false;
  }
}

export function resetToDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(UPT_DOCUMENTS));
  localStorage.setItem(STORAGE_KEYS.CAPAS, JSON.stringify(UPT_NON_CONFORMITIES));
  localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(UPT_CHECKLIST));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(UPT_USERS));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(UPT_USERS[0]));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(UPT_ACTIVITY_LOGS));
  localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(UPT_INDICATORS));
  broadcastChange('ALL_RESET');
}


// --- GOBERNANZA DE AÑOS DE EVALUACIÓN ---
export function getEvaluationYears(): EvaluationYear[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.YEARS);
    if (!raw) {
      return [{ year: 2026, status: 'abierto', openedAt: '2026-01-01', openedBy: 'Jefe de la Oficina de Gestión de la Calidad (GECA)' }];
    }
    const parsed: EvaluationYear[] = JSON.parse(raw);
    if (!parsed.some(y => y.year === 2026)) {
      parsed.unshift({ year: 2026, status: 'abierto', openedAt: '2026-01-01', openedBy: 'Jefe de la Oficina de Gestión de la Calidad (GECA)' });
    }
    return parsed.sort((a, b) => a.year - b.year);
  } catch {
    return [{ year: 2026, status: 'abierto' }];
  }
}

export function saveEvaluationYears(years: EvaluationYear[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(years));
  broadcastChange('years_updated', years);
}

export function openNewEvaluationYear(year: number, authorName: string): EvaluationYear[] {
  const years = getEvaluationYears();
  if (years.some(y => y.year === year)) return years;
  const newYearObj: EvaluationYear = {
    year,
    status: 'abierto',
    openedAt: new Date().toISOString().split('T')[0],
    openedBy: authorName,
  };
  const updated: EvaluationYear[] = [...years, newYearObj].sort((a, b) => a.year - b.year);
  saveEvaluationYears(updated);
  return updated;
}

export function toggleYearStatus(year: number, authorName: string): EvaluationYear[] {
  const years = getEvaluationYears();
  const updated = years.map((y) => {
    if (y.year === year) {
      const nextStatus: 'abierto' | 'cerrado' = y.status === 'abierto' ? 'cerrado' : 'abierto';
      return {
        ...y,
        status: nextStatus,
        closedAt: nextStatus === 'cerrado' ? new Date().toISOString().split('T')[0] : undefined,
        closedBy: nextStatus === 'cerrado' ? authorName : undefined,
      };
    }
    return y;
  });
  saveEvaluationYears(updated);
  return updated;
}
