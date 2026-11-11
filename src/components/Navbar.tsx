import React, { useState } from 'react';
import { 
  ChevronDown,
  GraduationCap,
  Building2,
  Globe,
  Check,
  LogOut,
  User
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { resolveUserOrganizationUnit, resolveUserSecondaryUnit, getCombinedUserProceduresAndProcesses } from '../data/organizationHierarchy';

interface NavbarProps {
  users: UserProfile[];
  activeUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  scopeMode: 'my_office' | 'all';
  onToggleScopeMode: (mode: 'my_office' | 'all') => void;
  activeUnitScope?: 'primary' | 'secondary' | 'both';
  onChangeActiveUnitScope?: (scope: 'primary' | 'secondary' | 'both') => void;
  onLogout?: () => void;
  isAdminSession?: boolean;
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
  activeUnitScope = 'both',
  onChangeActiveUnitScope,
  onLogout,
  isAdminSession,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isAdmin = isAdminSession ?? (activeUser?.role === 'geca');
  const primaryUnit = resolveUserOrganizationUnit(activeUser);
  const secondaryUnit = resolveUserSecondaryUnit(activeUser);
  const combinedDual = getCombinedUserProceduresAndProcesses(primaryUnit, secondaryUnit, activeUser?.procedureCodes, activeUser?.processCodes);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-[#0d2d3f] before:via-[#e63b2e] before:to-[#9C7D0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-4">
        {/* Identidad Institucional UPT */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0d2d3f] to-[#001826] border border-[#9C7D0F]/40 flex items-center justify-center text-[#F3E5AB] shadow-md shadow-[#0d2d3f]/25 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                UNIVERSIDAD PRIVADA DE TACNA
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#0d2d3f]/10 text-[#0d2d3f] border border-[#0d2d3f]/20 uppercase tracking-wider font-outfit">
                GECA
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block whitespace-nowrap">
              Sistema de Gestión de la Calidad (ISO 9001:2015 &amp; ISO 21001:2025)
            </p>
          </div>
        </div>

        {/* Acciones, Selector de Alcance & Selector de Oficina UPT */}
        <div className="flex items-center gap-3 shrink-0">
          {/* ALCANCE: El Administrador y exclusivamente la Oficina de Gestión de la Calidad (GECA) pueden alternar a Todo el SGC */}
          {(isAdmin || activeUser?.unitId === 'geca' || activeUser?.unitId === 'geca-office' || (activeUser?.officeName || '').includes('Gestión de la Calidad (GECA)')) ? (
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => onToggleScopeMode('my_office')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  scopeMode === 'my_office'
                    ? 'bg-[#0d2d3f] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
                title={`Mostrar únicamente procedimientos de: ${activeUser?.officeName || activeUser?.department || ''}`}
              >
                <Building2 className="w-3.5 h-3.5 text-[#F3E5AB]" />
                <span>{isAdmin ? 'Vista Unidad' : `Mis Procedimientos (${activeUser?.procedureCodes?.length || 11})`}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleScopeMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  scopeMode === 'all'
                    ? 'bg-[#0d2d3f] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
                title="Mostrar todo el catálogo institucional consolidado del SGC UPT"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">Todo el SGC (94)</span>
              </button>
            </div>
          ) : !secondaryUnit ? (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d2d3f] text-white text-xs font-bold shadow-xs whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 text-[#F3E5AB]" />
              <span>Mis Procedimientos ({activeUser?.procedureCodes?.length || 0})</span>
            </div>
          ) : null}

          {/* Menú de Selección de Dependencia / Usuario UPT */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
              title={isAdmin ? "Cambiar de dependencia / oficina (Admin)" : "Ver perfil de usuario"}
            >
              <div className="w-8 h-8 rounded-lg bg-[#0d2d3f] text-[#F3E5AB] flex items-center justify-center font-bold text-xs shadow-xs shrink-0 font-outfit border border-[#9C7D0F]/40">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">
                  {activeUser?.name}
                </div>
                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                  {activeUser?.officeName === 'Administrador del Sistema'
                    ? 'Administrador del Sistema'
                    : secondaryUnit
                    ? `Doble Dependencia (${combinedDual.procedureCodes.length} proc.)`
                    : (activeUser?.officeName || activeUser?.department)}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                {isAdmin ? (
                  <>
                    <div className="px-5 py-3 border-b border-slate-100">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Dependencias Universitarias UPT</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                          {users.length} Oficinas
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Modo Administrador: Selecciona cualquier oficina para supervisar su catálogo y espacio de trabajo.
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
                  </>
                ) : (
                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <div className="text-base font-bold text-slate-900 leading-tight">
                        {activeUser?.name}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {activeUser?.charge}
                      </div>
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className={'inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg border ' + (ROLE_COLORS[activeUser?.role || 'colaborador'] || 'bg-slate-100 text-slate-700')}>
                          1.ª: {activeUser?.officeName || activeUser?.department}
                        </span>
                        {secondaryUnit && (
                          <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#D4AF37]/60 bg-amber-50 text-[#9C7D0F]">
                            2.ª: {secondaryUnit.displayName}
                          </span>
                        )}
                        {activeUser?.processCodes && activeUser.processCodes.length > 0 && (
                          <span className="text-[11px] font-mono text-slate-600 font-bold bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                            Procesos: {activeUser.processCodes.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                      <div className="font-semibold text-slate-700 flex items-center justify-between">
                        <span>Perfil de Oficina</span>
                        <span className="text-[10px] bg-blue-100 text-[#0d2d3f] px-2 py-0.5 rounded-full font-bold">UPT Oficial</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Acceso activo a la consulta institucional de Mapa de Procesos y Lista Maestra de Documentos (RG04).
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer de la ventana: Cerrar Sesión */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[11px] text-slate-500 font-medium">Sesión activa</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout?.();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                    title="Cerrar la sesión actual"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botón de Retorno a la Portada Oficial Stitch */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#0d2d3f] hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Volver a la Portada SGC UPT"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline font-outfit">Ver Portada</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-BARRA DE DOBLE DEPENDENCIA COMPLETA (SIN TEXTOS CORTADOS) */}
      {!isAdmin && secondaryUnit && onChangeActiveUnitScope && (
        <div className="bg-slate-50/95 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-1.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#0d2d3f] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#9C7D0F]" />
              <span>Selector de Dependencias Asignadas:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChangeActiveUnitScope('primary')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeUnitScope === 'primary'
                    ? 'bg-[#0d2d3f] text-white border-[#0d2d3f] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 shrink-0 ${activeUnitScope === 'primary' ? 'text-[#F3E5AB]' : 'text-[#0d2d3f]'}`} />
                <span>1.ª: {primaryUnit?.displayName || activeUser?.officeName} ({primaryUnit?.consolidatedProcedures.length || 0} proc.)</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeActiveUnitScope('secondary')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeUnitScope === 'secondary'
                    ? 'bg-[#9C7D0F] text-white border-[#9C7D0F] shadow-xs'
                    : 'bg-white text-slate-700 border-[#D4AF37]/60 hover:bg-amber-50/60'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 shrink-0 ${activeUnitScope === 'secondary' ? 'text-amber-100' : 'text-[#9C7D0F]'}`} />
                <span>2.ª: {secondaryUnit.displayName} ({secondaryUnit.consolidatedProcedures.length} proc.)</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeActiveUnitScope('both')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeUnitScope === 'both'
                    ? 'bg-[#0d2d3f] text-white border-[#0d2d3f] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Globe className={`w-3.5 h-3.5 shrink-0 ${activeUnitScope === 'both' ? 'text-emerald-300' : 'text-emerald-600'}`} />
                <span>Ambas Dependencias ({combinedDual.procedureCodes.length} proc.)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
