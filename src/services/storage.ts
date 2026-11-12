import { getOrganizationUnitById, resolveUserOrganizationUnit, resolveUserSecondaryUnit, getCombinedUserProceduresAndProcesses } from '../data/organizationHierarchy';
import { 
  AuditProcessSession,
  ISODocument, 
  NonConformity, 
  AuditChecklistItem, 
  UserProfile, 
  ActivityLog,
  UPTIndicator,
  IndicatorMeasurement,
  EvaluationYear,
  OptionalUserModule,
  ProcedureActivityEvidence
} from '../types';
import { 
  UPT_DOCUMENTS, 
  UPT_NON_CONFORMITIES, 
  UPT_CHECKLIST,
  UPT_AUDIT_SESSIONS, 
  UPT_USERS, 
  UPT_ACTIVITY_LOGS,
  UPT_INDICATORS 
} from '../data/initialData';

const STORAGE_KEYS = {
  DOCS: 'upt_iso21001_documents_v26_10_c',
  CAPAS: 'upt_iso21001_non_conformities',
  CHECKLIST: 'upt_iso21001_audit_checklist',
  USERS: 'upt_iso21001_users_v3_firebase_exact',
  ACTIVE_USER: 'upt_iso21001_active_user',
  LOGS: 'upt_iso21001_activity_logs',
  INDICATORS: 'upt_iso21001_indicators_v26_10_denominations',
  YEARS: 'upt_iso21001_evaluation_years_v1',
  AUDIT_SESSIONS: 'upt_iso21001_audit_sessions_v1',
  ACTIVITY_EVIDENCES: 'upt_iso21001_activity_evidences_v1',
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
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_SESSIONS, JSON.stringify(UPT_AUDIT_SESSIONS));
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
    const filtered = parsed.filter(d => !d.code.startsWith('DE-') && d.documentType !== 'Documento Externo' && d.code !== 'PE.04.01.02');
    const updated = filtered.map(d => {
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

    if (updated.length !== parsed.length) { localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(updated)); }
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
          responsible: off.responsible,
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

// --- PLAN DE AUDITORÍA POR PROCESOS & OFICINAS ---
export function getAuditSessions(): AuditProcessSession[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_SESSIONS);
    return raw ? JSON.parse(raw) : UPT_AUDIT_SESSIONS;
  } catch {
    return UPT_AUDIT_SESSIONS;
  }
}

export function saveAuditSessions(sessions: AuditProcessSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.AUDIT_SESSIONS, JSON.stringify(sessions));
  broadcastChange('audit_sessions_updated', sessions);
}

export function updateAuditSession(session: AuditProcessSession): void {
  const sessions = getAuditSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
    saveAuditSessions(sessions);
  }
}

export function addAuditSession(sessionData: Omit<AuditProcessSession, 'id'>): AuditProcessSession {
  const sessions = getAuditSessions();
  const newSession: AuditProcessSession = {
    ...sessionData,
    id: 'aud-ses-' + Date.now(),
  };
  sessions.push(newSession);
  saveAuditSessions(sessions);
  return newSession;
}

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

// --- USUARIOS, JERARQUÍA DE OFICINAS Y CONTROL DE REGISTROS ---
const REVOKED_EMAILS_KEY = 'upt_sgc_revoked_emails_v3_firebase_exact';
const GLOBAL_MODULES_KEY = 'upt_sgc_global_enabled_modules_v1';

export function getGlobalEnabledModules(): OptionalUserModule[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GLOBAL_MODULES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setGlobalEnabledModules(
  modules: OptionalUserModule[],
  adminName?: string,
  logDetails?: string
): OptionalUserModule[] {
  const clean = Array.from(new Set(modules));
  if (typeof window !== 'undefined') {
    localStorage.setItem(GLOBAL_MODULES_KEY, JSON.stringify(clean));
  }
  if (adminName && logDetails) {
    addActivityLog({
      userName: adminName,
      userRole: 'Administrador del Sistema',
      action: 'Actualizó visibilidad de pestaña SGC para todas las oficinas',
      entityType: 'sistema',
      entityId: 'global-modules',
      details: logDetails,
    });
  }
  broadcastChange('MODULES_VISIBILITY_UPDATED', clean);
  return clean;
}

export function getRevokedEmails(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REVOKED_EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isUserEmailRevoked(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const revoked = getRevokedEmails();
  return revoked.includes(clean);
}

export function removeEmailFromRevoked(email: string): void {
  if (typeof window === 'undefined' || !email) return;
  const clean = email.trim().toLowerCase();
  const revoked = getRevokedEmails().filter(e => e !== clean);
  localStorage.setItem(REVOKED_EMAILS_KEY, JSON.stringify(revoked));
}

export function computeSyncHash(s: string): string {
  let h1 = 0xdeadbeef ^ s.length;
  let h2 = 0x41c6ce57 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761) >>> 0;
    h2 = Math.imul(h2 ^ c, 1597334677) >>> 0;
  }
  h1 = (Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)) >>> 0;
  h2 = (Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)) >>> 0;
  return h2.toString(16).padStart(8, '0') + h1.toString(16).padStart(8, '0');
}

export function normalizeUserProfile(u: UserProfile): UserProfile {
  if (!u) return u;
  const emailHash = computeSyncHash((u.email || '').trim().toLowerCase());
  const chargeHash = computeSyncHash((u.charge || '').trim().toUpperCase());
  // Solo el propietario autorizado (2bdcaa29f816e1df) o el perfil base u-geca tiene el rol Administrador del Sistema
  if (
    u.id === 'u-geca' ||
    emailHash === '2bdcaa29f816e1df' ||
    chargeHash === 'de76c5eddf099554' ||
    chargeHash === 'd8d15fd595df5921'
  ) {
    return {
      ...u,
      role: 'geca',
      charge: 'Administrador del Sistema',
      department: 'Administrador del Sistema',
      officeName: 'Administrador del Sistema',
      processCodes: ['PE.01', 'PE.02', 'PE.03', 'PE.04', 'PM.01', 'PM.02', 'PM.03', 'PS.01', 'PS.02', 'PS.03', 'PS.04', 'PS.05', 'PS.06'],
    };
  }

  // Resolver unidad organizacional (Órgano, Oficina, Área o Facultad) y sus procedimientos exactos
  const resolvedUnit = resolveUserOrganizationUnit(u);
  const secondaryUnit = resolveUserSecondaryUnit(u);
  if (resolvedUnit) {
    const cleanSecondary = secondaryUnit && secondaryUnit.id !== resolvedUnit.id ? secondaryUnit : undefined;
    const combined = getCombinedUserProceduresAndProcesses(resolvedUnit, cleanSecondary);
    return {
      ...u,
      unitId: resolvedUnit.id,
      secondaryUnitId: cleanSecondary?.id,
      secondaryOfficeName: cleanSecondary?.displayName,
      organName: resolvedUnit.organName,
      areaName: resolvedUnit.areaName,
      department: resolvedUnit.organName,
      officeName: resolvedUnit.displayName,
      procedureCodes: combined.procedureCodes,
      processCodes: combined.processCodes,
      enabledModules: Array.isArray(u.enabledModules) ? u.enabledModules : [],
    };
  }
  return u;
}

// Cuentas existentes en Firebase Authentication (sincronizadas 1:1 con Firebase Auth y Cloud Firestore)
const FIREBASE_AUTH_REGISTERED_USERS: UserProfile[] = [
  {
    id: '2etJk0KRfgG6KOcf8KBBW',
    name: 'Hugo Rivera',
    email: 'hjrivera.upt@gmail.com',
    charge: 'Funcionario Institucional UPT',
    department: 'RECTORADO',
    officeName: 'Oficina de Gestión de la Calidad (GECA)',
    unitId: 'geca-office',
    role: 'colaborador',
    processCodes: ['PE.01', 'PE.02', 'PM.01'],
    registeredAt: '2026-11-10',
    isCustomRegistered: true,
  },
  {
    id: 'ZiVMKJR8Hsd8KSKhDIFcU8s',
    name: 'Cristóbal (cristobal4)',
    email: 'cristobal4@gmail.com',
    charge: 'Funcionario Administrativo',
    department: 'RECTORADO',
    officeName: 'Oficina de Planeamiento y Presupuesto (OPLA)',
    unitId: 'opla',
    role: 'colaborador',
    processCodes: ['PE.01', 'PE.03', 'PS.05'],
    registeredAt: '2026-11-09',
    isCustomRegistered: true,
  },
  {
    id: 'bXMsUJKaNPXV2REikBHqSR',
    name: 'Cristóbal (cristobal3)',
    email: 'cristobal3@gmail.com',
    charge: 'Funcionario Administrativo',
    department: 'RECTORADO',
    officeName: 'Oficina de Planeamiento y Presupuesto (OPLA)',
    unitId: 'opla',
    role: 'colaborador',
    processCodes: ['PE.01', 'PE.03', 'PS.05'],
    registeredAt: '2026-11-09',
    isCustomRegistered: true,
  },
  {
    id: '7p6GLjyDNoMKxjKI6X1uIKTL',
    name: 'Cristóbal (cristobal2)',
    email: 'cristobal2@gmail.com',
    charge: 'Funcionario Administrativo',
    department: 'RECTORADO',
    officeName: 'Oficina de Planeamiento y Presupuesto (OPLA)',
    unitId: 'opla',
    role: 'colaborador',
    processCodes: ['PE.01', 'PE.03', 'PS.05'],
    registeredAt: '2026-11-06',
    isCustomRegistered: true,
  },
  {
    id: 'uOVJJr7T3lXGN7DiNWlBTg',
    name: 'Cristóbal (cristobal1)',
    email: 'cristobal1@gmail.com',
    charge: 'Funcionario Administrativo',
    department: 'RECTORADO',
    officeName: 'Oficina de Planeamiento y Presupuesto (OPLA)',
    unitId: 'opla',
    role: 'colaborador',
    processCodes: ['PE.01', 'PE.03', 'PS.05'],
    registeredAt: '2026-11-06',
    isCustomRegistered: true,
  },
  {
    id: 'KdutH9kwYVGSXIU7e0VHzj',
    name: 'Judith Bedoya (judbedoya@upt.pe)',
    email: 'judbedoya@upt.pe',
    charge: 'Funcionario Institucional UPT',
    department: 'RECTORADO',
    officeName: 'Oficina de Gestión de la Calidad (GECA)',
    unitId: 'geca-office',
    role: 'colaborador',
    processCodes: ['PE.01', 'PE.02', 'PM.01'],
    registeredAt: '2026-11-06',
    isCustomRegistered: true,
  },
  {
    id: 'mS9ow8TpoSBzOlmvsL1tCy',
    name: 'Steph (steph.5488)',
    email: 'steph.5488@gmail.com',
    charge: 'Funcionario Administrativo',
    department: 'RECTORADO',
    officeName: 'Oficina de Gestión de la Calidad (GECA)',
    unitId: 'geca-office',
    role: 'colaborador',
    processCodes: ['PE.01', 'PE.02', 'PM.01'],
    registeredAt: '2026-11-06',
    isCustomRegistered: true,
  },
  {
    id: 'LTFhJKAofrYe5yMVRJi1LAda',
    name: 'Gretty Rossi',
    email: 'grettyrossi@gmail.com',
    charge: 'Funcionario Administrativo',
    department: 'RECTORADO',
    officeName: 'Oficina de Gestión de la Calidad (GECA)',
    unitId: 'geca-office',
    role: 'colaborador',
    processCodes: ['PE.01', 'PE.02', 'PM.01'],
    registeredAt: '2026-11-05',
    isCustomRegistered: true,
  },
  {
    id: 'csblDoA4WeOEy4ci5CQdTf',
    name: 'Cristóbal',
    email: 'cristobal@gmail.com',
    charge: 'Funcionario Administrativo',
    department: 'RECTORADO',
    officeName: 'Oficina de Planeamiento y Presupuesto (OPLA)',
    unitId: 'opla',
    role: 'colaborador',
    processCodes: ['PE.01', 'PE.03', 'PS.05'],
    registeredAt: '2026-11-05',
    isCustomRegistered: true,
  },
];

export function getUsers(): UserProfile[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    const parsed: UserProfile[] | null = raw ? JSON.parse(raw) : null;
    const revokedSet = new Set(getRevokedEmails());

    // Asegurar que las 28 unidades oficiales + u-geca estén siempre presentes y actualizadas
    const officialById = new Map(UPT_USERS.map(u => [u.id, u]));
    const officialEmails = new Set(UPT_USERS.map(u => (u.email || '').trim().toLowerCase()));
    const customByEmail = new Map<string, UserProfile>();

    const collectCustomUser = (u: UserProfile) => {
      if (!u || !u.email) return;
      const cleanEmail = u.email.trim().toLowerCase();
      if (!cleanEmail || revokedSet.has(cleanEmail)) return;
      // Ignorar plantillas predefinidas y al propietario Administrador del Sistema
      if (officialById.has(u.id) || officialEmails.has(cleanEmail)) return;
      if (computeSyncHash(cleanEmail) === '2bdcaa29f816e1df') return;
      if (u.id && u.id.startsWith('u-unit-')) return;

      const normalized = normalizeUserProfile({ ...u, isCustomRegistered: true });
      customByEmail.set(cleanEmail, normalized);
    };

    // 1. Cargar cuentas registradas actuales en Firebase Authentication
    FIREBASE_AUTH_REGISTERED_USERS.forEach(collectCustomUser);

    // 2. Superponer cambios o nuevos registros guardados en la llave actual (reasignaciones de oficina, 2da dependencia, nuevos usuarios)
    const templateModulesById = new Map<string, OptionalUserModule[]>();
    if (parsed && Array.isArray(parsed)) {
      parsed.forEach((u) => {
        if (u && u.id && officialById.has(u.id) && Array.isArray(u.enabledModules)) {
          templateModulesById.set(u.id, u.enabledModules);
        }
        collectCustomUser(u);
      });
    }

    const customUsers = Array.from(customByEmail.values());
    const merged = [
      ...UPT_USERS.map((u) =>
        normalizeUserProfile({
          ...u,
          enabledModules: templateModulesById.get(u.id) || u.enabledModules || [],
        })
      ),
      ...customUsers,
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
    return merged;
  } catch {
    return UPT_USERS;
  }
}

export function getActiveUser(): UserProfile {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (!raw) return UPT_USERS[0];
    const parsed: UserProfile = JSON.parse(raw);
    const normalized = normalizeUserProfile(parsed);
    if (
      normalized.role !== parsed.role ||
      normalized.charge !== parsed.charge ||
      normalized.officeName !== parsed.officeName ||
      normalized.unitId !== parsed.unitId ||
      normalized.secondaryUnitId !== parsed.secondaryUnitId ||
      JSON.stringify(normalized.enabledModules) !== JSON.stringify(parsed.enabledModules) ||
      JSON.stringify(normalized.procedureCodes) !== JSON.stringify(parsed.procedureCodes)
    ) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return UPT_USERS[0];
  }
}

export function setActiveUser(user: UserProfile): UserProfile {
  const normalized = normalizeUserProfile(user);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(normalized));

  // Si es un usuario real autenticado con Firebase (no es una de las 28 plantillas u-unit-* ni el Administrador del Sistema),
  // asegurar que quede registrado en el padrón local para que el Administrador pueda supervisarlo.
  const cleanEmail = (normalized.email || '').trim().toLowerCase();
  const isOwner = computeSyncHash(cleanEmail) === '2bdcaa29f816e1df' || normalized.id === 'u-geca';
  const isTemplate = normalized.id?.startsWith('u-unit-') || UPT_USERS.some(u => u.id === normalized.id || u.email.toLowerCase() === cleanEmail);

  if (cleanEmail && !isOwner && !isTemplate && !isUserEmailRevoked(cleanEmail)) {
    const current = getUsers();
    const existsIdx = current.findIndex(u => (u.email || '').trim().toLowerCase() === cleanEmail);
    const nowStr = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5);
    const entry: UserProfile = {
      ...normalized,
      isCustomRegistered: true,
      registeredAt: normalized.registeredAt || (existsIdx >= 0 ? current[existsIdx].registeredAt : nowStr),
    };
    if (existsIdx >= 0) {
      current[existsIdx] = entry;
    } else {
      current.push(entry);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(current));
    localStorage.setItem('upt_sgc_users_v1', JSON.stringify(current));
  }

  broadcastChange('USER_CHANGED', normalized);
  return normalized;
}

export function registerUser(newUser: Omit<UserProfile, 'id'>): UserProfile {
  const cleanEmail = (newUser.email || '').trim().toLowerCase();
  removeEmailFromRevoked(cleanEmail);

  const users = getUsers().filter(
    u => !u.isCustomRegistered || (u.email || '').trim().toLowerCase() !== cleanEmail
  );
  const nowStr = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5);
  const id = `u-custom-${Date.now()}`;
  const created: UserProfile = normalizeUserProfile({
    ...newUser,
    id,
    registeredAt: newUser.registeredAt || nowStr,
    isCustomRegistered: true,
    avatar: newUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });
  users.push(created);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem('upt_sgc_users_v1', JSON.stringify(users));
  setActiveUser(created);
  addActivityLog({
    userName: created.name,
    userRole: created.charge,
    action: 'Registró nuevo funcionario institucional en el SGC UPT',
    entityType: 'sistema',
    entityId: created.id,
    details: `Dependencia: ${created.officeName || created.department} (${created.procedureCodes?.length || 0} procedimientos asignados) - Correo: ${created.email}`,
  });
  broadcastChange('USER_CHANGED', created);
  return created;
}

export function deleteRegisteredUser(userId: string, email: string, adminName: string): UserProfile[] {
  const cleanEmail = (email || '').trim().toLowerCase();
  // Nunca permitir borrar al propietario Administrador del Sistema
  if (computeSyncHash(cleanEmail) === '2bdcaa29f816e1df') {
    return getUsers();
  }
  const revoked = getRevokedEmails();
  if (cleanEmail && !revoked.includes(cleanEmail)) {
    revoked.push(cleanEmail);
    localStorage.setItem(REVOKED_EMAILS_KEY, JSON.stringify(revoked));
  }
  const currentUsers = getUsers();
  const targetUser = currentUsers.find(u => u.id === userId || (u.email || '').trim().toLowerCase() === cleanEmail);
  const updated = currentUsers.filter(
    u => u.id !== userId && (!cleanEmail || (u.email || '').trim().toLowerCase() !== cleanEmail || !u.isCustomRegistered)
  );
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  localStorage.setItem('upt_sgc_users_v1', JSON.stringify(updated));

  addActivityLog({
    userName: adminName,
    userRole: 'Administrador del Sistema',
    action: 'Eliminó y revocó registro de usuario por oficina no correspondiente',
    entityType: 'sistema',
    entityId: userId,
    details: `Usuario dado de baja: ${targetUser?.name || email} (${cleanEmail}) - Dependencia que tenía: ${targetUser?.officeName || ''}`,
  });
  broadcastChange('USER_CHANGED', updated);
  return updated;
}

export function reassignRegisteredUserUnit(userId: string, newUnitId: string, adminName: string): UserProfile[] {
  const unit = getOrganizationUnitById(newUnitId);
  if (!unit) return getUsers();

  const currentUsers = getUsers();
  const updated = currentUsers.map(u => {
    if (u.id === userId) {
      const secUnit = resolveUserSecondaryUnit(u);
      const cleanSec = secUnit && secUnit.id !== unit.id ? secUnit : undefined;
      const combined = getCombinedUserProceduresAndProcesses(unit, cleanSec);
      const updatedUser: UserProfile = {
        ...u,
        unitId: unit.id,
        secondaryUnitId: cleanSec?.id,
        secondaryOfficeName: cleanSec?.displayName,
        organName: unit.organName,
        areaName: unit.areaName,
        department: unit.organName,
        officeName: unit.displayName,
        procedureCodes: combined.procedureCodes,
        processCodes: combined.processCodes,
      };
      return updatedUser;
    }
    return u;
  });

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  localStorage.setItem('upt_sgc_users_v1', JSON.stringify(updated));

  const targetUser = updated.find(u => u.id === userId);
  if (targetUser) {
    const active = getActiveUser();
    if (active.id === targetUser.id || (active.email && active.email.trim().toLowerCase() === targetUser.email.trim().toLowerCase())) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(targetUser));
    }
    addActivityLog({
      userName: adminName,
      userRole: 'Administrador del Sistema',
      action: 'Reasignó dependencia/área principal a funcionario registrado',
      entityType: 'sistema',
      entityId: userId,
      details: `Funcionario: ${targetUser.name} (${targetUser.email}) -> Nueva unidad: ${unit.displayName} (${targetUser.procedureCodes?.length || unit.consolidatedProcedures.length} procedimientos)`,
    });
  }
  broadcastChange('USER_CHANGED', updated);
  return updated;
}

export function assignRegisteredUserSecondaryUnit(userId: string, secondaryUnitId: string, adminName: string): UserProfile[] {
  const secUnit = secondaryUnitId ? getOrganizationUnitById(secondaryUnitId) : undefined;
  const currentUsers = getUsers();
  const updated = currentUsers.map(u => {
    if (u.id === userId) {
      const primaryUnit = resolveUserOrganizationUnit(u);
      const cleanSec = secUnit && secUnit.id !== primaryUnit?.id ? secUnit : undefined;
      const combined = getCombinedUserProceduresAndProcesses(primaryUnit, cleanSec, u.procedureCodes, u.processCodes);
      const updatedUser: UserProfile = {
        ...u,
        secondaryUnitId: cleanSec?.id,
        secondaryOfficeName: cleanSec?.displayName,
        procedureCodes: combined.procedureCodes,
        processCodes: combined.processCodes,
      };
      return updatedUser;
    }
    return u;
  });

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  localStorage.setItem('upt_sgc_users_v1', JSON.stringify(updated));

  const targetUser = updated.find(u => u.id === userId);
  if (targetUser) {
    const active = getActiveUser();
    if (active.id === targetUser.id || (active.email && active.email.trim().toLowerCase() === targetUser.email.trim().toLowerCase())) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(targetUser));
    }
    addActivityLog({
      userName: adminName,
      userRole: 'Administrador del Sistema',
      action: targetUser.secondaryUnitId
        ? 'Asignó 2.ª dependencia adicional a funcionario registrado'
        : 'Removió 2.ª dependencia adicional a funcionario registrado',
      entityType: 'sistema',
      entityId: userId,
      details: targetUser.secondaryUnitId
        ? `Funcionario: ${targetUser.name} (${targetUser.email}) -> 1.ª: ${targetUser.officeName} | 2.ª: ${targetUser.secondaryOfficeName} (${targetUser.procedureCodes?.length || 0} procedimientos consolidados)`
        : `Funcionario: ${targetUser.name} (${targetUser.email}) -> Quedó únicamente con su dependencia principal: ${targetUser.officeName}`,
    });
  }
  broadcastChange('USER_CHANGED', updated);
  return updated;
}

export function updateRegisteredUserModules(
  userId: string,
  enabledModules: OptionalUserModule[],
  adminName: string
): UserProfile[] {
  const cleanModules = Array.from(new Set(enabledModules));
  const currentUsers = getUsers();
  const updated = currentUsers.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        enabledModules: cleanModules,
      };
    }
    return u;
  });

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  localStorage.setItem('upt_sgc_users_v1', JSON.stringify(updated));

  const targetUser = updated.find((u) => u.id === userId);
  if (targetUser) {
    const active = getActiveUser();
    if (
      active.id === targetUser.id ||
      (active.email && active.email.trim().toLowerCase() === targetUser.email.trim().toLowerCase())
    ) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(targetUser));
    }
    const labelsMap: Record<OptionalUserModule, string> = {
      indicators: 'Tablero de Indicadores',
      capa: 'No Conformidades (RG08)',
      checklist: 'Evaluación ISO 21001',
    };
    const enabledText =
      cleanModules.length > 0 ? cleanModules.map((m) => labelsMap[m]).join(', ') : 'Ninguna (Solo módulos base)';
    addActivityLog({
      userName: adminName,
      userRole: 'Administrador del Sistema',
      action: 'Actualizó visualización de pestañas SGC para usuario/oficina',
      entityType: 'sistema',
      entityId: userId,
      details: `Funcionario: ${targetUser.name} (${targetUser.officeName}) -> Pestañas habilitadas: ${enabledText}`,
    });
  }
  broadcastChange('USER_CHANGED', updated);
  return updated;
}

export function updateBulkRegisteredUsersModules(
  transformFn: (current: OptionalUserModule[]) => OptionalUserModule[],
  actionLabel: string,
  adminName: string
): UserProfile[] {
  const currentUsers = getUsers();
  const active = getActiveUser();
  let updatedActive: UserProfile | null = null;

  const updated = currentUsers.map((u) => {
    const isOwner = u.id === 'u-geca' || (u.role === 'geca' && u.officeName === 'Administrador del Sistema');
    if (isOwner) return u;
    const nextModules = Array.from(new Set(transformFn(Array.isArray(u.enabledModules) ? u.enabledModules : [])));
    const nextUser: UserProfile = {
      ...u,
      enabledModules: nextModules,
    };
    if (
      active.id === nextUser.id ||
      (active.email && active.email.trim().toLowerCase() === (nextUser.email || '').trim().toLowerCase())
    ) {
      updatedActive = nextUser;
    }
    return nextUser;
  });

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  localStorage.setItem('upt_sgc_users_v1', JSON.stringify(updated));
  if (updatedActive) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updatedActive));
  }

  addActivityLog({
    userName: adminName,
    userRole: 'Administrador del Sistema',
    action: 'Actualizó visibilidad global de pestañas SGC para todas las oficinas',
    entityType: 'sistema',
    entityId: 'global-modules',
    details: actionLabel,
  });
  broadcastChange('USER_CHANGED', updated);
  return updated;
}

export function mergeCloudRegisteredUsers(cloudUsers: UserProfile[], cloudRevokedEmails: string[]): UserProfile[] {
  if (typeof window === 'undefined') return getUsers();

  const activeCloudEmails = new Set(
    cloudUsers.map(u => (u.email || '').trim().toLowerCase()).filter(Boolean)
  );
  const cloudRevokedSet = new Set(
    cloudRevokedEmails.map(e => (e || '').trim().toLowerCase()).filter(Boolean)
  );

  // Si un usuario está activo en sgc_registered_users de Firestore, ya no está revocado
  const updatedRevoked = new Set(
    [...getRevokedEmails(), ...Array.from(cloudRevokedSet)].filter(e => !activeCloudEmails.has(e))
  );
  localStorage.setItem(REVOKED_EMAILS_KEY, JSON.stringify(Array.from(updatedRevoked)));

  // Filtrar cualquier usuario que haya sido eliminado/revocado en la nube
  const current = getUsers().filter(u => {
    const em = (u.email || '').trim().toLowerCase();
    if (!em || u.id === 'u-geca' || u.id?.startsWith('u-unit-')) return true;
    return !updatedRevoked.has(em);
  });

  const existingIndexByEmail = new Map<string, number>();
  current.forEach((u, idx) => {
    const em = (u.email || '').trim().toLowerCase();
    if (em) existingIndexByEmail.set(em, idx);
  });

  for (const cu of cloudUsers) {
    const cleanEmail = (cu.email || '').trim().toLowerCase();
    if (!cleanEmail || updatedRevoked.has(cleanEmail)) continue;
    const existingIdx = existingIndexByEmail.get(cleanEmail);
    const cleanedCu: UserProfile = {
      ...cu,
      secondaryUnitId: cu.secondaryUnitId || undefined,
      secondaryOfficeName: cu.secondaryOfficeName || undefined,
      areaName: cu.areaName || undefined,
      enabledModules: Array.isArray(cu.enabledModules) ? cu.enabledModules : undefined,
      isCustomRegistered: true,
    };

    if (existingIdx === undefined) {
      current.push(normalizeUserProfile(cleanedCu));
      existingIndexByEmail.set(cleanEmail, current.length - 1);
    } else {
      const existingUser = current[existingIdx];
      if (!existingUser.id?.startsWith('u-unit-') && existingUser.id !== 'u-geca') {
        const normalizedCloud = normalizeUserProfile({
          ...existingUser,
          ...cleanedCu,
          id: existingUser.id || cleanedCu.id,
        });
        current[existingIdx] = normalizedCloud;
        const active = getActiveUser();
        if ((active.email || '').trim().toLowerCase() === cleanEmail) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(normalizedCloud));
        }
      }
    }
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(current));
  return current;
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

// --- EVIDENCIAS POR ACTIVIDAD DE PROCEDIMIENTOS (ONEDRIVE / LISTA MAESTRA) ---
export function getActivityEvidences(): Record<string, ProcedureActivityEvidence> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_EVIDENCES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveActivityEvidence(evidence: ProcedureActivityEvidence): Record<string, ProcedureActivityEvidence> {
  const all = getActivityEvidences();
  // Limpiar cualquier fileDataUrl para que localStorage NUNCA se desborde ni falle por cuota
  const cleanEvidence: ProcedureActivityEvidence = {
    ...evidence,
    fileDataUrl: undefined,
    files: evidence.files?.map((f) => ({ ...f, fileDataUrl: undefined })),
  };
  all[cleanEvidence.id] = cleanEvidence;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_EVIDENCES, JSON.stringify(all));
      broadcastChange('ACTIVITY_EVIDENCES_UPDATED', all);
    } catch (e) {
      console.warn('Almacenamiento seguro en localStorage:', e);
    }
  }
  return all;
}

export function deleteActivityEvidence(evidenceId: string): Record<string, ProcedureActivityEvidence> {
  const all = getActivityEvidences();
  delete all[evidenceId];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_EVIDENCES, JSON.stringify(all));
      broadcastChange('ACTIVITY_EVIDENCES_UPDATED', all);
    } catch (e) {
      console.warn('Almacenamiento seguro en localStorage:', e);
    }
  }
  return all;
}

export function mergeCloudActivityEvidences(
  cloudList: ProcedureActivityEvidence[]
): Record<string, ProcedureActivityEvidence> {
  const localMap = getActivityEvidences();
  let changed = false;
  for (const item of cloudList) {
    if (!item || !item.id) continue;
    const existing = localMap[item.id];
    if (!existing || (item.updatedAt && (!existing.updatedAt || item.updatedAt >= existing.updatedAt))) {
      // Limpiar dataUrl al fusionar
      localMap[item.id] = {
        ...item,
        fileDataUrl: undefined,
        files: item.files?.map((f) => ({ ...f, fileDataUrl: undefined })),
      };
      changed = true;
    }
  }
  if (changed && typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_EVIDENCES, JSON.stringify(localMap));
    } catch (e) {
      console.warn('Almacenamiento seguro en localStorage:', e);
    }
  }
  return localMap;
}
