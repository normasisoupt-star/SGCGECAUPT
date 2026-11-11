// Estructura completa de carpetas SGC UPT para Google Drive
var UPT_STRUCTURE = [
  {
    organ: "01_RECTORADO",
    units: [
      {
        name: "01_REDO_Despacho_Rectoral",
        procs: ["PE.01.01.01 - Gestion de politicas academicas", "PE.01.01.02 - Gestion de politicas administrativas"]
      },
      {
        name: "02_OPLA_Planeamiento_y_Desarrollo",
        procs: [
          "PE.01.02.01 - Formulacion del Plan Estrategico",
          "PE.01.02.02 - Formulacion del presupuesto institucional",
          "PE.01.02.03 - Formulacion del Plan Operativo",
          "PE.01.02.04 - Formulacion del Plan de Trabajo",
          "PE.01.02.05 - Seguimiento y evaluacion de planes"
        ]
      },
      {
        name: "03_SEGE_Secretaria_General",
        procs: ["PM.01.04.01 - Emision de grados y titulos"]
      },
      {
        name: "04_AJUL_Asesoria_Juridica",
        procs: [
          "PS.06.01.01 - Asesoria juridica y legal",
          "PS.06.02.01 - Atencion de procesos judiciales",
          "PE.02.01.04 - Evaluacion del cumplimiento de la normativa"
        ]
      },
      {
        name: "05_DIGA_Direccion_Administracion",
        procs: ["PE.01.01.01 - Gestion de politicas academicas", "PE.01.01.02 - Gestion de politicas administrativas"]
      },
      {
        name: "05A_DIGA_AIMA_Infraestructura",
        procs: [
          "PE.03.02.01 - Gestion de riesgos y desastres",
          "PM.03.03.01 - Gestion ambiental",
          "PS.03.03.01 - Mantenimiento de infraestructura",
          "PS.03.03.02 - Mantenimiento de equipos",
          "PS.05.04.01 - Programacion de gastos operativos",
          "PS.05.04.02 - Ejecucion de gastos operativos",
          "PS.05.04.03 - Rendicion de gastos operativos"
        ]
      },
      {
        name: "05B_DIGA_ALOG_Logistica",
        procs: [
          "PS.03.01.01 - Requerimiento de bienes y servicios",
          "PS.03.01.02 - Adquisicion y contrataciones",
          "PS.03.01.03 - Recepcion y almacenamiento",
          "PS.03.01.04 - Distribucion de bienes",
          "PS.05.03.01 - Evaluacion de proveedores",
          "PS.05.03.02 - Registro de proveedores"
        ]
      },
      {
        name: "05C_DIGA_Patrimonio",
        procs: ["PS.03.02.01 - Control patrimonial e inventarios"]
      },
      {
        name: "05D_DIGA_APHU_Potencial_Humano",
        procs: [
          "PE.03.02.02 - Gestion de seguridad y salud en el trabajo",
          "PS.01.01.01 - Reclutamiento y seleccion de personal",
          "PS.01.01.02 - Contratacion e induccion de personal",
          "PS.01.02.01 - Evaluacion y capacitacion de personal"
        ]
      },
      {
        name: "05E_DIGA_Tesoreria",
        procs: [
          "PS.05.01.01 - Recaudacion de ingresos",
          "PS.05.01.02 - Pagos y transferencias",
          "PS.05.01.03 - Arqueo y conciliacion de fondos"
        ]
      },
      {
        name: "05F_DIGA_Contabilidad",
        procs: [
          "PS.05.02.01 - Registro y control contable",
          "PS.05.02.02 - Elaboracion de estados financieros"
        ]
      },
      {
        name: "06_TEIN_Tecnologia_Informacion",
        procs: [
          "PE.03.02.03 - Gestion de la seguridad informatica",
          "PS.04.01.01 - Desarrollo y mantenimiento de software",
          "PS.04.02.01 - Soporte tecnico y atencion a usuarios",
          "PS.04.02.02 - Gestion de redes y telecomunicaciones",
          "PS.04.02.03 - Administracion de servidores y base de datos",
          "PS.04.02.04 - Copias de seguridad y recuperacion",
          "PS.04.03.01 - Gestion de accesos y credenciales",
          "PS.04.03.02 - Gestion de licencias de software"
        ]
      },
      {
        name: "07_RENI_Relaciones_Nacionales_Int",
        procs: [
          "PE.04.01.01 - Gestion de convenios interinstitucionales",
          "PM.01.05.01 - Movilidad academica e internacionalizacion"
        ]
      },
      {
        name: "08_GECA_Gestion_de_la_Calidad",
        procs: [
          "PE.01.04.01 - Creacion de carreras o programas",
          "PE.01.04.02 - Supresion de carreras o programas",
          "PE.01.04.03 - Modificacion de denominacion",
          "PE.02.01.01 - Revision del sistema de gestion",
          "PE.02.01.02 - Gestion de Informacion Documentada",
          "PE.02.01.03 - Medicion y seguimiento de la satisfaccion",
          "PE.02.02.01 - Auditorias internas de calidad",
          "PE.02.03.01 - Evaluacion del desempeno institucional",
          "PE.02.04.01 - Gestion del riesgo institucional",
          "PE.02.04.02 - No conformidades y acciones correctivas",
          "PE.03.01.01 - Gestion de riesgos integrales"
        ]
      },
      {
        name: "09_IMAI_Imagen_Institucional",
        procs: ["PE.04.02.01 - Gestion de imagen y comunicacion"]
      }
    ]
  },
  {
    organ: "02_VRAC",
    units: [
      {
        name: "01_VRAC_Despacho_Vicerrectorado",
        procs: ["PE.01.01.01 - Gestion de politicas academicas", "PE.01.01.02 - Gestion de politicas administrativas"]
      },
      {
        name: "02_GPAD_Procesos_Academicos",
        procs: ["PE.01.03.01 - Diseno y actualizacion del Modelo Educativo"]
      },
      {
        name: "03_ADMA_Admision_y_Marketing",
        procs: ["PM.01.01.01 - Admision a pregrado y posgrado"]
      },
      {
        name: "04_OBUN_Bienestar_Universitario",
        procs: [
          "PM.01.06.01 - Servicio social y orientacion",
          "PM.01.06.02 - Atencion medica y preventiva",
          "PM.01.06.03 - Atencion psicopedagogica",
          "PM.01.06.04 - Actividades deportivas y recreativas",
          "PM.01.06.05 - Actividades culturales",
          "PM.01.06.06 - Comedor universitario",
          "PM.01.06.07 - Becas y estimulos",
          "PM.01.06.08 - Prevencion y atencion del acoso",
          "PM.01.06.09 - Seguimiento de egresados y bolsa",
          "PM.01.06.10 - Seguro universitario contra accidentes"
        ]
      },
      {
        name: "05_RESU_Responsabilidad_Social",
        procs: [
          "PM.01.04.02 - Seguimiento al egresado",
          "PM.03.01.01 - Proyectos de extension cultural",
          "PM.03.01.02 - Proyectos de proyeccion social",
          "PM.03.02.01 - Voluntariado universitario"
        ]
      }
    ]
  },
  {
    organ: "03_VRIN",
    units: [
      {
        name: "01_VRIN_Despacho_Investigacion",
        procs: []
      },
      {
        name: "02_PITT_Investigacion_y_Transf",
        procs: [
          "PM.02.01.01 - Fondos concursables de investigacion",
          "PM.02.01.02 - Proyectos de investigacion docente",
          "PM.02.01.03 - Semilleros y circulos de investigacion",
          "PM.02.01.04 - Publicacion cientifica en revistas",
          "PM.02.01.05 - Registro y evaluacion de investigadores",
          "PM.02.02.01 - Propiedad intelectual y patentes"
        ]
      },
      {
        name: "03_BISA_Biblioteca",
        procs: [
          "PS.02.01.01 - Prestamo de material bibliografico",
          "PS.02.01.02 - Adquisicion y suscripcion de recursos",
          "PS.02.01.03 - Procesamiento tecnico de colecciones",
          "PS.02.01.04 - Gestion del repositorio institucional",
          "PS.02.02.01 - Servicios de hemeroteca y salas"
        ]
      }
    ]
  },
  {
    organ: "04_FACULTADES",
    units: [
      {
        name: "01_FAING_Facultad_Ingenieria",
        procs: [
          "PM.01.01.02 - Nivelacion de Estudiantes Ingresantes",
          "PM.01.02.01 - Diseno y Adecuacion Curricular",
          "PM.01.02.02 - Elaboracion del Silabo",
          "PM.01.03.01 - Planificacion de la Ensenanza",
          "PM.01.03.02 - Matricula",
          "PM.01.03.03 - Desarrollo de la Ensenanza Aprendizaje",
          "PM.01.03.04 - Evaluacion de Aprendizaje",
          "PM.01.03.05 - Desarrollo de Practicas Preprofesionales",
          "PM.01.07.01 - Contratacion e Induccion Docente",
          "PM.01.07.02 - Capacitacion Docente",
          "PM.01.07.03 - Evaluacion Docente"
        ]
      },
      {
        name: "02_FACSA_Facultad_Ciencias_Salud",
        procs: [
          "PM.01.01.02 - Nivelacion de Estudiantes Ingresantes",
          "PM.01.02.01 - Diseno y Adecuacion Curricular",
          "PM.01.02.02 - Elaboracion del Silabo",
          "PM.01.03.01 - Planificacion de la Ensenanza",
          "PM.01.03.02 - Matricula",
          "PM.01.03.03 - Desarrollo de la Ensenanza Aprendizaje",
          "PM.01.03.04 - Evaluacion de Aprendizaje",
          "PM.01.03.05 - Desarrollo de Practicas Preprofesionales",
          "PM.01.07.01 - Contratacion e Induccion Docente",
          "PM.01.07.02 - Capacitacion Docente",
          "PM.01.07.03 - Evaluacion Docente"
        ]
      },
      {
        name: "03_FACEM_Facultad_Empresariales",
        procs: [
          "PM.01.01.02 - Nivelacion de Estudiantes Ingresantes",
          "PM.01.02.01 - Diseno y Adecuacion Curricular",
          "PM.01.02.02 - Elaboracion del Silabo",
          "PM.01.03.01 - Planificacion de la Ensenanza",
          "PM.01.03.02 - Matricula",
          "PM.01.03.03 - Desarrollo de la Ensenanza Aprendizaje",
          "PM.01.03.04 - Evaluacion de Aprendizaje",
          "PM.01.03.05 - Desarrollo de Practicas Preprofesionales",
          "PM.01.07.01 - Contratacion e Induccion Docente",
          "PM.01.07.02 - Capacitacion Docente",
          "PM.01.07.03 - Evaluacion Docente"
        ]
      },
      {
        name: "04_FAEDCOH_Facultad_Educacion",
        procs: [
          "PM.01.01.02 - Nivelacion de Estudiantes Ingresantes",
          "PM.01.02.01 - Diseno y Adecuacion Curricular",
          "PM.01.02.02 - Elaboracion del Silabo",
          "PM.01.03.01 - Planificacion de la Ensenanza",
          "PM.01.03.02 - Matricula",
          "PM.01.03.03 - Desarrollo de la Ensenanza Aprendizaje",
          "PM.01.03.04 - Evaluacion de Aprendizaje",
          "PM.01.03.05 - Desarrollo de Practicas Preprofesionales",
          "PM.01.07.01 - Contratacion e Induccion Docente",
          "PM.01.07.02 - Capacitacion Docente",
          "PM.01.07.03 - Evaluacion Docente"
        ]
      },
      {
        name: "05_FAU_Facultad_Arquitectura",
        procs: [
          "PM.01.01.02 - Nivelacion de Estudiantes Ingresantes",
          "PM.01.02.01 - Diseno y Adecuacion Curricular",
          "PM.01.02.02 - Elaboracion del Silabo",
          "PM.01.03.01 - Planificacion de la Ensenanza",
          "PM.01.03.02 - Matricula",
          "PM.01.03.03 - Desarrollo de la Ensenanza Aprendizaje",
          "PM.01.03.04 - Evaluacion de Aprendizaje",
          "PM.01.03.05 - Desarrollo de Practicas Preprofesionales",
          "PM.01.07.01 - Contratacion e Induccion Docente",
          "PM.01.07.02 - Capacitacion Docente",
          "PM.01.07.03 - Evaluacion Docente"
        ]
      },
      {
        name: "06_FADE_Facultad_Derecho",
        procs: [
          "PM.01.01.02 - Nivelacion de Estudiantes Ingresantes",
          "PM.01.02.01 - Diseno y Adecuacion Curricular",
          "PM.01.02.02 - Elaboracion del Silabo",
          "PM.01.03.01 - Planificacion de la Ensenanza",
          "PM.01.03.02 - Matricula",
          "PM.01.03.03 - Desarrollo de la Ensenanza Aprendizaje",
          "PM.01.03.04 - Evaluacion de Aprendizaje",
          "PM.01.03.05 - Desarrollo de Practicas Preprofesionales",
          "PM.01.07.01 - Contratacion e Induccion Docente",
          "PM.01.07.02 - Capacitacion Docente",
          "PM.01.07.03 - Evaluacion Docente"
        ]
      }
    ]
  }
];

function doGet(e) {
  if (e && e.parameter && e.parameter.action === "init_tree") {
    var result = initializeFullFolderTree();
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("Servicio Activo del SGC UPT").setMimeType(ContentService.MimeType.TEXT);
}

function initializeFullFolderTree() {
  var root = getOrCreateFolder(DriveApp.getRootFolder(), "SGC_UPT_EVIDENCIAS");
  var year = getOrCreateFolder(root, "2026");
  var countUnits = 0;
  var countProcs = 0;

  for (var i = 0; i < UPT_STRUCTURE.length; i++) {
    var organItem = UPT_STRUCTURE[i];
    var organFolder = getOrCreateFolder(year, organItem.organ);

    for (var j = 0; j < organItem.units.length; j++) {
      var unitItem = organItem.units[j];
      var unitFolder = getOrCreateFolder(organFolder, unitItem.name);
      countUnits++;

      for (var k = 0; k < unitItem.procs.length; k++) {
        var procName = unitItem.procs[k];
        getOrCreateFolder(unitFolder, procName);
        countProcs++;
      }
    }
  }

  return { status: "success", units: countUnits, procs: countProcs };
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // ACCIÓN: ELIMINAR / TRASH (Mover a la papelera de Google Drive)
    if (data.action === "delete" || data.action === "trash") {
      var deleted = false;
      // 1. Si tenemos el fileId directo
      if (data.fileId) {
        try {
          var targetFile = DriveApp.getFileById(data.fileId);
          targetFile.setTrashed(true);
          deleted = true;
        } catch (fErr) {}
      }

      // 2. Si no se borró por ID o no venía ID, buscar por ruta y nombre
      if (!deleted && data.fileName) {
        var root = getOrCreateFolder(DriveApp.getRootFolder(), "SGC_UPT_EVIDENCIAS");
        var yearFolder = getOrCreateFolder(root, "2026");
        var parts = (data.officeName || "01_RECTORADO/08_GECA_Gestion_de_la_Calidad").split("/");
        var organFolder = getOrCreateFolder(yearFolder, parts[0]);
        var unitFolder = parts.length > 1 ? getOrCreateFolder(organFolder, parts[1]) : organFolder;
        var procPrefix = data.procedureCode || "PROCEDIMIENTO";
        var procFolder = getOrCreateFolderMatching(unitFolder, procPrefix);
        var stepPrefix = "Act_" + String(data.step).padStart(2, "0");
        var actFolder = getOrCreateFolderMatching(procFolder, stepPrefix);

        var files = actFolder.getFilesByName(data.fileName);
        while (files.hasNext()) {
          var f = files.next();
          f.setTrashed(true);
          deleted = true;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "trashed",
        deleted: deleted
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACCIÓN: SUBIDA DE ARCHIVO
    var root = getOrCreateFolder(DriveApp.getRootFolder(), "SGC_UPT_EVIDENCIAS");
    var yearFolder = getOrCreateFolder(root, "2026");

    var parts = (data.officeName || "01_RECTORADO/08_GECA_Gestion_de_la_Calidad").split("/");
    var organFolder = getOrCreateFolder(yearFolder, parts[0]);
    var unitFolder = parts.length > 1 ? getOrCreateFolder(organFolder, parts[1]) : organFolder;

    var procPrefix = data.procedureCode || "PROCEDIMIENTO";
    var procFolder = getOrCreateFolderMatching(unitFolder, procPrefix);

    var stepPrefix = "Act_" + String(data.step).padStart(2, "0");
    var actFolder = getOrCreateFolderMatching(procFolder, stepPrefix);

    var base64Data = data.fileData.split(',')[1] || data.fileData;
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, data.mimeType || "application/pdf", data.fileName);
    var file = actFolder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      downloadUrl: file.getDownloadUrl(),
      fileName: file.getName()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(name);
}

function getOrCreateFolderMatching(parent, prefix) {
  var folders = parent.getFolders();
  while (folders.hasNext()) {
    var f = folders.next();
    if (f.getName().indexOf(prefix) === 0) {
      return f;
    }
  }
  return parent.createFolder(prefix);
}
