import React, { useState } from 'react';
import { 
  ChevronDown,
  GraduationCap,
  Building2,
  Globe,
  Check
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  users: UserProfile[];
  activeUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  scopeMode: 'my_office' | 'all';
  onToggleScopeMode: (mode: 'my_office' | 'all') => void;
}

const ROLE_COLORS: Record<string, string> = {
  geca: 'bg-purple-100 text-purple-800 border-purple-200',
  rectorado: 'bg-rose-100 text-rose-800 border-rose-200',
  vrac: 'bg-blue-100 text-blue-800 border-blue-200',
  vrin: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  diga: 'bg-amber-100 text-amber-800 border-amber-200',
  director_escuela: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  opla: 'bg-sky-100 text-sky-800 border-sky-200',
  aphu: 'bg-teal-100 text-teal-800 border-teal-200',
  resu: 'bg-lime-100 text-lime-800 border-lime-200',
  tein: 'bg-violet-100 text-violet-800 border-violet-200',
  bisa: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  adma: 'bg-orange-100 text-orange-800 border-orange-200',
  obun: 'bg-pink-100 text-pink-800 border-pink-200',
  espg: 'bg-blue-100 text-blue-800 border-blue-200',
  reni: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  csst: 'bg-amber-100 text-amber-800 border-amber-200',
  auditor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  colaborador: 'bg-slate-100 text-slate-800 border-slate-200',
};

export const Navbar: React.FC<NavbarProps> = ({
  users,
  activeUser,
  onSwitchUser,
  scopeMode,
  onToggleScopeMode,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Identidad Institucional UPT */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-800 via-rose-700 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-700/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                UNIVERSIDAD PRIVADA DE TACNA
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                GECA
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Sistema de Gestión de la Calidad (ISO 9001:2015 &amp; ISO 21001:2025)
            </p>
          </div>
        </div>

        {/* Acciones, Selector de Alcance & Selector de Oficina UPT */}
        <div className="flex items-center gap-3">
          {/* INTERRUPTOR DUAL: MI OFICINA vs TODO EL SGC */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onToggleScopeMode('my_office')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeMode === 'my_office'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              title={`Mostrar únicamente procesos, procedimientos, indicadores y auditoría de: ${activeUser.officeName || activeUser.department}`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Mi Oficina</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleScopeMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeMode === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Mostrar todo el catálogo institucional consolidado del SGC UPT"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Todo el SGC</span>
            </button>
          </div>

          {/* Menú de Selección de Dependencia / Usuario UPT */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
              title="Cambiar de dependencia / oficina"
            >
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-8 h-8 rounded-lg object-cover border border-white shadow-xs shrink-0"
              />
              <div className="text-left hidden lg:block max-w-[210px]">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {activeUser.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {activeUser.officeName || activeUser.department}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-5 py-3 border-b border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Dependencias Universitarias UPT</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      {users.length} Oficinas
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Selecciona tu oficina para acceder directamente a tu espacio de trabajo y ver solo tus procesos, metas y auditorías.
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-50">
                  {users.map((u) => {
                    const isSelected = u.id === activeUser.id;
                    const badgeClass = ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-700';
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setDropdownOpen(false);
                        }}
                        className={'w-full px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer ' + (
                          isSelected ? 'bg-blue-50/70 border-l-4 border-blue-900' : ''
                        )}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg object-cover mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">{u.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{u.charge}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={'inline-block px-2 py-0.5 text-[10px] font-bold rounded-md border ' + badgeClass}>
                              {u.department}
                            </span>
                            {u.processCodes && u.processCodes.length > 0 && (
                              <span className="text-[10px] font-mono text-slate-400 font-bold">
                                [{u.processCodes.join(', ')}]
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
