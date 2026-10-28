export type UserRole = 
  | 'geca' 
  | 'rectorado' 
  | 'vrac' 
  | 'vrin' 
  | 'diga' 
  | 'director_escuela' 
  | 'opla'
  | 'aphu'
  | 'resu'
  | 'tein'
  | 'bisa'
  | 'adma'
  | 'obun'
  | 'espg'
  | 'reni'
  | 'csst'
  | 'auditor' 
  | 'colaborador';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  charge: string;
  department: string;
  officeName?: string;
  avatar?: string;
  processCodes?: ProcessLevel0[];
}

export type ProcessLevel0 = 
  | 'PE.01' // Planeamiento Institucional
  | 'PE.02' // Gestión de la Calidad
  | 'PE.03' // Gestión de Riesgos Institucionales
  | 'PE.04' // Gestión Interinstitucional
  | 'PM.01' // Formación Integral de Pregrado y Postgrado
  | 'PM.02' // Investigación, Desarrollo, Innovación y Emprendimiento
  | 'PM.03' // Responsabilidad Social Universitaria
  | 'PS.01' // Gestión de Potencial Humano
  | 'PS.02' // Gestión de Centros de Información
  | 'PS.03' // Gestión de Infraestructura y Patrimonio
  | 'PS.04' // Gestión de las Tecnologías de Información
  | 'PS.05' // Gestión Administrativa y Financiera
  | 'PS.06'; // Gestión Legal

export type ProcessCategory = 'Estratégico' | 'Misional' | 'Soporte';

export type DocumentType = 
  | 'Manual'
  | 'Procedimiento'
  | 'Directiva / Política'
  | 'Reglamento'
  | 'Registro / Formato'
  | 'Plan'
  | 'Instructivo';

export type DocumentStatus = 'vigente' | 'revision' | 'borrador' | 'obsoleto';

export interface DocumentChangeLog {
  id: string;
  version: string;
  date: string;
  author: string;
  reason: string;
}

export interface ISODocument {
  id: string;
  code: string;
  title: string;
  documentType: DocumentType;
  processCode: ProcessLevel0;
  processName: string;
  category: ProcessCategory;
  version: string;
  status: DocumentStatus;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  approvedBy?: string;
  approvalResolution?: string;
  updatedAt: string;
  isoClause: string;
  description: string;
  storageLocation: string;
  retentionYears: string;
  finalDisposition: string;
  changeLog: DocumentChangeLog[];
}

export type NonConformitySeverity = 'mayor' | 'menor' | 'observacion';
export type NonConformityStatus = 'abierta' | 'analisis_causa' | 'plan_aprobado' | 'en_implementacion' | 'cerrada';

export interface CorrectiveAction {
  id: string;
  description: string;
  responsible: string;
  deadline: string;
  status: 'pendiente' | 'en_progreso' | 'completada';
  evidenceNotes?: string;
  completedAt?: string;
}

export interface WhyAnalysis {
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  rootCause: string;
}

export interface NonConformity {
  id: string;
  code: string;
  title: string;
  description: string;
  source: string;
  severity: NonConformitySeverity;
  processCode: ProcessLevel0;
  isoClause: string;
  department: string;
  detectedDate: string;
  deadline: string;
  status: NonConformityStatus;
  assignedTo: string;
  createdBy: string;
  whyAnalysis?: WhyAnalysis;
  actions: CorrectiveAction[];
  verificationDate?: string;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface IndicatorMeasurement {
  id: string;
  indicatorCode: string;
  period: string; // ej: "2026-I", "2026-II", "2026-Anual"
  date: string;
  reportedBy: string;
  reportedCharge?: string;
  numeratorValue?: number;
  numeratorLabel?: string;
  denominatorValue?: number;
  denominatorLabel?: string;
  calculatedValue: number;
  unit: string;
  evidenceName: string; // ej: "Plan_de_Trabajo_Anual_2026_OPLA.pdf"
  evidenceType: 'file' | 'sharepoint' | 'dms';
  evidenceUrl?: string;
  evidenceNotes?: string;
  status: 'validado_conforme' | 'pendiente_validacion' | 'observado';
  validationComment?: string;
  validatedBy?: string;
  validatedAt?: string;
}

export interface EvaluationYear {
  year: number;
  status: 'abierto' | 'cerrado';
  closedAt?: string;
  closedBy?: string;
  openedAt?: string;
  openedBy?: string;
}

export interface UPTIndicator {
  code: string;
  name: string;
  processCode: ProcessLevel0;
  processName: string;
  objective: string;
  calculationMethod: string;
  expectedTrend: 'Ascendente' | 'Descendente' | 'Específico';
  unit: string;
  frequency: string;
  target: string;
  currentValue: number;
  dataSource: string;
  responsible: string;
  formulaType?: 'percentage_ratio' | 'average_score' | 'count';
  numeratorLabel?: string;
  denominatorLabel?: string;
  currentEvidenceName?: string;
  currentEvidenceUrl?: string;
  validationStatus?: 'validado_conforme' | 'pendiente_validacion' | 'observado';
  lastEvaluationDate?: string;
  measurements?: IndicatorMeasurement[];
}

export interface AuditProcessSession {
  id: string;
  year: number;
  processCode: ProcessLevel0;
  processName: string;
  office: string;
  responsible: string;
  auditor: string;
  date: string;
  schedule: string;
  clauses: string[];
  status: 'programada' | 'en_curso' | 'completada';
  notes?: string;
}

export interface AuditChecklistItem {
  id: string;
  year?: number;
  clause: string;
  clauseTitle: string;
  requirement: string;
  evidenceQuestion: string;
  processCode: ProcessLevel0;
  status: 'conforme' | 'no_conforme' | 'observacion' | 'no_evaluado';
  notes?: string;
  findingReference?: string;
  findingReferences?: string[];
  office?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'documento' | 'no_conformidad' | 'auditoria' | 'indicador' | 'sistema';
  entityId: string;
  details: string;
}
