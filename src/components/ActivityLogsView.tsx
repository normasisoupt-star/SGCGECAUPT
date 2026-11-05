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
  UserX,
  RotateCcw
} from 'lucide-react';
import { ActivityLog, UserProfile } from '../types';
import { ORGAN_GROUPS, ORGANIZATION_UNITS, resolveUserOrganizationUnit } from '../data/organizationHierarchy';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
  users?: UserProfile[];
  revokedEmails?: string[];
  onDeleteRegisteredUser?: (userId: string, email: string) => void;
  onReassignUserUnit?: (userId: string, email: string, newUnitId: string) => void;
  onRestoreRevokedEmail?: (email: string) => void;
  onSyncCloudUsers?: () => Promise<void>;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({
  logs,
  users = [],
  revokedEmails = [],
  onDeleteRegisteredUser,
  onReassignUserUnit,
  onRestoreRevokedEmail,
  onSyncCloudUsers,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtrar usuarios registrados por formulario (excluyendo las 28 plantillas base u-unit-* y u-geca)
  const registeredOfficials = users.filter(
    (u) => u.isCustomRegistered || (!u.id.startsWith('u-unit-') && u.id !== 'u-geca')
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
                  const procCount = isSystemOwner ? 94 : (unit?.consolidatedProcedures.length || u.procedureCodes?.length || 0);

                  return (
                    <div
                      key={u.id + u.email}
                      className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
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
                            Unidad: <strong className="text-[#0d2d3f]">{isSystemOwner ? 'Administrador del Sistema (Sin oficina asignada)' : (u.officeName || u.department)}</strong>
                          </span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            {procCount} procedimientos habilitados
                          </span>
                        </div>
                      </div>

                      {/* Controles del Administrador: Cambiar Oficina/Área o Eliminar Registro */}
                      {!isSystemOwner && (
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                          {onReassignUserUnit && (
                            <select
                              value={unit?.id || u.unitId || 'opla'}
                              onChange={(e) => onReassignUserUnit(u.id, u.email, e.target.value)}
                              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] cursor-pointer max-w-[240px]"
                              title="Cambiar la Oficina, Área o Facultad asignada a este usuario"
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

          {/* Lista de Correos Revocados / Bloqueados */}
          {revokedEmails.length > 0 && (
            <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                  <UserX className="w-4 h-4 text-rose-600" />
                  <span>Registros Eliminados / Correos con Acceso Revocado ({revokedEmails.length})</span>
                </div>
              </div>
              <p className="text-xs text-rose-700">
                Estos correos fueron dados de baja por registrarse en una dependencia no autorizada y tienen el inicio de sesión bloqueado. Si el trabajador vuelve a registrarse en su oficina correcta o usted lo restaura, podrá ingresar nuevamente.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {revokedEmails.map((email) => (
                  <div
                    key={email}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs text-slate-800 shadow-2xs"
                  >
                    <span className="font-semibold text-rose-800">{email}</span>
                    {onRestoreRevokedEmail && (
                      <button
                        type="button"
                        onClick={() => onRestoreRevokedEmail(email)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 cursor-pointer"
                        title="Desbloquear este correo"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Desbloquear</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
