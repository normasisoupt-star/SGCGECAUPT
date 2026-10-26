export interface ProcedureRangeInfo {
  code: string;
  title: string;
  startPage: number;
  endPage: number;
  activitiesPage: number;
  pageCount: number;
  manual: string;
  rangeText: string;
}

export const UPT_PROCEDURE_PAGE_RANGES: Record<string, ProcedureRangeInfo> = {
  "PE.01.01.01": {
    "code": "PE.01.01.01",
    "title": "Gestión de políticas académicas",
    "startPage": 10,
    "endPage": 15,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "10 a 15",
    "activitiesPage": 12
  },
  "PE.01.01.02": {
    "code": "PE.01.01.02",
    "title": "Gestión de políticas administrativas",
    "startPage": 16,
    "endPage": 21,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "16 a 21",
    "activitiesPage": 18
  },
  "PE.01.02.01": {
    "code": "PE.01.02.01",
    "title": "Formulación del Plan Estratégico Institucional",
    "startPage": 22,
    "endPage": 27,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "22 a 27",
    "activitiesPage": 24
  },
  "PE.01.02.02": {
    "code": "PE.01.02.02",
    "title": "Formulación del presupuesto institucional",
    "startPage": 28,
    "endPage": 33,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "28 a 33",
    "activitiesPage": 30
  },
  "PE.01.02.03": {
    "code": "PE.01.02.03",
    "title": "Formulación del Plan Operativo Institucional",
    "startPage": 34,
    "endPage": 39,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "34 a 39",
    "activitiesPage": 36
  },
  "PE.01.02.04": {
    "code": "PE.01.02.04",
    "title": "Formulación del Plan de Trabajo Anual",
    "startPage": 40,
    "endPage": 45,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "40 a 45",
    "activitiesPage": 42
  },
  "PE.01.02.05": {
    "code": "PE.01.02.05",
    "title": "Seguimiento y evaluación de planes",
    "startPage": 46,
    "endPage": 51,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "46 a 51",
    "activitiesPage": 49
  },
  "PE.01.03.01": {
    "code": "PE.01.03.01",
    "title": "Diseño y actualización del Modelo Educativo",
    "startPage": 52,
    "endPage": 57,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "52 a 57",
    "activitiesPage": 55
  },
  "PE.01.04.01": {
    "code": "PE.01.04.01",
    "title": "Creación de carreras o programas",
    "startPage": 58,
    "endPage": 64,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "58 a 64",
    "activitiesPage": 61
  },
  "PE.01.04.02": {
    "code": "PE.01.04.02",
    "title": "Supresión de carreras o programas",
    "startPage": 65,
    "endPage": 70,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "65 a 70",
    "activitiesPage": 68
  },
  "PE.01.04.03": {
    "code": "PE.01.04.03",
    "title": "Modificación de denominación de carreras o programas",
    "startPage": 71,
    "endPage": 78,
    "pageCount": 8,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "71 a 78",
    "activitiesPage": 74
  },
  "PE.02.01.01": {
    "code": "PE.02.01.01",
    "title": "Revisión del sistema de gestión de la calidad",
    "startPage": 79,
    "endPage": 86,
    "pageCount": 8,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "79 a 86",
    "activitiesPage": 82
  },
  "PE.02.01.02": {
    "code": "PE.02.01.02",
    "title": "Gestión de Información Documentada",
    "startPage": 87,
    "endPage": 100,
    "pageCount": 14,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "87 a 100",
    "activitiesPage": 90
  },
  "PE.02.01.03": {
    "code": "PE.02.01.03",
    "title": "Gestión de Salidas No Conformes",
    "startPage": 101,
    "endPage": 111,
    "pageCount": 11,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "101 a 111",
    "activitiesPage": 104
  },
  "PE.02.01.04": {
    "code": "PE.02.01.04",
    "title": "Gestión de quejas, reclamos y apelaciones",
    "startPage": 112,
    "endPage": 118,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "112 a 118",
    "activitiesPage": 115
  },
  "PE.02.02.01": {
    "code": "PE.02.02.01",
    "title": "Evaluación de condiciones básicas de calidad",
    "startPage": 119,
    "endPage": 124,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "119 a 124",
    "activitiesPage": 122
  },
  "PE.02.03.01": {
    "code": "PE.02.03.01",
    "title": "Acreditación de carreras profesionales y programas",
    "startPage": 125,
    "endPage": 135,
    "pageCount": 11,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "125 a 135",
    "activitiesPage": 127
  },
  "PE.02.04.01": {
    "code": "PE.02.04.01",
    "title": "Auditoría interna y externa",
    "startPage": 136,
    "endPage": 144,
    "pageCount": 9,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "136 a 144",
    "activitiesPage": 140
  },
  "PE.02.04.02": {
    "code": "PE.02.04.02",
    "title": "No conformidades y acciones correctivas",
    "startPage": 145,
    "endPage": 154,
    "pageCount": 10,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "145 a 154",
    "activitiesPage": 147
  },
  "PE.03.01.01": {
    "code": "PE.03.01.01",
    "title": "Identificación, evaluación, tratamiento y monitoreo de riesgos",
    "startPage": 155,
    "endPage": 162,
    "pageCount": 8,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "155 a 162",
    "activitiesPage": 158
  },
  "PE.03.02.01": {
    "code": "PE.03.02.01",
    "title": "Gestión de riesgos y desastres",
    "startPage": 163,
    "endPage": 168,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "163 a 168",
    "activitiesPage": 165
  },
  "PE.03.02.02": {
    "code": "PE.03.02.02",
    "title": "Gestión de seguridad y salud en el trabajo",
    "startPage": 169,
    "endPage": 174,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "169 a 174",
    "activitiesPage": 171
  },
  "PE.03.02.03": {
    "code": "PE.03.02.03",
    "title": "Gestión de la seguridad informática",
    "startPage": 175,
    "endPage": 180,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "175 a 180",
    "activitiesPage": 177
  },
  "PE.04.01.01": {
    "code": "PE.04.01.01",
    "title": "Gestión de convenios interinstitucionales",
    "startPage": 181,
    "endPage": 187,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "181 a 187",
    "activitiesPage": 183
  },
  "PE.04.01.02": {
    "code": "PE.04.01.02",
    "title": "Gestión de alianzas estratégicas",
    "startPage": 181,
    "endPage": 187,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Estratégicos v3.0",
    "rangeText": "181 a 187",
    "activitiesPage": 184
  },
  "PE.04.02.01": {
    "code": "PE.04.02.01",
    "title": "Difusión de información interna y externa",
    "startPage": 188,
    "endPage": 193,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Estratégicos v03",
    "rangeText": "188 a 193",
    "activitiesPage": 190
  },
  "PM.01.01.01": {
    "code": "PM.01.01.01",
    "title": "Admisión",
    "startPage": 10,
    "endPage": 20,
    "pageCount": 11,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "10 a 20",
    "activitiesPage": 13
  },
  "PM.01.01.02": {
    "code": "PM.01.01.02",
    "title": "Nivelación de estudiantes ingresantes",
    "startPage": 21,
    "endPage": 28,
    "pageCount": 8,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "21 a 28",
    "activitiesPage": 23
  },
  "PM.01.02.01": {
    "code": "PM.01.02.01",
    "title": "Diseño, rediseño, actualización y adecuación curricular",
    "startPage": 29,
    "endPage": 40,
    "pageCount": 12,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "29 a 40",
    "activitiesPage": 32
  },
  "PM.01.02.02": {
    "code": "PM.01.02.02",
    "title": "Elaboración del sílabo",
    "startPage": 41,
    "endPage": 46,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "41 a 46",
    "activitiesPage": 43
  },
  "PM.01.03.01": {
    "code": "PM.01.03.01",
    "title": "Planificación de la enseñanza aprendizaje",
    "startPage": 47,
    "endPage": 54,
    "pageCount": 8,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "47 a 54",
    "activitiesPage": 49
  },
  "PM.01.03.02": {
    "code": "PM.01.03.02",
    "title": "Matrícula",
    "startPage": 55,
    "endPage": 61,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "55 a 61",
    "activitiesPage": 58
  },
  "PM.01.03.03": {
    "code": "PM.01.03.03",
    "title": "Desarrollo de la enseñanza aprendizaje",
    "startPage": 62,
    "endPage": 68,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "62 a 68",
    "activitiesPage": 65
  },
  "PM.01.03.04": {
    "code": "PM.01.03.04",
    "title": "Evaluación de aprendizaje",
    "startPage": 69,
    "endPage": 76,
    "pageCount": 8,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "69 a 76",
    "activitiesPage": 71
  },
  "PM.01.03.05": {
    "code": "PM.01.03.05",
    "title": "Desarrollo de prácticas pre profesionales",
    "startPage": 77,
    "endPage": 82,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "77 a 82",
    "activitiesPage": 79
  },
  "PM.01.04.01": {
    "code": "PM.01.04.01",
    "title": "Obtención de grados académicos y títulos",
    "startPage": 83,
    "endPage": 96,
    "pageCount": 14,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "83 a 96",
    "activitiesPage": 86
  },
  "PM.01.04.02": {
    "code": "PM.01.04.02",
    "title": "Seguimiento de egresados",
    "startPage": 97,
    "endPage": 102,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "97 a 102",
    "activitiesPage": 99
  },
  "PM.01.05.01": {
    "code": "PM.01.05.01",
    "title": "Movilidad académica",
    "startPage": 103,
    "endPage": 111,
    "pageCount": 9,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "103 a 111",
    "activitiesPage": 105
  },
  "PM.01.06.01": {
    "code": "PM.01.06.01",
    "title": "Tutoría académica",
    "startPage": 112,
    "endPage": 118,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "112 a 118",
    "activitiesPage": 114
  },
  "PM.01.06.02": {
    "code": "PM.01.06.02",
    "title": "Consejería",
    "startPage": 119,
    "endPage": 124,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "119 a 124",
    "activitiesPage": 121
  },
  "PM.01.06.03": {
    "code": "PM.01.06.03",
    "title": "Salud mental",
    "startPage": 125,
    "endPage": 130,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "125 a 130",
    "activitiesPage": 127
  },
  "PM.01.06.04": {
    "code": "PM.01.06.04",
    "title": "Asistencia social",
    "startPage": 131,
    "endPage": 137,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "131 a 137",
    "activitiesPage": 134
  },
  "PM.01.06.05": {
    "code": "PM.01.06.05",
    "title": "Atención primaria de salud",
    "startPage": 138,
    "endPage": 143,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "138 a 143",
    "activitiesPage": 140
  },
  "PM.01.06.06": {
    "code": "PM.01.06.06",
    "title": "Integración a grupos deportivos",
    "startPage": 144,
    "endPage": 149,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "144 a 149",
    "activitiesPage": 146
  },
  "PM.01.06.07": {
    "code": "PM.01.06.07",
    "title": "Integración a grupos culturales",
    "startPage": 150,
    "endPage": 155,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "150 a 155",
    "activitiesPage": 152
  },
  "PM.01.06.08": {
    "code": "PM.01.06.08",
    "title": "Talleres extracurriculares",
    "startPage": 156,
    "endPage": 161,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "156 a 161",
    "activitiesPage": 158
  },
  "PM.01.06.09": {
    "code": "PM.01.06.09",
    "title": "Becas y subvenciones",
    "startPage": 162,
    "endPage": 171,
    "pageCount": 10,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "162 a 171",
    "activitiesPage": 164
  },
  "PM.01.06.10": {
    "code": "PM.01.06.10",
    "title": "Universidad saludable",
    "startPage": 172,
    "endPage": 177,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "172 a 177",
    "activitiesPage": 174
  },
  "PM.01.07.01": {
    "code": "PM.01.07.01",
    "title": "Contratación e inducción de personal docente",
    "startPage": 178,
    "endPage": 188,
    "pageCount": 11,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "178 a 188",
    "activitiesPage": 181
  },
  "PM.01.07.02": {
    "code": "PM.01.07.02",
    "title": "Capacitación docente",
    "startPage": 189,
    "endPage": 196,
    "pageCount": 8,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "189 a 196",
    "activitiesPage": 191
  },
  "PM.01.07.03": {
    "code": "PM.01.07.03",
    "title": "Evaluación docente",
    "startPage": 197,
    "endPage": 204,
    "pageCount": 8,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "197 a 204",
    "activitiesPage": 199
  },
  "PM.02.01.01": {
    "code": "PM.02.01.01",
    "title": "Actualización de líneas de investigación",
    "startPage": 205,
    "endPage": 210,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "205 a 210",
    "activitiesPage": 207
  },
  "PM.02.01.02": {
    "code": "PM.02.01.02",
    "title": "Conformación de grupos de investigación",
    "startPage": 211,
    "endPage": 217,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "211 a 217",
    "activitiesPage": 214
  },
  "PM.02.01.03": {
    "code": "PM.02.01.03",
    "title": "Desarrollo de investigación",
    "startPage": 218,
    "endPage": 223,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "218 a 223",
    "activitiesPage": 221
  },
  "PM.02.01.04": {
    "code": "PM.02.01.04",
    "title": "Publicación de investigación",
    "startPage": 224,
    "endPage": 229,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "224 a 229",
    "activitiesPage": 226
  },
  "PM.02.01.05": {
    "code": "PM.02.01.05",
    "title": "Gestión de la propiedad intelectual",
    "startPage": 230,
    "endPage": 235,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "230 a 235",
    "activitiesPage": 232
  },
  "PM.02.02.01": {
    "code": "PM.02.02.01",
    "title": "Innovación, desarrollo tecnológico y emprendimiento",
    "startPage": 236,
    "endPage": 242,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "236 a 242",
    "activitiesPage": 239
  },
  "PM.03.01.01": {
    "code": "PM.03.01.01",
    "title": "Planificación de la responsabilidad social universitaria",
    "startPage": 243,
    "endPage": 249,
    "pageCount": 7,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "243 a 249",
    "activitiesPage": 245
  },
  "PM.03.01.02": {
    "code": "PM.03.01.02",
    "title": "Evaluación del impacto de las actividades de RSU",
    "startPage": 250,
    "endPage": 255,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "250 a 255",
    "activitiesPage": 252
  },
  "PM.03.02.01": {
    "code": "PM.03.02.01",
    "title": "Gestión de la proyección social y voluntariado",
    "startPage": 256,
    "endPage": 261,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "256 a 261",
    "activitiesPage": 259
  },
  "PM.03.02.02": {
    "code": "PM.03.02.02",
    "title": "Gestión de residuos",
    "startPage": 262,
    "endPage": 267,
    "pageCount": 6,
    "manual": "Manual de Procedimientos Misionales v03",
    "rangeText": "262 a 267",
    "activitiesPage": 264
  },
  "PS.01.01.01": {
    "code": "PS.01.01.01",
    "title": "Selección, contratación e inducción de personal administrativo",
    "startPage": 10,
    "endPage": 17,
    "pageCount": 8,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "10 a 17",
    "activitiesPage": 12
  },
  "PS.01.01.02": {
    "code": "PS.01.01.02",
    "title": "Evaluación del personal administrativo",
    "startPage": 18,
    "endPage": 23,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v3.0",
    "rangeText": "18 a 23",
    "activitiesPage": 21
  },
  "PS 01.01.02": {
    "code": "PS.01.01.02",
    "title": "Evaluación del personal administrativo",
    "startPage": 18,
    "endPage": 23,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v3.0",
    "rangeText": "18 a 23",
    "activitiesPage": 21
  },
  "PS.01.02.01": {
    "code": "PS.01.02.01",
    "title": "Capacitación del personal administrativo",
    "startPage": 24,
    "endPage": 30,
    "pageCount": 7,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "24 a 30",
    "activitiesPage": 27
  },
  "PS.02.01.01": {
    "code": "PS.02.01.01",
    "title": "Adquisición de material bibliográfico comprado",
    "startPage": 31,
    "endPage": 36,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "31 a 36",
    "activitiesPage": 33
  },
  "PS.02.01.02": {
    "code": "PS.02.01.02",
    "title": "Adquisición de material bibliográfico donado",
    "startPage": 37,
    "endPage": 42,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "37 a 42",
    "activitiesPage": 39
  },
  "PS.02.01.03": {
    "code": "PS.02.01.03",
    "title": "Préstamo de material bibliográfico",
    "startPage": 43,
    "endPage": 48,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "43 a 48",
    "activitiesPage": 45
  },
  "PS.02.01.04": {
    "code": "PS.02.01.04",
    "title": "Acceso a base de datos",
    "startPage": 49,
    "endPage": 54,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "49 a 54",
    "activitiesPage": 51
  },
  "PS.02.02.01": {
    "code": "PS.02.02.01",
    "title": "Publicación en repositorio de tesis e investigaciones",
    "startPage": 55,
    "endPage": 60,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "55 a 60",
    "activitiesPage": 57
  },
  "PS.03.01.01": {
    "code": "PS.03.01.01",
    "title": "Elaboración de proyectos de inversión por recursos propios",
    "startPage": 61,
    "endPage": 66,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "61 a 66",
    "activitiesPage": 63
  },
  "PS.03.01.02": {
    "code": "PS.03.01.02",
    "title": "Elaboración de proyectos de inversión por tercerización",
    "startPage": 67,
    "endPage": 73,
    "pageCount": 7,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "67 a 73",
    "activitiesPage": 70
  },
  "PS.03.01.03": {
    "code": "PS.03.01.03",
    "title": "Ejecución de proyectos de inversión",
    "startPage": 74,
    "endPage": 79,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "74 a 79",
    "activitiesPage": 76
  },
  "PS.03.01.04": {
    "code": "PS.03.01.04",
    "title": "Liquidación y cierre de proyectos de inversión",
    "startPage": 80,
    "endPage": 85,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "80 a 85",
    "activitiesPage": 82
  },
  "PS.03.02.01": {
    "code": "PS.03.02.01",
    "title": "Inventario de bienes patrimoniales",
    "startPage": 86,
    "endPage": 92,
    "pageCount": 7,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "86 a 92",
    "activitiesPage": 88
  },
  "PS.03.03.01": {
    "code": "PS.03.03.01",
    "title": "Mantenimiento de infraestructura",
    "startPage": 93,
    "endPage": 98,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "93 a 98",
    "activitiesPage": 95
  },
  "PS.03.03.02": {
    "code": "PS.03.03.02",
    "title": "Mantenimiento y reposición de equipos, máquinas e instrumentos",
    "startPage": 99,
    "endPage": 104,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "99 a 104",
    "activitiesPage": 101
  },
  "PS.04.01.01": {
    "code": "PS.04.01.01",
    "title": "Desarrollo, mejora e implementación de soluciones tecnológicas",
    "startPage": 105,
    "endPage": 114,
    "pageCount": 10,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "105 a 114",
    "activitiesPage": 107
  },
  "PS.04.02.01": {
    "code": "PS.04.02.01",
    "title": "Gestión de licencias de software y servicios",
    "startPage": 115,
    "endPage": 120,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "115 a 120",
    "activitiesPage": 117
  },
  "PS.04.02.02": {
    "code": "PS.04.02.02",
    "title": "Gestión de servidores",
    "startPage": 121,
    "endPage": 126,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "121 a 126",
    "activitiesPage": 123
  },
  "PS.04.02.03": {
    "code": "PS.04.02.03",
    "title": "Gestión de comunicaciones",
    "startPage": 127,
    "endPage": 132,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "127 a 132",
    "activitiesPage": 129
  },
  "PS.04.02.04": {
    "code": "PS.04.02.04",
    "title": "Mantenimiento de equipos, redes y comunicaciones",
    "startPage": 133,
    "endPage": 139,
    "pageCount": 7,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "133 a 139",
    "activitiesPage": 135
  },
  "PS.04.03.01": {
    "code": "PS.04.03.01",
    "title": "Asistencia a usuarios",
    "startPage": 140,
    "endPage": 145,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "140 a 145",
    "activitiesPage": 142
  },
  "PS.04.03.02": {
    "code": "PS.04.03.02",
    "title": "Atención de incidencias a usuarios",
    "startPage": 146,
    "endPage": 151,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "146 a 151",
    "activitiesPage": 148
  },
  "PS.05.01.01": {
    "code": "PS.05.01.01",
    "title": "Gestión de ingresos",
    "startPage": 152,
    "endPage": 157,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "152 a 157",
    "activitiesPage": 154
  },
  "PS.05.01.02": {
    "code": "PS.05.01.02",
    "title": "Gestión de pagos",
    "startPage": 158,
    "endPage": 163,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "158 a 163",
    "activitiesPage": 160
  },
  "PS.05.01.03": {
    "code": "PS.05.01.03",
    "title": "Manejo de caja chica",
    "startPage": 164,
    "endPage": 169,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "164 a 169",
    "activitiesPage": 166
  },
  "PS.05.02.01": {
    "code": "PS.05.02.01",
    "title": "Registro contable de operaciones",
    "startPage": 170,
    "endPage": 175,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "170 a 175",
    "activitiesPage": 172
  },
  "PS.05.02.02": {
    "code": "PS.05.02.02",
    "title": "Preparación de estados financieros",
    "startPage": 176,
    "endPage": 181,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "176 a 181",
    "activitiesPage": 178
  },
  "PS.05.03.01": {
    "code": "PS.05.03.01",
    "title": "Adquisición de bienes, servicios y obras por proceso de selección",
    "startPage": 182,
    "endPage": 188,
    "pageCount": 7,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "182 a 188",
    "activitiesPage": 185
  },
  "PS.05.03.02": {
    "code": "PS.05.03.02",
    "title": "Adquisición de bienes, servicios y obras por proceso directo",
    "startPage": 189,
    "endPage": 195,
    "pageCount": 7,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "189 a 195",
    "activitiesPage": 191
  },
  "PS.05.04.01": {
    "code": "PS.05.04.01",
    "title": "Obtención y actualización de licencias y títulos de propiedad",
    "startPage": 196,
    "endPage": 201,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "196 a 201",
    "activitiesPage": 198
  },
  "PS.05.04.02": {
    "code": "PS.05.04.02",
    "title": "Verificación y aseguramiento de servicios públicos",
    "startPage": 202,
    "endPage": 207,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "202 a 207",
    "activitiesPage": 204
  },
  "PS.05.04.03": {
    "code": "PS.05.04.03",
    "title": "Aseguramiento de servicios de seguridad y vigilancia",
    "startPage": 208,
    "endPage": 213,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "208 a 213",
    "activitiesPage": 210
  },
  "PS.06.01.01": {
    "code": "PS.06.01.01",
    "title": "Asesoría y revisión legal",
    "startPage": 214,
    "endPage": 219,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "214 a 219",
    "activitiesPage": 216
  },
  "PS.06.02.01": {
    "code": "PS.06.02.01",
    "title": "Gestión de procesos jurídicos",
    "startPage": 220,
    "endPage": 225,
    "pageCount": 6,
    "manual": "Manual de Procedimientos de Soporte v03",
    "rangeText": "220 a 225",
    "activitiesPage": 222
  }
};

export function getProcedureRange(code: string): ProcedureRangeInfo | null {
  if (UPT_PROCEDURE_PAGE_RANGES[code]) {
    return UPT_PROCEDURE_PAGE_RANGES[code];
  }
  const upper = code.toUpperCase().trim();
  for (const [key, val] of Object.entries(UPT_PROCEDURE_PAGE_RANGES)) {
    if (key.toUpperCase() === upper) return val;
  }
  return null;
}

export function getProcedureRangeText(code: string, fallbackPage?: number | string | null): string {
  const range = getProcedureRange(code);
  if (range) {
    return range.rangeText;
  }
  if (fallbackPage) {
    return String(fallbackPage);
  }
  return '1';
}

export function getProcedureActivitiesPage(code: string, fallbackPage?: number | string | null): number {
  const range = getProcedureRange(code);
  if (range && range.activitiesPage) {
    return range.activitiesPage;
  }
  if (fallbackPage) {
    const p = parseInt(String(fallbackPage), 10);
    return isNaN(p) ? 1 : p;
  }
  return 1;
}
