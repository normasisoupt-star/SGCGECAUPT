import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowRight,
  ArrowUpDown,
  ArrowLeftRight,
  Lock,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Info,
  ThumbsUp,
} from 'lucide-react';
import { UPT_PROCESSES, UPT_DOCUMENTS } from '../data/initialData';
import { ProcessLevel0, UserProfile } from '../types';
import { resolveUserOrganizationUnit } from '../data/organizationHierarchy';

interface ProcessMapViewProps {
  onSelectProcessFilter: (processCode: ProcessLevel0) => void;
  activeUser?: UserProfile;
  isAdmin?: boolean;
}

const PROCESS_METADATA: Record<
  ProcessLevel0,
  {
    manualTitle: string;
    shortDesc: string;
    responsibleLabel: string;
  }
> = {
  'PE.01': {
    manualTitle: 'Gestión del Planeamiento Institucional',
    shortDesc: 'Plan Estratégico, POA, presupuesto operativo, modelo educativo y políticas rectoras.',
    responsibleLabel: 'Oficinas: RECTORADO / VRAC / DIGA / OPLA / GPAD / GECA',
  },
  'PE.02': {
    manualTitle: 'Gestión de la Calidad',
    shortDesc: 'Auditorías internas, mejora continua, revisión por la dirección y certificación ISO 21001/9001.',
    responsibleLabel: 'Oficinas: GECA / AJUL',
  },
  'PE.03': {
    manualTitle: 'Gestión de Riesgos Institucionales',
    shortDesc: 'Matriz de riesgos organizacionales, seguridad y salud ocupacional (IPERC) y continuidad operacional.',
    responsibleLabel: 'Oficinas: GECA / AIMA / APHU / TEIN',
  },
  'PE.04': {
    manualTitle: 'Gestión Interinstitucional',
    shortDesc: 'Convenios nacionales e internacionales, movilidad académica, cooperación e imagen institucional.',
    responsibleLabel: 'Oficinas: RENI / IMAI',
  },
  'PM.01': {
    manualTitle: 'Formación Integral de Pregrado y Postgrado',
    shortDesc: 'Diseño curricular, admisión, matrícula, docencia universitaria, evaluación del aprendizaje, bienestar, titulación y seguimiento al graduado en facultades y escuela de posgrado UPT.',
    responsibleLabel: 'Oficinas: ADMA / FACULTADES / SEGE / RENI / OBUN / RESU',
  },
  'PM.02': {
    manualTitle: 'Investigación, Desarrollo, Innovación y Emprendimiento',
    shortDesc: 'Proyectos científicos, semilleros, patentes, publicaciones indizadas e incubadora de empresas.',
    responsibleLabel: 'Oficina: PITT',
  },
  'PM.03': {
    manualTitle: 'Responsabilidad Social Universitaria',
    shortDesc: 'Extensión cultural, voluntariado, proyectos de impacto comunitario y gestión ambiental en Tacna.',
    responsibleLabel: 'Oficinas: RESU / AIMA',
  },
  'PS.01': {
    manualTitle: 'Gestión de Potencial Humano',
    shortDesc: 'Selección, contratación, inducción, capacitación docente/administrativa y clima laboral.',
    responsibleLabel: 'Área: APHU',
  },
  'PS.02': {
    manualTitle: 'Gestión de Centros de Información',
    shortDesc: 'Bibliotecas físicas, repositorio institucional de tesis y bases de datos científicas.',
    responsibleLabel: 'Oficina: BISA',
  },
  'PS.03': {
    manualTitle: 'Gestión de Infraestructura y Patrimonio',
    shortDesc: 'Proyectos de inversión, inventario patrimonial y mantenimiento de campus Capanique y equipos.',
    responsibleLabel: 'Áreas: AIMA / ALOG / Patrimonio',
  },
  'PS.04': {
    manualTitle: 'Gestión de las Tecnologías de Información y Comunicación',
    shortDesc: 'Desarrollo de software, aulas virtuales, servidores, redes UPT, licencias y soporte TI.',
    responsibleLabel: 'Oficina: TEIN',
  },
  'PS.05': {
    manualTitle: 'Gestión Administrativa y Financiera',
    shortDesc: 'Tesorería, contabilidad, adquisiciones por selección/directo y servicios institucionales.',
    responsibleLabel: 'Áreas: AIMA / ALOG / Tesorería / Contabilidad',
  },
  'PS.06': {
    manualTitle: 'Gestión Legal',
    shortDesc: 'Asesoría jurídica, revisión de actos institucionales, resoluciones y defensa de procesos legales.',
    responsibleLabel: 'Oficina: AJUL',
  },
};

export const ProcessMapView: React.FC<ProcessMapViewProps> = ({
  onSelectProcessFilter,
  activeUser,
  isAdmin = false,
}) => {
  const unit = activeUser ? resolveUserOrganizationUnit(activeUser) : undefined;
  const allowedProcesses =
    !isAdmin && unit && unit.processCodes.length > 0 ? unit.processCodes : null;

  const isProcessEnabled = (code: ProcessLevel0): boolean => {
    if (isAdmin || !allowedProcesses) return true;
    return allowedProcesses.includes(code);
  };

  const getProcedureCountForProcess = (code: ProcessLevel0): number => {
    if (!isAdmin && unit && unit.consolidatedProcedures.length > 0) {
      return unit.consolidatedProcedures.filter((procCode) => procCode.includes(code)).length;
    }
    return UPT_DOCUMENTS.filter(
      (doc) => doc.processCode === code && doc.documentType === 'Procedimiento'
    ).length;
  };

  const totalEnabled = UPT_PROCESSES.filter((p) => isProcessEnabled(p.code as ProcessLevel0)).length;
  const totalDimmed = UPT_PROCESSES.length - totalEnabled;

  const renderProcessCard = (
    code: ProcessLevel0,
    variant: 'strategic' | 'missional-main' | 'missional-sub' | 'support'
  ) => {
    const meta = PROCESS_METADATA[code];
    const enabled = isProcessEnabled(code);
    const procCount = getProcedureCountForProcess(code);

    const badgeBg = !enabled
      ? 'bg-[#8e959e] text-white'
      : variant === 'missional-main'
      ? 'bg-[#800020] text-white'
      : variant === 'support'
      ? 'bg-slate-800 text-white'
      : 'bg-[#0d2d3f] text-white';

    return (
      <div
        key={code}
        onClick={() => {
          if (enabled) {
            onSelectProcessFilter(code);
          }
        }}
        title={
          enabled
            ? `Haga clic para ver los procedimientos de ${code} - ${meta.manualTitle}`
            : `Modo solo lectura — Proceso correspondiente a otra dependencia (${meta.responsibleLabel})`
        }
        className={`rounded-2xl p-4 transition-all duration-300 relative flex flex-col justify-between group ${
          enabled
            ? variant === 'missional-main'
              ? 'bg-gradient-to-r from-white via-amber-50/40 to-white border-2 border-[#9C7D0F] ring-2 ring-[#9C7D0F]/20 shadow-[0_16px_34px_-6px_rgba(13,45,63,0.24),0_6px_16px_-4px_rgba(156,125,15,0.32)] -translate-y-1 hover:-translate-y-1.5 hover:shadow-[0_22px_42px_-6px_rgba(13,45,63,0.30),0_8px_20px_-4px_rgba(156,125,15,0.42)] cursor-pointer z-10'
              : 'bg-white border-2 border-[#9C7D0F] ring-2 ring-[#9C7D0F]/20 shadow-[0_14px_30px_-6px_rgba(13,45,63,0.22),0_6px_14px_-4px_rgba(156,125,15,0.28)] -translate-y-1 hover:-translate-y-1.5 hover:shadow-[0_20px_38px_-6px_rgba(13,45,63,0.28),0_8px_18px_-4px_rgba(156,125,15,0.38)] cursor-pointer z-10'
            : 'bg-white border-2 border-[#0d2d3f]/75 shadow-2xs cursor-default'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs font-black px-2.5 py-0.5 rounded shadow-2xs ${badgeBg}`}
              >
                {code}
              </span>
              {variant === 'missional-main' && (
                <span className="text-[11px] font-extrabold text-[#800020] uppercase tracking-wider">
                  Eje Formativo Central
                </span>
              )}
            </div>

            {enabled ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Habilitado ({procCount})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                <Lock className="w-2.5 h-2.5 text-slate-500" />
                <span>Solo lectura</span>
              </span>
            )}
          </div>

          <h3
            className={`font-bold text-[#0d2d3f] leading-snug ${
              variant === 'missional-main' ? 'text-base font-black' : 'text-xs md:text-sm'
            }`}
          >
            {meta.manualTitle}
          </h3>

          <p
            className={`text-slate-600 mt-1.5 leading-relaxed ${
              variant === 'missional-main' ? 'text-xs' : 'text-[11px] line-clamp-2'
            }`}
          >
            {meta.shortDesc}
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] gap-2">
          <span
            className={`font-bold leading-snug ${
              !enabled
                ? 'text-[#0d2d3f]/80'
                : variant === 'missional-main'
                ? 'text-[#0d2d3f] text-xs'
                : 'text-[#9C7D0F]'
            }`}
          >
            {meta.responsibleLabel}
          </span>
          {enabled ? (
            <span className="inline-flex items-center gap-0.5 font-bold text-[#0d2d3f] group-hover:translate-x-0.5 transition-transform shrink-0">
              <span>Ver</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span className="text-slate-500 font-medium shrink-0">🔒 Otra área</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-[1680px] mx-auto">
      {/* SUBHEADER INSTITUCIONAL ESTILO STITCH */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0d2d3f]/10 border border-[#0d2d3f]/20 flex items-center justify-center text-[#0d2d3f] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#0d2d3f] tracking-tight font-outfit uppercase">
                Mapa de Procesos Institucional SGC-UPT
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#0d2d3f] text-white font-mono">
                EDICIÓN VIGENTE • MANUAL PÁG. 12
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Estructura jerárquica de interrelación por niveles de macroprocesos conforme a las normas técnicas internacionales{' '}
              <strong className="text-[#0d2d3f] font-semibold">ISO 21001:2025</strong> e{' '}
              <strong className="text-[#0d2d3f] font-semibold">ISO 9001:2015</strong>.
              {!isAdmin && unit && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-[#9C7D0F] border border-amber-200 font-bold text-[11px]">
                  Resaltando procesos de: {unit.displayName}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Leyenda y Contador */}
        <div className="flex items-center flex-wrap gap-3 text-xs bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-2xs"></span>
            <span className="font-bold text-slate-700">{totalEnabled} Habilitados</span>
          </div>
          <div className="h-3 w-px bg-slate-300"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#0d2d3f]/75 border border-white"></span>
            <span className="font-medium text-slate-600">{totalDimmed} Solo lectura</span>
          </div>
          <div className="h-3 w-px bg-slate-300"></div>
          <div className="flex items-center gap-1 text-slate-600">
            <span className="font-bold text-[#9C7D0F]">Total:</span>
            <span className="font-mono font-semibold">
              4 Estratégicos • 3 Misionales • 6 Soporte
            </span>
          </div>
        </div>
      </div>

      {/* LIENZO PRINCIPAL DEL MAPA DE PROCESOS (PÁGINA 12 DEL MANUAL SGC) */}
      <div className="bg-gradient-to-br from-white via-white to-slate-50/90 rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[100px_1fr_100px] gap-4 items-stretch">
          {/* ======================================================== */}
          {/* 1. COLUMNA VERTICAL IZQUIERDA: ENTRADAS DEL ENTORNO      */}
          {/* ======================================================== */}
          <div className="flex xl:flex-row items-center gap-2">
            <div className="w-full xl:w-16 bg-gradient-to-b from-[#0d2d3f] via-[#184762] to-[#0d2d3f] text-white rounded-2xl p-3 shadow-lg border border-[#9C7D0F]/40 flex flex-row xl:flex-col items-center justify-between min-h-[72px] xl:min-h-full">
              <div className="w-7 h-7 rounded-full bg-[#9C7D0F]/30 flex items-center justify-center text-[#caa424] border border-[#9C7D0F]/50 shrink-0">
                <ArrowDown className="w-4 h-4" />
              </div>

              <div className="xl:[writing-mode:vertical-rl] xl:rotate-180 font-black tracking-[0.16em] text-xs sm:text-sm text-center uppercase text-slate-100 py-2 px-2 xl:px-0 select-none">
                NECESIDADES Y EXPECTATIVAS DE LAS PARTES INTERESADAS
              </div>

              <div className="w-7 h-7 rounded-full bg-[#9C7D0F]/30 flex items-center justify-center text-[#caa424] border border-[#9C7D0F]/50 shrink-0">
                <Info className="w-4 h-4" />
              </div>
            </div>

            {/* Flecha de Entrada hacia el Marco Central */}
            <div className="hidden xl:flex flex-col items-center justify-center text-[#9C7D0F] shrink-0">
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
              <span className="text-[9px] font-extrabold uppercase tracking-tighter text-[#0d2d3f]">
                ENTRADA
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. MARCO CENTRAL: TRES BLOQUES DE MACROPROCESOS          */}
          {/* ======================================================== */}
          <div className="flex flex-col space-y-3.5">
            {/* NIVEL A: PROCESOS ESTRATÉGICOS (4 CAJAS HORIZONTALES) */}
            <div className="rounded-2xl border border-[#9C7D0F]/40 bg-gradient-to-r from-[#f6eedb]/45 via-white to-[#f6eedb]/35 p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-[#9C7D0F]/25 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#9C7D0F] shadow-2xs"></span>
                  <h2 className="font-extrabold text-sm md:text-base text-[#0d2d3f] tracking-wide uppercase flex flex-wrap items-center gap-2">
                    <span>PROCESOS ESTRATÉGICOS</span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0d2d3f]/10 text-[#0d2d3f]">
                      NIVEL DIRECTIVO Y CALIDAD
                    </span>
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-[#9C7D0F] font-mono">
                  4 Procesos Institucionales
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {renderProcessCard('PE.01', 'strategic')}
                {renderProcessCard('PE.02', 'strategic')}
                {renderProcessCard('PE.03', 'strategic')}
                {renderProcessCard('PE.04', 'strategic')}
              </div>
            </div>

            {/* FLECHA VERTICAL: ESTRATÉGICOS -> MISIONALES */}
            <div className="flex items-center justify-center -my-1.5 z-20">
              <div className="bg-[#0d2d3f] text-[#f6eedb] px-4 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-md border border-[#9C7D0F]/40">
                <span>Directrices Estratégicas</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#caa424]" />
              </div>
            </div>

            {/* NIVEL B: PROCESOS MISIONALES (ESTRUCTURA TRIANGULAR PÁG. 12) */}
            <div className="rounded-2xl border-2 border-[#0d2d3f]/25 bg-gradient-to-b from-[#0d2d3f]/[0.03] via-white to-[#0d2d3f]/[0.02] p-4 sm:p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-[#0d2d3f]/15 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#800020] shadow-2xs"></span>
                  <h2 className="font-black text-sm md:text-base text-[#0d2d3f] tracking-wide uppercase flex flex-wrap items-center gap-2">
                    <span>PROCESOS MISIONALES (CADENA DE VALOR)</span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#800020]/10 text-[#800020]">
                      ESENCIA ACADÉMICA UPT
                    </span>
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-[#800020] font-mono">
                  3 Procesos Clave
                </span>
              </div>

              {/* Disposición Triangular Oficial (PM.01 arriba al centro, PM.02 y PM.03 abajo conectados) */}
              <div className="max-w-5xl mx-auto flex flex-col items-center">
                {/* Cúspide del Triángulo: PM.01 */}
                <div className="w-full max-w-2xl">
                  {renderProcessCard('PM.01', 'missional-main')}
                </div>

                {/* Doble Conector Vertical (PM.01 <-> PM.02 y PM.01 <-> PM.03) */}
                <div className="w-full max-w-xl flex items-center justify-between px-10 sm:px-20 my-2 text-[#0d2d3f]">
                  <div className="flex flex-col items-center">
                    <ArrowUpDown className="w-5 h-5 text-[#9C7D0F]" />
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      I+D+i ↔ Docencia
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowUpDown className="w-5 h-5 text-[#9C7D0F]" />
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      RSU ↔ Docencia
                    </span>
                  </div>
                </div>

                {/* Base del Triángulo: PM.02 (Izquierda) <-> PM.03 (Derecha) */}
                <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {renderProcessCard('PM.02', 'missional-sub')}

                  <div className="hidden md:flex flex-col items-center justify-center px-2.5 py-1.5 bg-white rounded-xl border border-[#9C7D0F]/35 shadow-2xs">
                    <ArrowLeftRight className="w-5 h-5 text-[#9C7D0F]" />
                    <span className="text-[9px] font-bold font-mono text-[#0d2d3f] uppercase tracking-tighter mt-0.5">
                      Sinergia
                    </span>
                  </div>

                  {renderProcessCard('PM.03', 'missional-sub')}
                </div>
              </div>
            </div>

            {/* FLECHA VERTICAL: SOPORTE -> MISIONALES (HACIA ARRIBA) */}
            <div className="flex items-center justify-center -my-1.5 z-20">
              <div className="bg-[#0d2d3f] text-[#f6eedb] px-4 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-md border border-[#9C7D0F]/40">
                <ArrowUp className="w-3.5 h-3.5 text-[#caa424]" />
                <span>Recursos y Soporte Operativo Integral</span>
              </div>
            </div>

            {/* NIVEL C: PROCESOS DE SOPORTE (CUADRÍCULA 2 FILAS × 3 COLUMNAS) */}
            <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-slate-100/90 via-white to-slate-100/90 p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-700 shadow-2xs"></span>
                  <h2 className="font-extrabold text-sm md:text-base text-[#0d2d3f] tracking-wide uppercase flex flex-wrap items-center gap-2">
                    <span>PROCESOS DE SOPORTE</span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      6 MACROPROCESOS DE APOYO
                    </span>
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 font-mono">
                  Cuadrícula 2 × 3
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {renderProcessCard('PS.01', 'support')}
                {renderProcessCard('PS.02', 'support')}
                {renderProcessCard('PS.03', 'support')}
                {renderProcessCard('PS.04', 'support')}
                {renderProcessCard('PS.05', 'support')}
                {renderProcessCard('PS.06', 'support')}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. COLUMNA VERTICAL DERECHA: SATISFACCIÓN PARTES INTER.  */}
          {/* ======================================================== */}
          <div className="flex xl:flex-row items-center gap-2">
            {/* Flecha de Salida desde el Marco Central */}
            <div className="hidden xl:flex flex-col items-center justify-center text-[#9C7D0F] shrink-0">
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
              <span className="text-[9px] font-extrabold uppercase tracking-tighter text-[#0d2d3f]">
                SALIDA
              </span>
            </div>

            <div className="w-full xl:w-16 bg-gradient-to-b from-[#0d2d3f] via-[#184762] to-[#0d2d3f] text-white rounded-2xl p-3 shadow-lg border border-[#9C7D0F]/40 flex flex-row xl:flex-col items-center justify-between min-h-[72px] xl:min-h-full">
              <div className="w-7 h-7 rounded-full bg-[#9C7D0F]/30 flex items-center justify-center text-[#caa424] border border-[#9C7D0F]/50 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div className="xl:[writing-mode:vertical-rl] xl:rotate-180 font-black tracking-[0.16em] text-xs sm:text-sm text-center uppercase text-slate-100 py-2 px-2 xl:px-0 select-none">
                SATISFACCIÓN DE LAS PARTES INTERESADAS
              </div>

              <div className="w-7 h-7 rounded-full bg-[#9C7D0F]/30 flex items-center justify-center text-[#caa424] border border-[#9C7D0F]/50 shrink-0">
                <ThumbsUp className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* PIE DE PÁGINA INSTITUCIONAL */}
        <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#0d2d3f]">Referencia Oficial:</span>
            <span>Manual del Sistema de Gestión de la Calidad SGC-UPT (Pág. 12)</span>
            <span className="text-[#9C7D0F]">•</span>
            <span className="font-mono text-slate-600">13 Procesos Nivel 0 y 94 Procedimientos</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#9C7D0F] mr-1.5"></span>
              Enfoque basado en Procesos y Riesgos
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
              Ciclo PHVA Integrado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
