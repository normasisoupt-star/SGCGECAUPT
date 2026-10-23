import React, { useState } from 'react';
import { 
  Network, 
  ArrowRight, 
  ChevronRight, 
  FileText, 
  LineChart, 
  ShieldAlert, 
  Layers
} from 'lucide-react';
import { UPT_PROCESSES } from '../data/initialData';
import { ProcessLevel0, ProcessCategory } from '../types';

interface ProcessMapViewProps {
  onSelectProcessFilter: (processCode: ProcessLevel0) => void;
}

export const ProcessMapView: React.FC<ProcessMapViewProps> = ({ onSelectProcessFilter }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const strategic = UPT_PROCESSES.filter(p => p.category === 'Estratégico');
  const missional = UPT_PROCESSES.filter(p => p.category === 'Misional');
  const support = UPT_PROCESSES.filter(p => p.category === 'Soporte');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wider bg-red-900 text-white font-sans shadow-2xs">
              UPT SGC - NIVEL 0
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Mapa de Procesos Institucional
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Estructura aprobada por Consejo Universitario (Manual de Procesos v03): 13 Procesos Nivel 0, 40 Nivel 1 y 94 Procedimientos.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800">13 Procesos &bull; 94 Procedimientos</span>
        </div>
      </div>

      {/* Diagrama Visual de Interacción: Entradas -> Procesos -> Salidas */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-8">
        {/* Banner de Entradas & Salidas */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
            <div className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
              Entradas del Entorno
            </div>
            <p className="text-slate-600">
              Necesidades de Estudiantes, Sociedad, SUNEDU (CBC), Mercado Laboral y Ley Universitaria N° 30220.
            </p>
          </div>

          <div className="md:col-span-6 flex items-center justify-center gap-2 text-center text-xs font-bold text-slate-500">
            <div className="h-0.5 flex-1 bg-slate-200"></div>
            <span>CICLO DE GESTIÓN EDUCATIVA PHVA</span>
            <div className="h-0.5 flex-1 bg-slate-200"></div>
          </div>

          <div className="md:col-span-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1 text-right">
            <div className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
              Satisfacción de Partes Interesadas
            </div>
            <p className="text-slate-600">
              Egresados competentes, investigación con impacto social, patentes y formación humanista integral.
            </p>
          </div>
        </div>

        {/* 1. PROCESOS ESTRATÉGICOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <span>1. Procesos Estratégicos (04 Procesos &bull; 25 Procedimientos)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Dirección, Calidad, Riesgos y Convenios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {strategic.map((proc) => (
              <div
                key={proc.code}
                onClick={() => onSelectProcessFilter(proc.code as ProcessLevel0)}
                className="p-4 rounded-2xl border border-purple-100 bg-purple-50/30 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wider bg-purple-900 text-white font-sans shadow-2xs">
                    {proc.code}
                  </span>
                  <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{proc.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{proc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. PROCESOS MISIONALES (El Corazón Académico) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>2. Procesos Misionales (03 Procesos &bull; 35 Procedimientos)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Razón de ser de la Universidad Privada de Tacna</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {missional.map((proc) => (
              <div
                key={proc.code}
                onClick={() => onSelectProcessFilter(proc.code as ProcessLevel0)}
                className="p-5 rounded-2xl border-2 border-red-200 bg-red-50/20 hover:bg-red-50/60 hover:border-red-400 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wider bg-red-900 text-white font-sans shadow-2xs">
                    {proc.code}
                  </span>
                  <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="font-bold text-slate-900 text-base leading-snug">{proc.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{proc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. PROCESOS DE SOPORTE */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>3. Procesos de Soporte (06 Procesos &bull; 34 Procedimientos)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Recursos humanos, infraestructura, TI, finanzas y legal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {support.map((proc) => (
              <div
                key={proc.code}
                onClick={() => onSelectProcessFilter(proc.code as ProcessLevel0)}
                className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wider bg-blue-900 text-white font-sans shadow-2xs">
                    {proc.code}
                  </span>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{proc.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{proc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
