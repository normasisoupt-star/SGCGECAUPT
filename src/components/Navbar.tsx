import React, { useState } from 'react';
import { 
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  users: UserProfile[];
  activeUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  onOpenSettings?: () => void;
}

const ROLE_COLORS: Record<UserRole, string> = {
  geca: 'bg-purple-100 text-purple-800 border-purple-200',
  rectorado: 'bg-rose-100 text-rose-800 border-rose-200',
  vrac: 'bg-blue-100 text-blue-800 border-blue-200',
  vrin: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  diga: 'bg-amber-100 text-amber-800 border-amber-200',
  director_escuela: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  auditor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  colaborador: 'bg-slate-100 text-slate-800 border-slate-200',
};

export const Navbar: React.FC<NavbarProps> = ({
  users,
  activeUser,
  onSwitchUser,
  onOpenSettings,
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

        {/* Acciones & Selector de Rol UPT */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SGOE UPT Conectado</span>
          </div>



          {/* Menú de Simulación de Usuario UPT */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-8 h-8 rounded-lg object-cover border border-white shadow-xs"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{activeUser.name}</div>
                <div className="text-[11px] text-slate-500">{activeUser.charge}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Cambiar Perfil Institucional UPT
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Simula la vista de cada responsable según el Manual de Procesos.
                  </p>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
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
                          isSelected ? 'bg-red-50/50' : ''
                        )}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg object-cover mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">{u.name}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-red-600"></span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{u.charge}</div>
                          <span className={'inline-block px-1.5 py-0.2 text-[10px] font-semibold rounded-sm border mt-1 ' + badgeClass}>
                            {u.department}
                          </span>
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
