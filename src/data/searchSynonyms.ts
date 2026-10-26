// Diccionario institucional de sinónimos y lenguaje cotidiano UPT
// Permite que usuarios sin conocimiento técnico ISO encuentren procedimientos
// usando palabras comunes, coloquiales o conceptos de su día a día.

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  // Trámites académicos y estudiantes
  'matricula': ['PM.01.03.02', 'PM.01.03.01'],
  'matricularse': ['PM.01.03.02'],
  'inscripcion': ['PM.01.01.01', 'PM.01.03.02'],
  'admision': ['PM.01.01.01'],
  'ingresante': ['PM.01.01.01'],
  'examen de admision': ['PM.01.01.01'],
  'postulante': ['PM.01.01.01'],
  'titulo': ['PM.01.04.01', 'PE.01.04.02'],
  'titulacion': ['PM.01.04.01'],
  'grado': ['PM.01.04.01'],
  'bachiller': ['PM.01.04.01'],
  'graduacion': ['PM.01.04.01'],
  'egresado': ['PM.01.04.02'],
  'egresados': ['PM.01.04.02'],
  'bolsa de trabajo': ['PM.01.04.02'],
  'silabo': ['PM.01.02.02'],
  'silabos': ['PM.01.02.02'],
  'curriculo': ['PM.01.02.01'],
  'malla curricular': ['PM.01.02.01'],
  'plan de estudios': ['PM.01.02.01', 'PE.01.04.01'],
  'convalidar': ['PM.01.03.03'],
  'convalidacion': ['PM.01.03.03'],
  'traslado': ['PM.01.03.03'],
  'notas': ['PM.01.03.04'],
  'evaluacion': ['PM.01.03.04', 'PM.01.07.03'],
  'desaprobado': ['PM.01.03.04'],
  'practicas': ['PM.01.03.05'],
  'secigra': ['PM.01.03.05'],
  'internado': ['PM.01.03.05'],
  'tutoria': ['PM.01.06.01'],
  'tutor': ['PM.01.06.01'],
  'consejero': ['PM.01.06.02'],
  'consejeria': ['PM.01.06.02'],
  'psicologia': ['PM.01.06.03'],
  'salud mental': ['PM.01.06.03'],
  'asistenta social': ['PM.01.06.04'],
  'asistencia social': ['PM.01.06.04'],
  'medico': ['PM.01.06.05'],
  'topico': ['PM.01.06.05'],
  'salud': ['PM.01.06.05', 'PM.01.06.10'],
  'odontologia': ['PM.01.06.06'],
  'deportes': ['PM.01.06.07'],
  'musica': ['PM.01.06.08'],
  'danza': ['PM.01.06.08'],
  'teatro': ['PM.01.06.08'],
  'talleres': ['PM.01.06.08'],
  'beca': ['PM.01.06.09'],
  'becas': ['PM.01.06.09'],
  'subvencion': ['PM.01.06.09'],
  'descuento': ['PM.01.06.09'],
  'comedor': ['PM.01.06.10'],

  // Docentes
  'docente': ['PM.01.07.01', 'PM.01.07.02', 'PM.01.07.03'],
  'docentes': ['PM.01.07.01', 'PM.01.07.02', 'PM.01.07.03'],
  'profesor': ['PM.01.07.01', 'PM.01.07.02', 'PM.01.07.03'],
  'profesores': ['PM.01.07.01', 'PM.01.07.02', 'PM.01.07.03'],
  'contrato docente': ['PM.01.07.01'],
  'capacitacion docente': ['PM.01.07.02'],
  'evaluacion docente': ['PM.01.07.03'],
  'ratificacion': ['PM.01.07.03'],

  // Investigación y Tesis
  'tesis': ['PM.02.01.01', 'PM.02.01.02', 'PM.02.01.03', 'PS.02.02.01'],
  'investigacion': ['PM.02.01.01', 'PM.02.01.02', 'PM.02.01.03', 'PM.02.01.04'],
  'proyecto de investigacion': ['PM.02.01.01'],
  'patente': ['PM.02.02.01'],
  'emprendimiento': ['PM.02.02.01'],
  'incubadora': ['PM.02.02.01'],
  'articulo': ['PM.02.01.04'],
  'publicacion': ['PM.02.01.04'],
  'revista': ['PM.02.01.04'],
  'renacyt': ['PM.02.01.03'],

  // Logística, Compras y Bienes
  'compra': ['PS.05.03.01', 'PS.05.03.02'],
  'compras': ['PS.05.03.01', 'PS.05.03.02'],
  'adquisicion': ['PS.05.03.01', 'PS.05.03.02', 'PS.02.01.01', 'PS.02.01.02'],
  'adquirir': ['PS.05.03.01', 'PS.05.03.02'],
  'proveedor': ['PS.05.03.01', 'PS.05.03.02'],
  'proveedores': ['PS.05.03.01', 'PS.05.03.02'],
  'cotizacion': ['PS.05.03.01', 'PS.05.03.02'],
  'licitacion': ['PS.05.03.01'],
  'orden de compra': ['PS.05.03.01', 'PS.05.03.02'],
  'bienes': ['PS.05.03.01', 'PS.05.03.02', 'PS.05.03.03'],
  'almacen': ['PS.05.03.03'],
  'inventario': ['PS.05.03.03', 'PS.05.03.04'],
  'patrimonio': ['PS.05.03.04'],
  'baja de bienes': ['PS.05.03.04'],

  // Dinero, Pagos, Finanzas y Tesorería
  'pago': ['PS.05.01.02'],
  'pagos': ['PS.05.01.02'],
  'pagar': ['PS.05.01.02'],
  'sueldo': ['PS.05.01.02', 'PS.01.02.01'],
  'remuneracion': ['PS.05.01.02', 'PS.01.02.01'],
  'cobro': ['PS.05.01.01'],
  'cobranza': ['PS.05.01.01'],
  'ingresos': ['PS.05.01.01'],
  'caja': ['PS.05.01.01'],
  'tesoreria': ['PS.05.01.01', 'PS.05.01.02'],
  'presupuesto': ['PS.05.02.01'],
  'viaticos': ['PS.05.01.02'],
  'rendicion': ['PS.05.01.02'],

  // Personal administrativo y RRHH
  'personal': ['PS.01.01.01', 'PS.01.02.01'],
  'empleado': ['PS.01.01.01'],
  'contratacion': ['PS.01.01.01', 'PM.01.07.01'],
  'vacaciones': ['PS.01.02.01'],
  'permiso': ['PS.01.02.01'],
  'asistencia': ['PS.01.02.01'],
  'capacitacion personal': ['PS.01.03.01'],
  'clima laboral': ['PS.01.04.01'],

  // Biblioteca y Libros
  'libro': ['PS.02.01.01', 'PS.02.01.02', 'PS.02.01.03'],
  'libros': ['PS.02.01.01', 'PS.02.01.02'],
  'biblioteca': ['PS.02.01.01', 'PS.02.01.02', 'PS.02.01.03'],
  'prestamo de libros': ['PS.02.01.03'],
  'repositorio': ['PS.02.02.01'],

  // Sistemas, Informática y TI
  'computadora': ['PS.04.02.04', 'PS.04.03.01'],
  'computadoras': ['PS.04.02.04'],
  'internet': ['PS.04.02.03'],
  'red': ['PS.04.02.03', 'PS.04.02.04'],
  'redes': ['PS.04.02.03', 'PS.04.02.04'],
  'wifi': ['PS.04.02.03'],
  'servidor': ['PS.04.02.02'],
  'servidores': ['PS.04.02.02'],
  'sistema': ['PS.04.01.01', 'PS.04.02.01'],
  'software': ['PS.04.01.01', 'PS.04.02.01'],
  'correo': ['PS.04.02.03', 'PS.04.03.01'],
  'soporte tecnico': ['PS.04.03.01'],
  'ayuda informatica': ['PS.04.03.01'],
  'copia de seguridad': ['PS.04.02.02'],
  'backup': ['PS.04.02.02'],

  // Infraestructura, Mantenimiento y Seguridad
  'mantenimiento': ['PS.03.03.01', 'PS.03.03.02'],
  'limpieza': ['PS.03.03.01', 'PS.05.04.02'],
  'edificio': ['PS.03.01.01', 'PS.03.03.01'],
  'infraestructura': ['PS.03.03.01'],
  'obra': ['PS.03.01.01', 'PS.03.01.02', 'PS.03.01.03'],
  'vigilancia': ['PS.05.04.03'],
  'seguridad': ['PS.05.04.03', 'PE.03.01.04'],
  'vigilante': ['PS.05.04.03'],
  'guardia': ['PS.05.04.03'],
  'agua': ['PS.05.04.02'],
  'luz': ['PS.05.04.02'],
  'residuos': ['PM.03.03.01'],
  'basura': ['PM.03.03.01'],
  'reciclaje': ['PM.03.03.01'],

  // Calidad, Auditorías y Procesos
  'auditoria': ['PE.02.01.02'],
  'auditorias': ['PE.02.01.02'],
  'no conformidad': ['PE.02.01.03'],
  'hallazgo': ['PE.02.01.03'],
  'queja': ['PE.02.02.01'],
  'reclamo': ['PE.02.02.01'],
  'satisfaccion': ['PE.02.02.01'],
  'acreditacion': ['PE.02.03.01'],
  'licenciamiento': ['PE.01.04.01', 'PS.05.04.01'],
  'riesgo': ['PE.03.01.01', 'PE.03.01.02', 'PE.03.01.03'],
  'riesgos': ['PE.03.01.01', 'PE.03.01.02'],
  'seguridad de la informacion': ['PE.03.01.03'],
  'contingencia': ['PE.03.01.02', 'PE.03.01.04'],
  'convenio': ['PE.04.01.01', 'PE.04.01.02'],
  'convenios': ['PE.04.01.01', 'PE.04.01.02'],
};

// Función para normalizar texto (elimina tildes, signos y pasa a minúsculas)
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9\s]/g, ' ')   // quita signos
    .replace(/\s+/g, ' ')            // colapsa espacios
    .trim();
}

// Devuelve los códigos de procedimientos que coinciden con los sinónimos
export function getSynonymProcedureCodes(searchQuery: string): Set<string> {
  const normalizedQuery = normalizeSearchText(searchQuery);
  if (!normalizedQuery) return new Set();

  const matchedCodes = new Set<string>();
  const queryWords = normalizedQuery.split(' ').filter(w => w.length >= 3);

  // 1. Coincidencia directa por frase completa
  if (SEARCH_SYNONYMS[normalizedQuery]) {
    SEARCH_SYNONYMS[normalizedQuery].forEach(code => matchedCodes.add(code));
  }

  // 2. Coincidencia por palabras individuales en el diccionario
  for (const word of queryWords) {
    if (SEARCH_SYNONYMS[word]) {
      SEARCH_SYNONYMS[word].forEach(code => matchedCodes.add(code));
    }
    // Coincidencia parcial de sinónimos (ej: "titulos" -> "titulo")
    for (const [key, codes] of Object.entries(SEARCH_SYNONYMS)) {
      if (key.startsWith(word) || word.startsWith(key)) {
        codes.forEach(code => matchedCodes.add(code));
      }
    }
  }

  return matchedCodes;
}

// Dependencias institucionales para el filtro "Por Dependencia / Oficina"
export interface UPTDependency {
  id: string;
  name: string;
  shortName: string;
  filterKeywords: string[];
}

export const UPT_DEPENDENCIES: UPTDependency[] = [
  {
    id: 'all',
    name: 'Todas las Dependencias y Oficinas',
    shortName: 'Todas',
    filterKeywords: []
  },
  {
    id: 'rectorado',
    name: 'Rectorado / Dirección de Planificación',
    shortName: 'Rectorado y Planificación',
    filterKeywords: ['rectorado', 'planificacion', 'pe.01']
  },
  {
    id: 'geca',
    name: 'Oficina de Gestión de la Calidad (GECA)',
    shortName: 'Calidad (GECA)',
    filterKeywords: ['geca', 'gestion de la calidad', 'pe.02']
  },
  {
    id: 'riesgos',
    name: 'Comité de Riesgos y Seguridad Institucional',
    shortName: 'Riesgos y Seguridad',
    filterKeywords: ['riesgos', 'seguridad institucional', 'pe.03']
  },
  {
    id: 'cooperacion',
    name: 'Dirección de Cooperación y Relaciones Interinstitucionales',
    shortName: 'Cooperación y Convenios',
    filterKeywords: ['cooperacion', 'convenio', 'relaciones interinstitucionales', 'pe.04']
  },
  {
    id: 'vrac',
    name: 'Vicerrectorado Académico (VRAC) / Facultades y Escuelas',
    shortName: 'Académico (VRAC / Facultades)',
    filterKeywords: ['vicerrectorado academico', 'vrac', 'decanatos', 'facultad', 'escuela', 'pm.01']
  },
  {
    id: 'vrin',
    name: 'Vicerrectorado de Investigación (VRIN)',
    shortName: 'Investigación (VRIN)',
    filterKeywords: ['vicerrectorado de investigacion', 'vrin', 'investigacion', 'innovacion', 'pm.02']
  },
  {
    id: 'rsu',
    name: 'Dirección de Responsabilidad Social Universitaria (RSU)',
    shortName: 'Responsabilidad Social (RSU)',
    filterKeywords: ['responsabilidad social', 'rsu', 'proyeccion social', 'pm.03']
  },
  {
    id: 'rrhh',
    name: 'Oficina de Recursos Humanos (Personal)',
    shortName: 'Recursos Humanos',
    filterKeywords: ['recursos humanos', 'personal', 'ps.01']
  },
  {
    id: 'biblioteca',
    name: 'Dirección de Biblioteca Central',
    shortName: 'Biblioteca Central',
    filterKeywords: ['biblioteca', 'material bibliografico', 'repositorio', 'ps.02']
  },
  {
    id: 'infraestructura',
    name: 'Oficina de Infraestructura y Mantenimiento',
    shortName: 'Infraestructura',
    filterKeywords: ['infraestructura', 'proyectos de inversion', 'mantenimiento', 'ps.03']
  },
  {
    id: 'dti',
    name: 'Dirección de Tecnologías de la Información (DTI)',
    shortName: 'Sistemas e Informática (DTI)',
    filterKeywords: ['tecnologias de la informacion', 'dti', 'sistemas', 'redes', 'ps.04']
  },
  {
    id: 'dga',
    name: 'Dirección General de Administración (DGA) / Logística y Finanzas',
    shortName: 'Administración (DGA / Logística)',
    filterKeywords: ['direccion general de administracion', 'dga', 'logistica', 'abastecimiento', 'tesoreria', 'contabilidad', 'ps.05']
  },
  {
    id: 'secretaria_general',
    name: 'Secretaría General / Archivo Central / Asesoría Jurídica',
    shortName: 'Secretaría General y Jurídica',
    filterKeywords: ['secretaria general', 'archivo central', 'asesoria juridica', 'ps.06']
  }
];

// Temas guiados para el Asistente Institucional
export interface GuideTopic {
  id: string;
  pillar: string; // 'Estratégico' | 'Misional' | 'Soporte'
  title: string;
  description: string;
  procedureCodes: string[];
}

export const GUIDE_TOPICS: GuideTopic[] = [
  // 1. Ámbito Académico y Estudiantil
  {
    id: 'admision_matricula',
    pillar: 'Misional',
    title: 'Admisión, Matrícula y Convalidaciones',
    description: 'Postulación a la UPT, matrícula regular y extemporánea, traslados y convalidación de asignaturas.',
    procedureCodes: ['PM.01.01.01', 'PM.01.03.01', 'PM.01.03.02', 'PM.01.03.03']
  },
  {
    id: 'planes_curriculo',
    pillar: 'Misional',
    title: 'Planes de Estudio, Sílabos y Acreditación',
    description: 'Diseño y actualización curricular de carreras, elaboración de sílabos y acreditación de programas.',
    procedureCodes: ['PM.01.02.01', 'PM.01.02.02', 'PE.01.04.01', 'PE.02.03.01']
  },
  {
    id: 'grados_titulos',
    pillar: 'Misional',
    title: 'Grados Académicos, Títulos y Egresados',
    description: 'Trámite de grado de Bachiller, Título Profesional, Maestría, Doctorado y seguimiento de egresados.',
    procedureCodes: ['PM.01.04.01', 'PM.01.04.02', 'PE.01.04.02']
  },
  {
    id: 'bienestar_salud_becas',
    pillar: 'Misional',
    title: 'Bienestar Universitario, Salud y Becas',
    description: 'Servicio médico, odontología, psicología, becas, subvenciones, talleres deportivos y culturales.',
    procedureCodes: ['PM.01.06.01', 'PM.01.06.02', 'PM.01.06.03', 'PM.01.06.04', 'PM.01.06.05', 'PM.01.06.06', 'PM.01.06.07', 'PM.01.06.08', 'PM.01.06.09', 'PM.01.06.10']
  },
  {
    id: 'docentes_gestion',
    pillar: 'Misional',
    title: 'Contratación y Evaluación Docente',
    description: 'Selección, contratación, inducción, capacitación permanente y evaluación del desempeño docente.',
    procedureCodes: ['PM.01.07.01', 'PM.01.07.02', 'PM.01.07.03']
  },

  // 2. Investigación e Innovación
  {
    id: 'investigacion_tesis',
    pillar: 'Misional',
    title: 'Proyectos de Investigación y Tesis',
    description: 'Aprobación de proyectos de investigación, ejecución, financiamiento, sustentación y repositorio de tesis.',
    procedureCodes: ['PM.02.01.01', 'PM.02.01.02', 'PM.02.01.03', 'PM.02.01.04', 'PM.02.02.01', 'PS.02.02.01']
  },

  // 3. Administración, Logística y Finanzas
  {
    id: 'compras_logistica',
    pillar: 'Soporte',
    title: 'Compras, Contrataciones y Almacén',
    description: 'Adquisición de bienes y servicios por proceso de selección o directo, control de inventario y patrimonio.',
    procedureCodes: ['PS.05.03.01', 'PS.05.03.02', 'PS.05.03.03', 'PS.05.03.04']
  },
  {
    id: 'finanzas_pagos',
    pillar: 'Soporte',
    title: 'Pagos, Cobranzas y Presupuesto',
    description: 'Gestión de ingresos en caja, cobros institucionales, pagos a proveedores, viáticos y presupuesto.',
    procedureCodes: ['PS.05.01.01', 'PS.05.01.02', 'PS.05.02.01']
  },
  {
    id: 'personal_rrhh',
    pillar: 'Soporte',
    title: 'Personal Administrativo (RRHH)',
    description: 'Contratación, inducción de personal administrativo, control de asistencia, licencias y capacitaciones.',
    procedureCodes: ['PS.01.01.01', 'PS.01.02.01', 'PS.01.03.01', 'PS.01.04.01']
  },
  {
    id: 'sistemas_ti',
    pillar: 'Soporte',
    title: 'Sistemas, Correo, Redes y Soporte TI',
    description: 'Desarrollo de software, mantenimiento de servidores, redes, seguridad digital y asistencia a usuarios.',
    procedureCodes: ['PS.04.01.01', 'PS.04.02.01', 'PS.04.02.02', 'PS.04.02.03', 'PS.04.02.04', 'PS.04.03.01']
  },
  {
    id: 'infraestructura_obras',
    pillar: 'Soporte',
    title: 'Infraestructura, Mantenimiento y Servicios',
    description: 'Proyectos de inversión en infraestructura, mantenimiento de aulas y equipos, servicios de agua y luz.',
    procedureCodes: ['PS.03.01.01', 'PS.03.01.02', 'PS.03.01.03', 'PS.03.01.04', 'PS.03.03.01', 'PS.03.03.02', 'PS.05.04.02']
  },

  // 4. Calidad, Planificación y Dirección
  {
    id: 'calidad_auditorias',
    pillar: 'Estratégico',
    title: 'Auditorías, Quejas y Gestión de la Calidad',
    description: 'Auditorías internas ISO, control de no conformidades, tratamiento de quejas/reclamos y revisión por la dirección.',
    procedureCodes: ['PE.02.01.01', 'PE.02.01.02', 'PE.02.01.03', 'PE.02.02.01', 'PE.02.04.01']
  },
  {
    id: 'riesgos_seguridad',
    pillar: 'Estratégico',
    title: 'Gestión de Riesgos y Seguridad Institucional',
    description: 'Identificación de riesgos, planes de contingencia, seguridad de la información y servicio de vigilancia.',
    procedureCodes: ['PE.03.01.01', 'PE.03.01.02', 'PE.03.01.03', 'PE.03.01.04', 'PS.05.04.03']
  },
  {
    id: 'convenios_alianzas',
    pillar: 'Estratégico',
    title: 'Convenios y Movilidad Institucional',
    description: 'Suscripción de convenios interinstitucionales, pasantías y movilidad académica estudiantil y docente.',
    procedureCodes: ['PE.04.01.01', 'PE.04.01.02', 'PM.01.05.01']
  }
];
