import React, { useState } from 'react';
import {
  Search,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Users,
  Trash2,
  RefreshCw,
  Building2,
  Mail,
  Briefcase,
  CheckCircle2,
  History,
  LineChart,
  ClipboardCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { ActivityLog, UserProfile, OptionalUserModule } from '../types';
import { ORGAN_GROUPS, ORGANIZATION_UNITS, resolveUserOrganizationUnit, resolveUserSecondaryUnit, getCombinedUserProceduresAndProcesses } from '../data/organizationHierarchy';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
  users?: UserProfile[];
  revokedEmails?: string[];
  onDeleteRegisteredUser?: (userId: string, email: string) => void;
  onReassignUserUnit?: (userId: string, email: string, newUnitId: string) => void;
  onAssignUserSecondaryUnit?: (userId: string, email: string, secondaryUnitId: string) => void;
  onUpdateUserModules?: (userId: string, email: string, enabledModules: OptionalUserModule[]) => void;
  onBulkUpdateUsersModules?: (moduleKey: OptionalUserModule | 'all', enable: boolean) => void;
  onRestoreRevokedEmail?: (email: string) => void;
  onSyncCloudUsers?: () => Promise<void>;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({
  logs,
  users = [],
  revokedEmails = [],
  onDeleteRegisteredUser,
  onReassignUserUnit,
  onAssignUserSecondaryUnit,
  onUpdateUserModules,
  onBulkUpdateUsersModules,
  onRestoreRevokedEmail,
  onSyncCloudUsers,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Mostrar el Administrador del Sistema (u-geca) y todos los usuarios registrados en Firebase Auth (excluyendo las 28 plantillas base u-unit-*)
  const registeredOfficials = users.filter(
    (u) => u.id === 'u-geca' || u.isCustomRegistered || !u.id.startsWith('u-unit-')
  );

  const filteredOfficials = registeredOfficials.filter((u) => {
    const q = userSearchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.officeName || '').toLowerCase().includes(q) ||
      (u.charge || '').toLowerCase().includes(q)
    );
  });

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || log.entityType === filterType;
    return matchesSearch && matchesType;
  });

  const handleSyncClick = async () => {
    if (!onSyncCloudUsers) return;
    setIsSyncing(true);
    try {
      await onSyncCloudUsers();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0d2d3f]/10 text-[#0d2d3f] border border-[#0d2d3f]/20 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Exclusivo Administrador del Sistema</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Control de Usuarios Registrados y Pista de Auditoría
          </h1>
          <p className="text-sm text-slate-500">
            Supervise a todos los funcionarios registrados, verifique o corrija su oficina/área asignada y elimine registros que no correspondan.
          </p>
        </div>

        {/* Selector de Pestaña Interna */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl border border-slate-300/80 self-start">
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'users'
                ? 'bg-[#0d2d3f] text-white shadow-sm'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios Registrados ({registeredOfficials.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'logs'
                ? 'bg-[#0d2d3f] text-white shadow-sm'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial de Eventos ({logs.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'users' ? (
        <div className="space-y-6">
          {/* Panel Maestro de Habilitación / Deshabilitación de Pestañas SGC para Oficinas */}
          {onBulkUpdateUsersModules && (
            <div className="bg-gradient-to-r from-[#0d2d3f] via-[#123b52] to-[#0d2d3f] rounded-2xl p-5 text-white shadow-md border border-[#D4AF37]/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5 text-[#F3E5AB]" />
                    <span>Control de Pestañas por Oficina (Tiempo Real • Cloud Firestore)</span>
                  </div>
                  <h2 className="text-base font-bold text-white">
                    Habilitación de Módulos Especializados para Oficinas y Dependencias
                  </h2>
                  <p className="text-xs text-slate-300 max-w-3xl">
                    Por defecto, estos 3 módulos son exclusivos del Administrador. Cuando los habilite (globalmente aquí o individualmente en cada usuario abajo), cada oficina verá en su menú lateral <strong>únicamente los indicadores, no conformidades y auditorías que corresponden a su dependencia</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onBulkUpdateUsersModules('all', true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Habilitar las 3 a Todas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onBulkUpdateUsersModules('all', false)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ocultar las 3 (Solo Admin)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/15">
                {([
                  {
                    key: 'indicators' as OptionalUserModule,
                    label: 'Tablero de Indicadores',
                    desc: 'Muestra los KPIs y metas de los procesos propios de cada oficina',
                    icon: LineChart,
                  },
                  {
                    key: 'capa' as OptionalUserModule,
                    label: 'No Conformidades (RG08)',
                    desc: 'Muestra los hallazgos, 5 Porqués y planes de acción de su oficina',
                    icon: AlertTriangle,
                  },
                  {
                    key: 'checklist' as OptionalUserModule,
                    label: 'Evaluación ISO 21001',
                    desc: 'Muestra el cronograma de auditoría y cláusulas evaluadas en su oficina',
                    icon: ClipboardCheck,
                  },
                ]).map((mod) => {
                  const nonOwnerOfficials = registeredOfficials.filter(
                    (u) => !(u.role === 'geca' && u.officeName === 'Administrador del Sistema')
                  );
                  const enabledCount = nonOwnerOfficials.filter((u) =>
                    Array.isArray(u.enabledModules) && u.enabledModules.includes(mod.key)
                  ).length;
                  const allEnabled = nonOwnerOfficials.length > 0 && enabledCount === nonOwnerOfficials.length;
                  const ModIcon = mod.icon;

                  return (
                    <div
                      key={mod.key}
                      className={`rounded-xl p-3.5 border transition-all flex items-center justify-between gap-3 ${
                        allEnabled
                          ? 'bg-emerald-950/60 border-emerald-400/50'
                          : enabledCount > 0
                          ? 'bg-amber-950/40 border-[#D4AF37]/50'
                          : 'bg-slate-900/40 border-white/10'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <ModIcon className="w-4 h-4 text-[#F3E5AB] shrink-0" />
                          <span className="text-xs font-bold text-white truncate">{mod.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{mod.desc}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold text-[#F3E5AB]">
                          {enabledCount} de {nonOwnerOfficials.length} usuario(s) con acceso
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onBulkUpdateUsersModules(mod.key, !allEnabled)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer transition-all ${
                          allEnabled
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
                            : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                        }`}
                      >
                        {allEnabled ? 'Habilitado (Desactivar)' : 'Habilitar a Todos'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barra de búsqueda y sincronización de usuarios */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar funcionario por nombre, correo, cargo u oficina/área..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
              />
            </div>

            {onSyncCloudUsers && (
              <button
                type="button"
                onClick={handleSyncClick}
                disabled={isSyncing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shrink-0 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#F3E5AB]' : 'text-[#F3E5AB]'}`} />
                <span>{isSyncing ? 'Sincronizando con Firebase...' : 'Actualizar Padrón de Registros'}</span>
              </button>
            )}
          </div>

          {/* Tabla de Funcionarios Registrados */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0d2d3f]" />
                  <span>Padrón de Funcionarios Registrados en el SGC</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Si un administrativo se registró en una oficina o área que no le corresponde, puede reasignarle su área correcta o eliminar su registro para bloquear su acceso.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-center">
                {filteredOfficials.length} registro(s) activo(s)
              </span>
            </div>

            {filteredOfficials.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-700">
                  No hay funcionarios adicionales registrados con este filtro
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Cada vez que un trabajador complete el formulario "Registrar Nuevo Funcionario" en la portada, aparecerá listado aquí con su correo, cargo y oficina elegida.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredOfficials.map((u) => {
                  const isSystemOwner = u.role === 'geca' && u.officeName === 'Administrador del Sistema';
                  const unit = resolveUserOrganizationUnit(u);
                  const secondaryUnit = resolveUserSecondaryUnit(u);
                  const combined = getCombinedUserProceduresAndProcesses(unit, secondaryUnit, u.procedureCodes, u.processCodes);
                  const procCount = isSystemOwner ? 94 : (combined.procedureCodes.length || u.procedureCodes?.length || 0);

                  return (
                    <div
                      key={u.id + u.email}
                      className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col xl:flex-row xl:items-center justify-between gap-4"
                    >
                      {/* Datos del Funcionario */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{u.name}</span>
                          {isSystemOwner ? (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                              Propietario / Administrador del Sistema
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-[#0d2d3f] border border-blue-200 uppercase">
                              {u.role === 'director_escuela' ? 'Dueño de Proceso / Jefe' : u.role === 'auditor' ? 'Auditor Interno' : 'Colaborador Administrativo'}
                            </span>
                          )}
                          {secondaryUnit && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-[#9C7D0F] border border-[#D4AF37]/50 uppercase">
                              Doble Dependencia Asignada
                            </span>
                          )}
                          {u.registeredAt && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              &bull; Registrado: {u.registeredAt}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {u.email}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            Cargo: <strong className="text-slate-800">{u.charge}</strong>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-[#0d2d3f]" />
                            1.ª Dependencia: <strong className="text-[#0d2d3f]">{isSystemOwner ? 'Administrador del Sistema (Sin oficina asignada)' : (u.officeName || u.department)}</strong>
                          </span>
                          {secondaryUnit && (
                            <span className="inline-flex items-center gap-1 bg-amber-50/80 px-2 py-0.5 rounded-md border border-[#D4AF37]/40 text-[#0d2d3f]">
                              <Building2 className="w-3.5 h-3.5 text-[#9C7D0F]" />
                              2.ª Dependencia: <strong className="text-[#9C7D0F]">{secondaryUnit.displayName}</strong>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            {procCount} procedimientos habilitados
                          </span>
                        </div>
                      </div>

                      {/* Controles del Administrador: Cambiar 1.ª Dependencia, Asignar 2.ª Dependencia o Eliminar Registro */}
                      {!isSystemOwner && (
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {onReassignUserUnit && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                                1.ª Dependencia Principal
                              </span>
                              <select
                                value={unit?.id || u.unitId || 'opla'}
                                onChange={(e) => onReassignUserUnit(u.id, u.email, e.target.value)}
                                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] cursor-pointer max-w-[230px]"
                                title="Cambiar la Oficina, Área o Facultad principal asignada a este usuario"
                              >
                                {ORGAN_GROUPS.map((group) => (
                                  <optgroup key={group.key} label={group.label}>
                                    {ORGANIZATION_UNITS.filter((unitItem) => unitItem.organGroup === group.key).map((unitItem) => (
                                      <option key={unitItem.id} value={unitItem.id}>
                                        {unitItem.displayName} ({unitItem.consolidatedProcedures.length} proc.)
                                      </option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                            </div>
                          )}

                          {onAssignUserSecondaryUnit && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-bold text-[#9C7D0F] uppercase tracking-wider px-1">
                                + 2.ª Dependencia (Admin)
                              </span>
                              <select
                                value={secondaryUnit?.id || u.secondaryUnitId || ''}
                                onChange={(e) => onAssignUserSecondaryUnit(u.id, u.email, e.target.value)}
                                className={`px-2.5 py-1.5 text-xs rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#9C7D0F] cursor-pointer max-w-[230px] ${
                                  secondaryUnit
                                    ? 'border-[#D4AF37] bg-amber-50/70 text-[#0d2d3f] font-bold'
                                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                                }`}
                                title="Asignar o quitar una segunda Oficina o Facultad adicional a este funcionario (exclusivo Administrador)"
                              >
                                <option value="">— Sin 2.ª dependencia —</option>
                                {ORGAN_GROUPS.map((group) => (
                                  <optgroup key={group.key} label={group.label}>
                                    {ORGANIZATION_UNITS.filter(
                                      (unitItem) => unitItem.organGroup === group.key && unitItem.id !== (unit?.id || u.unitId)
                                    ).map((unitItem) => (
                                      <option key={unitItem.id} value={unitItem.id}>
                                        + {unitItem.displayName} ({unitItem.consolidatedProcedures.length} proc.)
                                      </option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                            </div>
                          )}

                          {onUpdateUserModules && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                                Pestañas Habilitadas en su Oficina
                              </span>
                              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                {([
                                  { key: 'indicators' as OptionalUserModule, short: 'Indicadores', icon: LineChart },
                                  { key: 'capa' as OptionalUserModule, short: 'No Conform.', icon: AlertTriangle },
                                  { key: 'checklist' as OptionalUserModule, short: 'Eval. ISO', icon: ClipboardCheck },
                                ]).map((m) => {
                                  const currentMods = Array.isArray(u.enabledModules) ? u.enabledModules : [];
                                  const isModEnabled = currentMods.includes(m.key);
                                  const IconComp = m.icon;
                                  return (
                                    <button
                                      key={m.key}
                                      type="button"
                                      onClick={() => {
                                        const nextMods = isModEnabled
                                          ? currentMods.filter((item) => item !== m.key)
                                          : [...currentMods, m.key];
                                        onUpdateUserModules(u.id, u.email, nextMods);
                                      }}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                        isModEnabled
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80'
                                      }`}
                                      title={
                                        isModEnabled
                                          ? `Pestaña ${m.short} HABILITADA para ${u.name} (Clic para ocultar)`
                                          : `Pestaña ${m.short} OCULTA para ${u.name} (Clic para habilitar)`
                                      }
                                    >
                                      <IconComp className="w-3 h-3" />
                                      <span>{m.short}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {onDeleteRegisteredUser && (
                            confirmDeleteId === u.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                                <span className="text-[11px] font-bold text-rose-800">¿Confirmar baja?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteRegisteredUser(u.id, u.email);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                                >
                                  Sí, Eliminar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(u.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                                title="Eliminar registro y bloquear el acceso de este correo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar Registro</span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción o código de registro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-white cursor-pointer"
            >
              <option value="all">Todas las entidades</option>
              <option value="documento">Documentos</option>
              <option value="no_conformidad">No Conformidades (CAPA)</option>
              <option value="auditoria">Auditorías</option>
              <option value="sistema">Sistema y Usuarios</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No se encontraron eventos con los filtros seleccionados.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    {log.entityType === 'documento' ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : log.entityType === 'no_conformidad' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{log.userName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 uppercase font-sans font-semibold tracking-wide">
                          {log.userRole}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs font-medium text-slate-700">{log.action}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-sans font-semibold tracking-wide">{log.timestamp}</span>
                    </div>

                    <div className="mt-1 text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-sans font-semibold tracking-wide font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {log.entityId}
                      </span>
                      <span className="truncate">{log.details}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
