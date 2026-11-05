import { ProcessLevel0, UserRole } from '../types';

export type OrganGroupKey = 'RECTORADO' | 'VRAC' | 'VRIN' | 'FACULTADES';

export interface OrganizationUnit {
  id: string;
  organGroup: OrganGroupKey;
  organName: string;
  officeId: string;
  officeName: string;
  areaName?: string;
  displayName: string;
  level: 'organo' | 'oficina' | 'area' | 'facultad';
  defaultRole: UserRole;
  defaultCharge: string;
  ownProcedures: string[];
  consolidatedProcedures: string[];
  processCodes: ProcessLevel0[];
}

export const ORGAN_GROUPS: { key: OrganGroupKey; label: string; description: string }[] = [
  {
    key: 'RECTORADO',
    label: 'Rectorado y Oficinas Adscritas',
    description: 'Despacho Rectoral, OPLA, SEGE, AJUL, DIGA (y sus 6 Áreas), TEIN, RENI, GECA e IMAI',
  },
  {
    key: 'VRAC',
    label: 'Vicerrectorado Académico (VRAC)',
    description: 'Despacho VRAC, GPAD, Admisión y Marketing (ADMA), Bienestar (OBUN) y RSU (RESU)',
  },
  {
    key: 'VRIN',
    label: 'Vicerrectorado de Investigación (VRIN)',
    description: 'Despacho VRIN, Investigación y Transferencia (PITT) y Biblioteca (BISA)',
  },
  {
    key: 'FACULTADES',
    label: 'Facultades (FAING, FACSA, FACEM, FAEDCOH, FAU, FADE)',
    description: 'Las 6 Facultades y Escuelas Profesionales de la Universidad Privada de Tacna',
  },
];

// Los 11 procedimientos misionales compartidos por cada una de las 6 Facultades
export const FACULTY_PROCEDURE_CODES: string[] = [
  'PM.01.01.02', // Nivelación de Estudiantes Ingresantes
  'PM.01.02.01', // Diseño, Rediseño, Actualización y Adecuación Curricular
  'PM.01.02.02', // Elaboración del Sílabo
  'PM.01.03.01', // Planificación de la Enseñanza Aprendizaje
  'PM.01.03.02', // Matrícula
  'PM.01.03.03', // Desarrollo de la Enseñanza Aprendizaje
  'PM.01.03.04', // Evaluación de Aprendizaje
  'PM.01.03.05', // Desarrollo de Prácticas Preprofesionales
  'PM.01.07.01', // Contratación e Inducción de Personal Docente
  'PM.01.07.02', // Capacitación Docente
  'PM.01.07.03', // Evaluación Docente
];

function extractProcessCodes(procCodes: string[]): ProcessLevel0[] {
  const set = new Set<ProcessLevel0>();
  for (const code of procCodes) {
    const parts = code.split('.');
    if (parts.length >= 2) {
      set.add(`${parts[0]}.${parts[1]}` as ProcessLevel0);
    }
  }
  return Array.from(set);
}

function uniqueStrings(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

// Procedimientos por oficina/área según el Excel oficial validado
const RECTORADO_OWN = ['PE.01.01.01', 'PE.01.01.02'];
const OPLA_OWN = ['PE.01.02.01', 'PE.01.02.02', 'PE.01.02.03', 'PE.01.02.04', 'PE.01.02.05'];
const SEGE_OWN = ['PM.01.04.01'];
const AJUL_OWN = ['PS.06.01.01', 'PS.06.02.01', 'PE.02.01.04'];

const DIGA_OWN = ['PE.01.01.01', 'PE.01.01.02'];
const AIMA_OWN = [
  'PE.03.02.01',
  'PM.03.03.01',
  'PS.03.03.01',
  'PS.03.03.02',
  'PS.05.04.01',
  'PS.05.04.02',
  'PS.05.04.03',
];
const ALOG_OWN = [
  'PS.03.01.01',
  'PS.03.01.02',
  'PS.03.01.03',
  'PS.03.01.04',
  'PS.05.03.01',
  'PS.05.03.02',
];
const PATRIMONIO_OWN = ['PS.03.02.01'];
const APHU_OWN = ['PE.03.02.02', 'PS.01.01.01', 'PS.01.01.02', 'PS.01.02.01'];
const TESORERIA_OWN = ['PS.05.01.01', 'PS.05.01.02', 'PS.05.01.03'];
const CONTABILIDAD_OWN = ['PS.05.02.01', 'PS.05.02.02'];

const DIGA_CONSOLIDATED = uniqueStrings([
  ...DIGA_OWN,
  ...AIMA_OWN,
  ...ALOG_OWN,
  ...PATRIMONIO_OWN,
  ...APHU_OWN,
  ...TESORERIA_OWN,
  ...CONTABILIDAD_OWN,
]);

const TEIN_OWN = [
  'PE.03.02.03',
  'PS.04.01.01',
  'PS.04.02.01',
  'PS.04.02.02',
  'PS.04.02.03',
  'PS.04.02.04',
  'PS.04.03.01',
  'PS.04.03.02',
];
const RENI_OWN = ['PE.04.01.01', 'PM.01.05.01'];
const GECA_OWN = [
  'PE.01.04.01',
  'PE.01.04.02',
  'PE.01.04.03',
  'PE.02.01.01',
  'PE.02.01.02',
  'PE.02.01.03',
  'PE.02.02.01',
  'PE.02.03.01',
  'PE.02.04.01',
  'PE.02.04.02',
  'PE.03.01.01',
];
const IMAI_OWN = ['PE.04.02.01'];

const RECTORADO_CONSOLIDATED = uniqueStrings([
  ...RECTORADO_OWN,
  ...OPLA_OWN,
  ...SEGE_OWN,
  ...AJUL_OWN,
  ...DIGA_CONSOLIDATED,
  ...TEIN_OWN,
  ...RENI_OWN,
  ...GECA_OWN,
  ...IMAI_OWN,
]);

const VRAC_OWN = ['PE.01.01.01', 'PE.01.01.02'];
const GPAD_OWN = ['PE.01.03.01'];
const ADMA_OWN = ['PM.01.01.01'];
const OBUN_OWN = [
  'PM.01.06.01',
  'PM.01.06.02',
  'PM.01.06.03',
  'PM.01.06.04',
  'PM.01.06.05',
  'PM.01.06.06',
  'PM.01.06.07',
  'PM.01.06.08',
  'PM.01.06.09',
  'PM.01.06.10',
];
const RESU_OWN = ['PM.01.04.02', 'PM.03.01.01', 'PM.03.01.02', 'PM.03.02.01'];

const VRAC_CONSOLIDATED = uniqueStrings([
  ...VRAC_OWN,
  ...GPAD_OWN,
  ...ADMA_OWN,
  ...OBUN_OWN,
  ...RESU_OWN,
  ...FACULTY_PROCEDURE_CODES,
]);

const PITT_OWN = [
  'PM.02.01.01',
  'PM.02.01.02',
  'PM.02.01.03',
  'PM.02.01.04',
  'PM.02.01.05',
  'PM.02.02.01',
];
const BISA_OWN = [
  'PS.02.01.01',
  'PS.02.01.02',
  'PS.02.01.03',
  'PS.02.01.04',
  'PS.02.02.01',
];
const VRIN_CONSOLIDATED = uniqueStrings([...PITT_OWN, ...BISA_OWN]);

function createUnit(
  unit: Omit<OrganizationUnit, 'processCodes'>
): OrganizationUnit {
  return {
    ...unit,
    processCodes: extractProcessCodes(unit.consolidatedProcedures),
  };
}

export const ORGANIZATION_UNITS: OrganizationUnit[] = [
  // ==========================================
  // 1. RECTORADO Y DEPENDENCIAS ADSCRITAS
  // ==========================================
  createUnit({
    id: 'rectorado',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'rectorado',
    officeName: 'Rectorado (Despacho Rectoral)',
    displayName: 'RECTORADO (Acceso Consolidado a sus Oficinas)',
    level: 'organo',
    defaultRole: 'rectorado',
    defaultCharge: 'Rector / Funcionario de Rectorado',
    ownProcedures: RECTORADO_OWN,
    consolidatedProcedures: RECTORADO_CONSOLIDATED,
  }),
  createUnit({
    id: 'opla',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'opla',
    officeName: 'Oficina de Planeamiento y Desarrollo (OPLA)',
    displayName: 'Oficina de Planeamiento y Desarrollo (OPLA)',
    level: 'oficina',
    defaultRole: 'opla',
    defaultCharge: 'Jefe / Especialista de Planeamiento y Desarrollo (OPLA)',
    ownProcedures: OPLA_OWN,
    consolidatedProcedures: OPLA_OWN,
  }),
  createUnit({
    id: 'sege',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'sege',
    officeName: 'Oficina de Secretaría General (SEGE)',
    displayName: 'Oficina de Secretaría General (SEGE)',
    level: 'oficina',
    defaultRole: 'colaborador',
    defaultCharge: 'Secretario General / Especialista de Grados y Títulos (SEGE)',
    ownProcedures: SEGE_OWN,
    consolidatedProcedures: SEGE_OWN,
  }),
  createUnit({
    id: 'ajul',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'ajul',
    officeName: 'Oficina de Asesoría Jurídica y Legal (AJUL)',
    displayName: 'Oficina de Asesoría Jurídica y Legal (AJUL)',
    level: 'oficina',
    defaultRole: 'colaborador',
    defaultCharge: 'Jefe / Asesor Jurídico y Legal (AJUL)',
    ownProcedures: AJUL_OWN,
    consolidatedProcedures: AJUL_OWN,
  }),
  // --- DIGA Y SUS 6 ÁREAS ---
  createUnit({
    id: 'diga',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'diga',
    officeName: 'Dirección General de Administración (DIGA)',
    displayName: 'Dirección General de Administración - DIGA (Jefatura / Todas sus Áreas)',
    level: 'oficina',
    defaultRole: 'diga',
    defaultCharge: 'Director General de Administración (DIGA)',
    ownProcedures: DIGA_OWN,
    consolidatedProcedures: DIGA_CONSOLIDATED,
  }),
  createUnit({
    id: 'diga-aima',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'diga',
    officeName: 'Dirección General de Administración (DIGA)',
    areaName: 'Área de Infraestructura y Mantenimiento (AIMA)',
    displayName: 'DIGA • Área de Infraestructura y Mantenimiento (AIMA)',
    level: 'area',
    defaultRole: 'colaborador',
    defaultCharge: 'Jefe / Especialista de Infraestructura y Mantenimiento (AIMA)',
    ownProcedures: AIMA_OWN,
    consolidatedProcedures: AIMA_OWN,
  }),
  createUnit({
    id: 'diga-alog',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'diga',
    officeName: 'Dirección General de Administración (DIGA)',
    areaName: 'Área de Logística (ALOG)',
    displayName: 'DIGA • Área de Logística (ALOG)',
    level: 'area',
    defaultRole: 'colaborador',
    defaultCharge: 'Jefe / Especialista del Área de Logística (ALOG)',
    ownProcedures: ALOG_OWN,
    consolidatedProcedures: ALOG_OWN,
  }),
  createUnit({
    id: 'diga-patrimonio',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'diga',
    officeName: 'Dirección General de Administración (DIGA)',
    areaName: 'Área de Patrimonio',
    displayName: 'DIGA • Área de Patrimonio',
    level: 'area',
    defaultRole: 'colaborador',
    defaultCharge: 'Jefe / Especialista del Área de Patrimonio',
    ownProcedures: PATRIMONIO_OWN,
    consolidatedProcedures: PATRIMONIO_OWN,
  }),
  createUnit({
    id: 'diga-aphu',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'diga',
    officeName: 'Dirección General de Administración (DIGA)',
    areaName: 'Área del Potencial Humano (APHU)',
    displayName: 'DIGA • Área del Potencial Humano (APHU)',
    level: 'area',
    defaultRole: 'aphu',
    defaultCharge: 'Jefe / Especialista del Área del Potencial Humano (APHU)',
    ownProcedures: APHU_OWN,
    consolidatedProcedures: APHU_OWN,
  }),
  createUnit({
    id: 'diga-tesoreria',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'diga',
    officeName: 'Dirección General de Administración (DIGA)',
    areaName: 'Área de Tesorería',
    displayName: 'DIGA • Área de Tesorería',
    level: 'area',
    defaultRole: 'colaborador',
    defaultCharge: 'Jefe / Especialista del Área de Tesorería',
    ownProcedures: TESORERIA_OWN,
    consolidatedProcedures: TESORERIA_OWN,
  }),
  createUnit({
    id: 'diga-contabilidad',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'diga',
    officeName: 'Dirección General de Administración (DIGA)',
    areaName: 'Área de Contabilidad',
    displayName: 'DIGA • Área de Contabilidad',
    level: 'area',
    defaultRole: 'colaborador',
    defaultCharge: 'Jefe / Especialista del Área de Contabilidad',
    ownProcedures: CONTABILIDAD_OWN,
    consolidatedProcedures: CONTABILIDAD_OWN,
  }),
  // --- RESTO DE OFICINAS DE RECTORADO ---
  createUnit({
    id: 'tein',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'tein',
    officeName: 'Oficina de Tecnología de Información (TEIN)',
    displayName: 'Oficina de Tecnología de Información (TEIN)',
    level: 'oficina',
    defaultRole: 'tein',
    defaultCharge: 'Jefe / Especialista de Tecnología de Información (TEIN)',
    ownProcedures: TEIN_OWN,
    consolidatedProcedures: TEIN_OWN,
  }),
  createUnit({
    id: 'reni',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'reni',
    officeName: 'Oficina de Relaciones Nacionales e Internacionales (RENI)',
    displayName: 'Oficina de Relaciones Nacionales e Internacionales (RENI)',
    level: 'oficina',
    defaultRole: 'reni',
    defaultCharge: 'Jefe / Especialista de Relaciones Nacionales e Internacionales (RENI)',
    ownProcedures: RENI_OWN,
    consolidatedProcedures: RENI_OWN,
  }),
  createUnit({
    id: 'geca-office',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'geca-office',
    officeName: 'Oficina de Gestión de la Calidad (GECA)',
    displayName: 'Oficina de Gestión de la Calidad (GECA)',
    level: 'oficina',
    defaultRole: 'auditor',
    defaultCharge: 'Especialista / Coordinador de la Oficina de Gestión de la Calidad (GECA)',
    ownProcedures: GECA_OWN,
    consolidatedProcedures: GECA_OWN,
  }),
  createUnit({
    id: 'imai',
    organGroup: 'RECTORADO',
    organName: 'Rectorado',
    officeId: 'imai',
    officeName: 'Oficina de Imagen Institucional (IMAI)',
    displayName: 'Oficina de Imagen Institucional (IMAI)',
    level: 'oficina',
    defaultRole: 'colaborador',
    defaultCharge: 'Jefe / Especialista de Imagen Institucional (IMAI)',
    ownProcedures: IMAI_OWN,
    consolidatedProcedures: IMAI_OWN,
  }),

  // ==========================================
  // 2. VICERRECTORADO ACADÉMICO (VRAC)
  // ==========================================
  createUnit({
    id: 'vrac',
    organGroup: 'VRAC',
    organName: 'Vicerrectorado Académico',
    officeId: 'vrac',
    officeName: 'Vicerrectorado Académico (VRAC)',
    displayName: 'Vicerrectorado Académico - VRAC (Acceso Consolidado a sus Oficinas)',
    level: 'organo',
    defaultRole: 'vrac',
    defaultCharge: 'Vicerrector Académico / Funcionario VRAC',
    ownProcedures: VRAC_OWN,
    consolidatedProcedures: VRAC_CONSOLIDATED,
  }),
  createUnit({
    id: 'gpad',
    organGroup: 'VRAC',
    organName: 'Vicerrectorado Académico',
    officeId: 'gpad',
    officeName: 'Gestión de Procesos Académicos y Docencia (GPAD)',
    displayName: 'Gestión de Procesos Académicos y Docencia (GPAD)',
    level: 'oficina',
    defaultRole: 'colaborador',
    defaultCharge: 'Jefe / Especialista de Gestión de Procesos Académicos y Docencia (GPAD)',
    ownProcedures: GPAD_OWN,
    consolidatedProcedures: GPAD_OWN,
  }),
  createUnit({
    id: 'adma',
    organGroup: 'VRAC',
    organName: 'Vicerrectorado Académico',
    officeId: 'adma',
    officeName: 'Oficina de Admisión y Marketing (ADMA)',
    displayName: 'Oficina de Admisión y Marketing (ADMA)',
    level: 'oficina',
    defaultRole: 'adma',
    defaultCharge: 'Jefe / Especialista de Admisión y Marketing (ADMA)',
    ownProcedures: ADMA_OWN,
    consolidatedProcedures: ADMA_OWN,
  }),
  createUnit({
    id: 'obun',
    organGroup: 'VRAC',
    organName: 'Vicerrectorado Académico',
    officeId: 'obun',
    officeName: 'Oficina de Bienestar Universitario (OBUN)',
    displayName: 'Oficina de Bienestar Universitario (OBUN)',
    level: 'oficina',
    defaultRole: 'obun',
    defaultCharge: 'Jefe / Especialista de Bienestar Universitario (OBUN)',
    ownProcedures: OBUN_OWN,
    consolidatedProcedures: OBUN_OWN,
  }),
  createUnit({
    id: 'resu',
    organGroup: 'VRAC',
    organName: 'Vicerrectorado Académico',
    officeId: 'resu',
    officeName: 'Oficina de Responsabilidad Social Universitaria (RESU)',
    displayName: 'Oficina de Responsabilidad Social Universitaria (RESU)',
    level: 'oficina',
    defaultRole: 'resu',
    defaultCharge: 'Jefe / Especialista de Responsabilidad Social Universitaria (RESU)',
    ownProcedures: RESU_OWN,
    consolidatedProcedures: RESU_OWN,
  }),

  // ==========================================
  // 3. VICERRECTORADO DE INVESTIGACIÓN (VRIN)
  // ==========================================
  createUnit({
    id: 'vrin',
    organGroup: 'VRIN',
    organName: 'Vicerrectorado de Investigación',
    officeId: 'vrin',
    officeName: 'Vicerrectorado de Investigación (VRIN)',
    displayName: 'Vicerrectorado de Investigación - VRIN (Acceso Consolidado PITT y BISA)',
    level: 'organo',
    defaultRole: 'vrin',
    defaultCharge: 'Vicerrector de Investigación / Funcionario VRIN',
    ownProcedures: VRIN_CONSOLIDATED,
    consolidatedProcedures: VRIN_CONSOLIDATED,
  }),
  createUnit({
    id: 'pitt',
    organGroup: 'VRIN',
    organName: 'Vicerrectorado de Investigación',
    officeId: 'pitt',
    officeName: 'Oficina de Procesos de Investigación y Transferencia Tecnológica (PITT)',
    displayName: 'Oficina de Procesos de Investigación y Transferencia Tecnológica (PITT)',
    level: 'oficina',
    defaultRole: 'vrin',
    defaultCharge: 'Jefe / Especialista de Investigación y Transferencia Tecnológica (PITT)',
    ownProcedures: PITT_OWN,
    consolidatedProcedures: PITT_OWN,
  }),
  createUnit({
    id: 'bisa',
    organGroup: 'VRIN',
    organName: 'Vicerrectorado de Investigación',
    officeId: 'bisa',
    officeName: 'Oficina de Biblioteca y Servicios Académicos (BISA)',
    displayName: 'Oficina de Biblioteca y Servicios Académicos (BISA)',
    level: 'oficina',
    defaultRole: 'bisa',
    defaultCharge: 'Jefe / Especialista de Biblioteca y Servicios Académicos (BISA)',
    ownProcedures: BISA_OWN,
    consolidatedProcedures: BISA_OWN,
  }),

  // ==========================================
  // 4. LAS 6 FACULTADES UPT
  // ==========================================
  createUnit({
    id: 'faing',
    organGroup: 'FACULTADES',
    organName: 'Facultades',
    officeId: 'faing',
    officeName: 'Facultad de Ingeniería (FAING)',
    displayName: 'Facultad de Ingeniería (FAING)',
    level: 'facultad',
    defaultRole: 'director_escuela',
    defaultCharge: 'Decano / Director de Escuela / Docente (FAING)',
    ownProcedures: FACULTY_PROCEDURE_CODES,
    consolidatedProcedures: FACULTY_PROCEDURE_CODES,
  }),
  createUnit({
    id: 'facsa',
    organGroup: 'FACULTADES',
    organName: 'Facultades',
    officeId: 'facsa',
    officeName: 'Facultad de Ciencias de la Salud (FACSA)',
    displayName: 'Facultad de Ciencias de la Salud (FACSA)',
    level: 'facultad',
    defaultRole: 'director_escuela',
    defaultCharge: 'Decano / Director de Escuela / Docente (FACSA)',
    ownProcedures: FACULTY_PROCEDURE_CODES,
    consolidatedProcedures: FACULTY_PROCEDURE_CODES,
  }),
  createUnit({
    id: 'facem',
    organGroup: 'FACULTADES',
    organName: 'Facultades',
    officeId: 'facem',
    officeName: 'Facultad de Ciencias Empresariales (FACEM)',
    displayName: 'Facultad de Ciencias Empresariales (FACEM)',
    level: 'facultad',
    defaultRole: 'director_escuela',
    defaultCharge: 'Decano / Director de Escuela / Docente (FACEM)',
    ownProcedures: FACULTY_PROCEDURE_CODES,
    consolidatedProcedures: FACULTY_PROCEDURE_CODES,
  }),
  createUnit({
    id: 'faedcoh',
    organGroup: 'FACULTADES',
    organName: 'Facultades',
    officeId: 'faedcoh',
    officeName: 'Facultad de Educación, Ciencias de la Comunicación y Humanidades (FAEDCOH)',
    displayName: 'Facultad de Educación, Ciencias de la Comunicación y Humanidades (FAEDCOH)',
    level: 'facultad',
    defaultRole: 'director_escuela',
    defaultCharge: 'Decano / Director de Escuela / Docente (FAEDCOH)',
    ownProcedures: FACULTY_PROCEDURE_CODES,
    consolidatedProcedures: FACULTY_PROCEDURE_CODES,
  }),
  createUnit({
    id: 'fau',
    organGroup: 'FACULTADES',
    organName: 'Facultades',
    officeId: 'fau',
    officeName: 'Facultad de Arquitectura y Urbanismo (FAU)',
    displayName: 'Facultad de Arquitectura y Urbanismo (FAU)',
    level: 'facultad',
    defaultRole: 'director_escuela',
    defaultCharge: 'Decano / Director de Escuela / Docente (FAU)',
    ownProcedures: FACULTY_PROCEDURE_CODES,
    consolidatedProcedures: FACULTY_PROCEDURE_CODES,
  }),
  createUnit({
    id: 'fade',
    organGroup: 'FACULTADES',
    organName: 'Facultades',
    officeId: 'fade',
    officeName: 'Facultad de Derecho y Ciencias Políticas (FADE)',
    displayName: 'Facultad de Derecho y Ciencias Políticas (FADE)',
    level: 'facultad',
    defaultRole: 'director_escuela',
    defaultCharge: 'Decano / Director de Escuela / Docente (FADE)',
    ownProcedures: FACULTY_PROCEDURE_CODES,
    consolidatedProcedures: FACULTY_PROCEDURE_CODES,
  }),
];

export function getOrganizationUnitById(unitId?: string): OrganizationUnit | undefined {
  if (!unitId) return undefined;
  return ORGANIZATION_UNITS.find((u) => u.id === unitId);
}

export function resolveUserOrganizationUnit(user: {
  unitId?: string;
  officeName?: string;
  department?: string;
  role?: string;
}): OrganizationUnit | undefined {
  if (user.unitId) {
    const byId = getOrganizationUnitById(user.unitId);
    if (byId) return byId;
  }
  const text = `${user.officeName || ''} ${user.department || ''}`.toLowerCase();
  if (text.includes('aima') || text.includes('infraestructura y mantenimiento')) return getOrganizationUnitById('diga-aima');
  if (text.includes('alog') || text.includes('logística') || text.includes('logistica')) return getOrganizationUnitById('diga-alog');
  if (text.includes('patrimonio')) return getOrganizationUnitById('diga-patrimonio');
  if (text.includes('aphu') || text.includes('potencial humano')) return getOrganizationUnitById('diga-aphu');
  if (text.includes('tesorería') || text.includes('tesoreria')) return getOrganizationUnitById('diga-tesoreria');
  if (text.includes('contabilidad')) return getOrganizationUnitById('diga-contabilidad');
  if (text.includes('diga') || text.includes('dirección general de administración')) return getOrganizationUnitById('diga');
  if (text.includes('opla') || text.includes('planeamiento') || text.includes('planificación')) return getOrganizationUnitById('opla');
  if (text.includes('sege') || text.includes('secretaría general')) return getOrganizationUnitById('sege');
  if (text.includes('ajul') || text.includes('asesoría jurídica') || text.includes('legal')) return getOrganizationUnitById('ajul');
  if (text.includes('tein') || text.includes('tecnología de información') || text.includes('tecnologías de información')) return getOrganizationUnitById('tein');
  if (text.includes('reni') || text.includes('relaciones nacionales')) return getOrganizationUnitById('reni');
  if (text.includes('imai') || text.includes('imagen institucional')) return getOrganizationUnitById('imai');
  if (text.includes('gpad') || text.includes('procesos académicos')) return getOrganizationUnitById('gpad');
  if (text.includes('adma') || text.includes('admisión')) return getOrganizationUnitById('adma');
  if (text.includes('obun') || text.includes('bienestar')) return getOrganizationUnitById('obun');
  if (text.includes('resu') || text.includes('responsabilidad social')) return getOrganizationUnitById('resu');
  if (text.includes('pitt') || text.includes('transferencia tecnológica')) return getOrganizationUnitById('pitt');
  if (text.includes('bisa') || text.includes('biblioteca')) return getOrganizationUnitById('bisa');
  if (text.includes('faing') || text.includes('ingeniería')) return getOrganizationUnitById('faing');
  if (text.includes('facsa') || text.includes('salud')) return getOrganizationUnitById('facsa');
  if (text.includes('facem') || text.includes('empresariales')) return getOrganizationUnitById('facem');
  if (text.includes('faedcoh') || text.includes('educación')) return getOrganizationUnitById('faedcoh');
  if (text.includes('fau') || text.includes('arquitectura')) return getOrganizationUnitById('fau');
  if (text.includes('fade') || text.includes('derecho')) return getOrganizationUnitById('fade');
  if (text.includes('vicerrectorado académico') || text.includes('vrac') || user.role === 'vrac') return getOrganizationUnitById('vrac');
  if (text.includes('vicerrectorado de investigación') || text.includes('vrin') || user.role === 'vrin') return getOrganizationUnitById('vrin');
  if (text.includes('rectorado') || user.role === 'rectorado') return getOrganizationUnitById('rectorado');
  if (text.includes('geca') || text.includes('gestión de la calidad')) return getOrganizationUnitById('geca-office');
  return undefined;
}
