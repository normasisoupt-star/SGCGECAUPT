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
  if (unitId === 'geca') {
    return ORGANIZATION_UNITS.find((u) => u.id === 'geca-office');
  }
  return ORGANIZATION_UNITS.find((u) => u.id === unitId);
}

export function resolveUserSecondaryUnit(user?: {
  secondaryUnitId?: string;
}): OrganizationUnit | undefined {
  if (!user?.secondaryUnitId) return undefined;
  return getOrganizationUnitById(user.secondaryUnitId);
}

export function getCombinedUserProceduresAndProcesses(
  primaryUnit?: OrganizationUnit,
  secondaryUnit?: OrganizationUnit,
  fallbackProcedures: string[] = [],
  fallbackProcesses: ProcessLevel0[] = []
): { procedureCodes: string[]; processCodes: ProcessLevel0[] } {
  const procSet = new Set<string>();
  const processSet = new Set<ProcessLevel0>();

  if (primaryUnit) {
    primaryUnit.consolidatedProcedures.forEach((c) => procSet.add(c));
    primaryUnit.processCodes.forEach((p) => processSet.add(p));
  } else {
    fallbackProcedures.forEach((c) => procSet.add(c));
    fallbackProcesses.forEach((p) => processSet.add(p));
  }

  if (secondaryUnit && secondaryUnit.id !== primaryUnit?.id) {
    secondaryUnit.consolidatedProcedures.forEach((c) => procSet.add(c));
    secondaryUnit.processCodes.forEach((p) => processSet.add(p));
  }

  return {
    procedureCodes: Array.from(procSet),
    processCodes: Array.from(processSet),
  };
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

export interface SubordinateUnitBreakdown {
  id: string;
  label: string;
  shortLabel: string;
  procedureCodes: string[];
  isDirect?: boolean;
  kind: 'direct' | 'office' | 'area' | 'faculty';
}

export function getSubordinateUnitsForParent(parentUnitId?: string): SubordinateUnitBreakdown[] {
  if (!parentUnitId) return [];

  if (parentUnitId === 'vrac') {
    return [
      {
        id: 'vrac-direct',
        label: 'Vicerrectorado Académico (Directos Despacho VRAC)',
        shortLabel: 'Directos VRAC',
        procedureCodes: VRAC_OWN,
        isDirect: true,
        kind: 'direct',
      },
      {
        id: 'gpad',
        label: 'Gestión de Procesos Académicos y Docencia (GPAD)',
        shortLabel: 'GPAD (Procesos Académicos)',
        procedureCodes: GPAD_OWN,
        kind: 'office',
      },
      {
        id: 'adma',
        label: 'Oficina de Admisión y Marketing (ADMA)',
        shortLabel: 'Admisión y Marketing (ADMA)',
        procedureCodes: ADMA_OWN,
        kind: 'office',
      },
      {
        id: 'obun',
        label: 'Oficina de Bienestar Universitario (OBUN)',
        shortLabel: 'Bienestar Universitario (OBUN)',
        procedureCodes: OBUN_OWN,
        kind: 'office',
      },
      {
        id: 'resu',
        label: 'Oficina de Responsabilidad Social Universitaria (RESU)',
        shortLabel: 'Responsabilidad Social (RESU)',
        procedureCodes: RESU_OWN,
        kind: 'office',
      },
      {
        id: 'facultades-group',
        label: 'Facultades UPT (FAING, FACSA, FACEM, FAEDCOH, FAU, FADE)',
        shortLabel: 'Facultades UPT (6)',
        procedureCodes: FACULTY_PROCEDURE_CODES,
        kind: 'faculty',
      },
    ];
  }

  if (parentUnitId === 'vrin') {
    return [
      {
        id: 'pitt',
        label: 'Oficina de Procesos de Investigación y Transferencia Tecnológica (PITT)',
        shortLabel: 'Investigación y Transferencia (PITT)',
        procedureCodes: PITT_OWN,
        kind: 'office',
      },
      {
        id: 'bisa',
        label: 'Oficina de Biblioteca y Servicios Académicos (BISA)',
        shortLabel: 'Biblioteca y Servicios Académicos (BISA)',
        procedureCodes: BISA_OWN,
        kind: 'office',
      },
    ];
  }

  if (parentUnitId === 'diga') {
    return [
      {
        id: 'diga-direct',
        label: 'Dirección General de Administración (Directos Despacho DIGA)',
        shortLabel: 'Directos DIGA',
        procedureCodes: DIGA_OWN,
        isDirect: true,
        kind: 'direct',
      },
      {
        id: 'diga-aima',
        label: 'Área de Infraestructura y Mantenimiento (AIMA)',
        shortLabel: 'Área Infraestructura (AIMA)',
        procedureCodes: AIMA_OWN,
        kind: 'area',
      },
      {
        id: 'diga-alog',
        label: 'Área de Logística (ALOG)',
        shortLabel: 'Área Logística (ALOG)',
        procedureCodes: ALOG_OWN,
        kind: 'area',
      },
      {
        id: 'diga-patrimonio',
        label: 'Área de Patrimonio',
        shortLabel: 'Área Patrimonio',
        procedureCodes: PATRIMONIO_OWN,
        kind: 'area',
      },
      {
        id: 'diga-aphu',
        label: 'Área del Potencial Humano (APHU)',
        shortLabel: 'Área Potencial Humano (APHU)',
        procedureCodes: APHU_OWN,
        kind: 'area',
      },
      {
        id: 'diga-tesoreria',
        label: 'Área de Tesorería',
        shortLabel: 'Área Tesorería',
        procedureCodes: TESORERIA_OWN,
        kind: 'area',
      },
      {
        id: 'diga-contabilidad',
        label: 'Área de Contabilidad',
        shortLabel: 'Área Contabilidad',
        procedureCodes: CONTABILIDAD_OWN,
        kind: 'area',
      },
    ];
  }

  if (parentUnitId === 'rectorado') {
    return [
      {
        id: 'rectorado-direct',
        label: 'Rectorado (Directos Despacho Rectoral)',
        shortLabel: 'Directos Rectorado',
        procedureCodes: RECTORADO_OWN,
        isDirect: true,
        kind: 'direct',
      },
      {
        id: 'opla',
        label: 'Oficina de Planeamiento y Desarrollo (OPLA)',
        shortLabel: 'Planeamiento (OPLA)',
        procedureCodes: OPLA_OWN,
        kind: 'office',
      },
      {
        id: 'sege',
        label: 'Oficina de Secretaría General (SEGE)',
        shortLabel: 'Secretaría General (SEGE)',
        procedureCodes: SEGE_OWN,
        kind: 'office',
      },
      {
        id: 'ajul',
        label: 'Oficina de Asesoría Jurídica y Legal (AJUL)',
        shortLabel: 'Asesoría Legal (AJUL)',
        procedureCodes: AJUL_OWN,
        kind: 'office',
      },
      {
        id: 'diga-all',
        label: 'Dirección General de Administración (DIGA y sus 6 Áreas)',
        shortLabel: 'DIGA y sus 6 Áreas',
        procedureCodes: DIGA_CONSOLIDATED,
        kind: 'office',
      },
      {
        id: 'tein',
        label: 'Oficina de Tecnología de Información (TEIN)',
        shortLabel: 'Tecnología TI (TEIN)',
        procedureCodes: TEIN_OWN,
        kind: 'office',
      },
      {
        id: 'reni',
        label: 'Oficina de Relaciones Nacionales e Internacionales (RENI)',
        shortLabel: 'Relaciones Interinst. (RENI)',
        procedureCodes: RENI_OWN,
        kind: 'office',
      },
      {
        id: 'geca-office',
        label: 'Oficina de Gestión de la Calidad (GECA)',
        shortLabel: 'Gestión de la Calidad (GECA)',
        procedureCodes: GECA_OWN,
        kind: 'office',
      },
      {
        id: 'imai',
        label: 'Oficina de Imagen Institucional (IMAI)',
        shortLabel: 'Imagen Institucional (IMAI)',
        procedureCodes: IMAI_OWN,
        kind: 'office',
      },
    ];
  }

  return [];
}

export interface ProcedureResponsibilityBadge {
  unitId: string;
  label: string;
  prefix: string;
  isDirect: boolean;
  kind: 'direct' | 'office' | 'area' | 'faculty';
}

export function getProcedureResponsibleBadges(
  procedureCode: string,
  activeUnit?: OrganizationUnit
): ProcedureResponsibilityBadge[] {
  // Si el usuario pertenece a una dependencia matriz (VRAC, VRIN, DIGA, RECTORADO),
  // mostramos exactamente qué oficina/área bajo su mando ejecuta ese procedimiento
  if (activeUnit) {
    const subUnits = getSubordinateUnitsForParent(activeUnit.id);
    if (subUnits.length > 0) {
      const matched: ProcedureResponsibilityBadge[] = [];
      for (const sub of subUnits) {
        if (sub.procedureCodes.includes(procedureCode)) {
          // Si es Rectorado y cayó en DIGA consolidado, detallamos también el área específica de DIGA
          if (sub.id === 'diga-all') {
            const digaSubUnits = getSubordinateUnitsForParent('diga').filter((d) =>
              d.procedureCodes.includes(procedureCode)
            );
            for (const dSub of digaSubUnits) {
              if (!dSub.isDirect) {
                matched.push({
                  unitId: dSub.id,
                  label: `DIGA • ${dSub.label}`,
                  prefix: 'Área adscrita',
                  isDirect: false,
                  kind: 'area',
                });
              }
            }
          } else {
            matched.push({
              unitId: sub.id,
              label: sub.label,
              prefix: sub.isDirect
                ? 'Directo'
                : sub.kind === 'area'
                ? 'Área adscrita'
                : sub.kind === 'faculty'
                ? 'Unidades adscritas'
                : 'Oficina adscrita',
              isDirect: Boolean(sub.isDirect),
              kind: sub.kind,
            });
          }
        }
      }
      if (matched.length > 0) return matched;
    }
  }

  // Vista general (o para cualquier otra unidad): identificar la oficina/área dueña del procedimiento
  const badges: ProcedureResponsibilityBadge[] = [];
  if (RECTORADO_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'rectorado',
      label: 'Rectorado / VRAC / DIGA (Alta Dirección)',
      prefix: 'Responsable',
      isDirect: activeUnit?.id === 'rectorado' || activeUnit?.id === 'vrac' || activeUnit?.id === 'diga',
      kind: 'direct',
    });
  }
  if (OPLA_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'opla',
      label: 'Oficina de Planeamiento y Desarrollo (OPLA)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'opla',
      kind: 'office',
    });
  }
  if (SEGE_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'sege',
      label: 'Oficina de Secretaría General (SEGE)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'sege',
      kind: 'office',
    });
  }
  if (AJUL_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'ajul',
      label: 'Oficina de Asesoría Jurídica y Legal (AJUL)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'ajul',
      kind: 'office',
    });
  }
  if (AIMA_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'diga-aima',
      label: 'DIGA • Área de Infraestructura y Mantenimiento (AIMA)',
      prefix: 'Área',
      isDirect: activeUnit?.id === 'diga-aima',
      kind: 'area',
    });
  }
  if (ALOG_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'diga-alog',
      label: 'DIGA • Área de Logística (ALOG)',
      prefix: 'Área',
      isDirect: activeUnit?.id === 'diga-alog',
      kind: 'area',
    });
  }
  if (PATRIMONIO_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'diga-patrimonio',
      label: 'DIGA • Área de Patrimonio',
      prefix: 'Área',
      isDirect: activeUnit?.id === 'diga-patrimonio',
      kind: 'area',
    });
  }
  if (APHU_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'diga-aphu',
      label: 'DIGA • Área del Potencial Humano (APHU)',
      prefix: 'Área',
      isDirect: activeUnit?.id === 'diga-aphu',
      kind: 'area',
    });
  }
  if (TESORERIA_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'diga-tesoreria',
      label: 'DIGA • Área de Tesorería',
      prefix: 'Área',
      isDirect: activeUnit?.id === 'diga-tesoreria',
      kind: 'area',
    });
  }
  if (CONTABILIDAD_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'diga-contabilidad',
      label: 'DIGA • Área de Contabilidad',
      prefix: 'Área',
      isDirect: activeUnit?.id === 'diga-contabilidad',
      kind: 'area',
    });
  }
  if (TEIN_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'tein',
      label: 'Oficina de Tecnología de Información (TEIN)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'tein',
      kind: 'office',
    });
  }
  if (RENI_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'reni',
      label: 'Oficina de Relaciones Nacionales e Internacionales (RENI)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'reni',
      kind: 'office',
    });
  }
  if (GECA_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'geca-office',
      label: 'Oficina de Gestión de la Calidad (GECA)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'geca-office',
      kind: 'office',
    });
  }
  if (IMAI_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'imai',
      label: 'Oficina de Imagen Institucional (IMAI)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'imai',
      kind: 'office',
    });
  }
  if (GPAD_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'gpad',
      label: 'Gestión de Procesos Académicos y Docencia (GPAD)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'gpad',
      kind: 'office',
    });
  }
  if (ADMA_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'adma',
      label: 'Oficina de Admisión y Marketing (ADMA)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'adma',
      kind: 'office',
    });
  }
  if (OBUN_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'obun',
      label: 'Oficina de Bienestar Universitario (OBUN)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'obun',
      kind: 'office',
    });
  }
  if (RESU_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'resu',
      label: 'Oficina de Responsabilidad Social Universitaria (RESU)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'resu',
      kind: 'office',
    });
  }
  if (PITT_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'pitt',
      label: 'Oficina de Procesos de Investigación y Transferencia Tecnológica (PITT)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'pitt',
      kind: 'office',
    });
  }
  if (BISA_OWN.includes(procedureCode)) {
    badges.push({
      unitId: 'bisa',
      label: 'Oficina de Biblioteca y Servicios Académicos (BISA)',
      prefix: 'Oficina',
      isDirect: activeUnit?.id === 'bisa',
      kind: 'office',
    });
  }
  if (FACULTY_PROCEDURE_CODES.includes(procedureCode)) {
    badges.push({
      unitId: 'facultades-group',
      label:
        activeUnit?.level === 'facultad'
          ? activeUnit.officeName
          : 'Facultades UPT (FAING, FACSA, FACEM, FAEDCOH, FAU, FADE)',
      prefix: activeUnit?.level === 'facultad' ? 'Facultad' : 'Facultades',
      isDirect: activeUnit?.level === 'facultad',
      kind: 'faculty',
    });
  }

  return badges;
}

const UNIT_KEYWORDS_MAP: Record<string, string[]> = {
  'rectorado': [
    'rectorado', 'consejo universitario', 'alta dirección', 'opla', 'planeamiento', 'planificación',
    'sege', 'secretaría general', 'ajul', 'asesoría jurídica', 'legal', 'diga', 'administración',
    'aima', 'infraestructura', 'mantenimiento', 'alog', 'logística', 'patrimonio', 'aphu',
    'potencial humano', 'tesorería', 'contabilidad', 'tein', 'tecnología de información',
    'tecnologías de la información', 'reni', 'relaciones nacionales', 'geca', 'gestión de la calidad',
    'imai', 'imagen institucional', 'seguridad y salud', 'csst'
  ],
  'opla': ['opla', 'planeamiento', 'planificación', 'presupuesto'],
  'sege': ['sege', 'secretaría general', 'grados y títulos'],
  'ajul': ['ajul', 'asesoría jurídica', 'legal', 'defensoría'],
  'diga': [
    'diga', 'dirección general de administración', 'aima', 'infraestructura', 'mantenimiento',
    'alog', 'logística', 'abastecimiento', 'patrimonio', 'aphu', 'potencial humano',
    'tesorería', 'tesoreria', 'contabilidad', 'seguridad y salud', 'csst'
  ],
  'diga-aima': ['aima', 'infraestructura', 'mantenimiento', 'servicios generales', 'seguridad y salud', 'csst'],
  'diga-alog': ['alog', 'logística', 'logistica', 'abastecimiento', 'compras', 'adquisición'],
  'diga-patrimonio': ['patrimonio', 'bienes patrimoniales', 'inventario'],
  'diga-aphu': ['aphu', 'potencial humano', 'recursos humanos', 'personal'],
  'diga-tesoreria': ['tesorería', 'tesoreria', 'recaudación', 'caja'],
  'diga-contabilidad': ['contabilidad', 'estados financieros', 'contable'],
  'tein': ['tein', 'tecnología de información', 'tecnologías de la información', 'educación virtual', 'aula virtual', 'sistemas'],
  'reni': ['reni', 'relaciones nacionales', 'internacionales', 'convenios', 'movilidad', 'cooperación'],
  'geca-office': ['geca', 'gestión de la calidad', 'calidad'],
  'imai': ['imai', 'imagen institucional', 'comunicación'],
  'vrac': [
    'vrac', 'vicerrector académico', 'vicerrectorado académico', 'gpad', 'procesos académicos',
    'docencia', 'adma', 'admisión', 'marketing', 'obun', 'bienestar', 'resu', 'responsabilidad social',
    'facultad', 'escuela', 'posgrado', 'espg', 'coordinación académica'
  ],
  'gpad': ['gpad', 'procesos académicos', 'docencia', 'curricular'],
  'adma': ['adma', 'admisión', 'marketing'],
  'obun': ['obun', 'bienestar universitario', 'bienestar', 'nee', 'necesidades especiales', 'psicopedagogía', 'servicio social'],
  'resu': ['resu', 'responsabilidad social', 'proyección social', 'voluntariado', 'ambiental'],
  'vrin': [
    'vrin', 'vicerrectorado de investigación', 'pitt', 'investigación', 'transferencia',
    'incubadora', 'edun', 'fondo editorial', 'bisa', 'biblioteca', 'posgrado', 'espg'
  ],
  'pitt': ['pitt', 'investigación', 'transferencia', 'incubadora', 'edun', 'fondo editorial'],
  'bisa': ['bisa', 'biblioteca', 'servicios académicos', 'repositorio'],
  'faing': ['faing', 'ingeniería', 'director de escuela', 'directores de escuela', 'facultades y escuelas', 'escuela de posgrado', 'coordinación académica'],
  'facsa': ['facsa', 'ciencias de la salud', 'salud', 'director de escuela', 'directores de escuela', 'facultades y escuelas', 'escuela de posgrado', 'coordinación académica'],
  'facem': ['facem', 'ciencias empresariales', 'empresariales', 'director de escuela', 'directores de escuela', 'facultades y escuelas', 'escuela de posgrado', 'coordinación académica'],
  'faedcoh': ['faedcoh', 'educación, ciencias de la comunicación', 'humanidades', 'director de escuela', 'directores de escuela', 'facultades y escuelas', 'escuela de posgrado', 'coordinación académica'],
  'fau': ['fau', 'arquitectura y urbanismo', 'arquitectura', 'director de escuela', 'directores de escuela', 'facultades y escuelas', 'escuela de posgrado', 'coordinación académica'],
  'fade': ['fade', 'derecho y ciencias políticas', 'derecho', 'director de escuela', 'directores de escuela', 'facultades y escuelas', 'escuela de posgrado', 'coordinación académica'],
};

export function doesUnitMatchOfficeText(unit: OrganizationUnit, text: string): boolean {
  const cleanText = (text || '').trim().toLowerCase();
  if (!cleanText) return false;
  const keywords = UNIT_KEYWORDS_MAP[unit.id] || [unit.officeName.toLowerCase(), unit.displayName.toLowerCase()];
  return keywords.some((kw) => cleanText.includes(kw));
}

export function doesUserMatchOfficeOrProcess(
  user: {
    unitId?: string;
    secondaryUnitId?: string;
    officeName?: string;
    secondaryOfficeName?: string;
    department?: string;
    role?: string;
    processCodes?: ProcessLevel0[];
  },
  item: {
    officeText?: string;
    processCode?: ProcessLevel0;
  },
  allowProcessFallback = false
): boolean {
  const primaryUnit = resolveUserOrganizationUnit(user);
  const secondaryUnit = resolveUserSecondaryUnit(user);
  const units = [primaryUnit, secondaryUnit].filter((u): u is OrganizationUnit => Boolean(u));

  if (units.length === 0) {
    if (item.processCode && user.processCodes) {
      return user.processCodes.includes(item.processCode);
    }
    return true;
  }

  // 1. Coincidencia directa por nombre de oficina / responsable / departamento asignado
  if (item.officeText && item.officeText.trim().length > 0) {
    const matchedByText = units.some((u) => doesUnitMatchOfficeText(u, item.officeText!));
    if (matchedByText) return true;
    if (!allowProcessFallback) return false;
  }

  // 2. Coincidencia por código de macroproceso (PE/PM/PS) asignado a la dependencia del usuario
  if (item.processCode) {
    return units.some((u) => u.processCodes.includes(item.processCode!));
  }

  return false;
}


