import { resolveUserOrganizationUnit, resolveUserSecondaryUnit, getCombinedUserProceduresAndProcesses } from './data/organizationHierarchy';
import { initSystemSecurity } from './services/security';
import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, UserCheck } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProcessMapView } from './components/ProcessMapView';
import { DocumentManagementView } from './components/DocumentManagementView';
import { RepositoryView } from './components/RepositoryView';

import { IndicatorsView } from './components/IndicatorsView';
import { CAPAManagementView } from './components/CAPAManagementView';
import { AuditChecklistView } from './components/AuditChecklistView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { LoginLandingView } from './components/LoginLandingView';

import {
  getDocuments,
  saveDocument,
  approveDocument,
  deleteDocument,
  getNonConformities,
  saveNonConformity,
  closeNonConformity,
  getChecklist,
  updateChecklistItem,
  getIndicators,
  updateIndicator,
  addIndicatorMeasurement,
  validateIndicatorMeasurement,
  getUsers,
  getActiveUser,
  setActiveUser,
  normalizeUserProfile,
  getLogs,
  subscribeToRealtime,
  initStorage,
  registerUser,
  deleteRegisteredUser,
  reassignRegisteredUserUnit,
  assignRegisteredUserSecondaryUnit,
  getRevokedEmails,
  removeEmailFromRevoked,
  mergeCloudRegisteredUsers,
  computeSyncHash
} from './services/storage';
import {
  fetchCloudRegisteredUsers,
  subscribeToCloudUsers,
  revokeUserInCloud,
  reassignUserUnitInCloud,
  assignUserSecondaryUnitInCloud
} from './services/firebaseClient';

import { 
  ISODocument, 
  NonConformity, 
  AuditChecklistItem, 
  UserProfile, 
  ActivityLog,
  UPTIndicator,
  IndicatorMeasurement,
  ProcessLevel0
} from './types';

export function App() {
  useEffect(() => {
    initStorage();
    const cleanupSecurity = initSystemSecurity();
    return () => {
      cleanupSecurity?.();
    };
  }, []);

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [documents, setDocuments] = useState<ISODocument[]>(getDocuments);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>(getNonConformities);
  const [checklist, setChecklist] = useState<AuditChecklistItem[]>(getChecklist);
  const [indicators, setIndicators] = useState<UPTIndicator[]>(getIndicators);
  const [users, setUsers] = useState<UserProfile[]>(getUsers);
  const [activeUser, setActiveUserState] = useState<UserProfile>(getActiveUser);
  const [logs, setLogs] = useState<ActivityLog[]>(getLogs);

  const [isOpenNewDocModal, setIsOpenNewDocModal] = useState(false);
  const [isOpenNewCapaModal, setIsOpenNewCapaModal] = useState(false);
  const [scopeMode, setScopeMode] = useState<'my_office' | 'all'>('my_office');
  const [activeUnitScope, setActiveUnitScope] = useState<'primary' | 'secondary' | 'both'>('both');
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<string>('all');
  const [isLoggedOut, setIsLoggedOut] = useState(() => sessionStorage.getItem('upt_sgc_logged_in') !== 'true');

  const [revokedEmails, setRevokedEmails] = useState<string[]>(getRevokedEmails);
  const [isOwnerSession, setIsOwnerSession] = useState<boolean>(() => {
    const u = getActiveUser();
    return u?.role === 'geca' && computeSyncHash((u?.email || '').trim().toLowerCase()) === '2bdcaa29f816e1df';
  });
  const isAdmin = activeUser?.role === 'geca' || isOwnerSession;

  // Si el usuario no es Administrador, restringir la navegación a los 3 módulos permitidos
  useEffect(() => {
    if (!isAdmin && !['dashboard', 'process_map', 'documents', 'repository'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  const refreshAll = () => {
    setDocuments(getDocuments());
    setNonConformities(getNonConformities());
    setChecklist(getChecklist());
    setIndicators(getIndicators());
    setUsers(getUsers());
    setActiveUserState(getActiveUser());
    setLogs(getLogs());
    setRevokedEmails(getRevokedEmails());
  };

  const handleSyncCloudUsers = async () => {
    try {
      const { users: cloudUsers, revokedEmails: cloudRevoked } = await fetchCloudRegisteredUsers();
      mergeCloudRegisteredUsers(cloudUsers, cloudRevoked);
      refreshAll();
    } catch {
      // Continuar con datos locales
    }
  };

  useEffect(() => {
    handleSyncCloudUsers();
    const unsubscribeLocal = subscribeToRealtime(() => {
      refreshAll();
    });
    const unsubscribeCloud = subscribeToCloudUsers(() => {
      handleSyncCloudUsers();
    });
    return () => {
      unsubscribeLocal();
      unsubscribeCloud();
    };
  }, []);

  useEffect(() => {
    const normalized = normalizeUserProfile(activeUser);
    if (
      normalized &&
      (normalized.role !== activeUser.role ||
        normalized.charge !== activeUser.charge ||
        normalized.officeName !== activeUser.officeName ||
        normalized.secondaryUnitId !== activeUser.secondaryUnitId)
    ) {
      setActiveUser(normalized);
      setActiveUserState(normalized);
      if (normalized.officeName === 'Administrador del Sistema') {
        setScopeMode('all');
      }
    } else if (activeUser?.officeName === 'Administrador del Sistema' && scopeMode !== 'all') {
      setScopeMode('all');
    }
  }, [activeUser]);

  const handleSwitchUser = (user: UserProfile) => {
    const isOwnerEmail = computeSyncHash((user?.email || '').trim().toLowerCase()) === '2bdcaa29f816e1df';
    if (isOwnerEmail) {
      setIsOwnerSession(true);
    }
    const normalized = setActiveUser(user);
    setActiveUserState(normalized);
    setActiveUnitScope('both');
    if (normalized.officeName === 'Administrador del Sistema') {
      setScopeMode('all');
    } else {
      setScopeMode('my_office');
    }
  };

  const handleDeleteRegisteredUser = async (userId: string, email: string) => {
    const updated = deleteRegisteredUser(userId, email, activeUser.name);
    setUsers(updated);
    setLogs(getLogs());
    setRevokedEmails(getRevokedEmails());
    await revokeUserInCloud(email, activeUser.name);
  };

  const handleReassignUserUnit = async (userId: string, email: string, newUnitId: string) => {
    const updated = reassignRegisteredUserUnit(userId, newUnitId, activeUser.name);
    setUsers(updated);
    setActiveUserState(getActiveUser());
    setLogs(getLogs());
    await reassignUserUnitInCloud(email, newUnitId);
  };

  const handleAssignUserSecondaryUnit = async (userId: string, email: string, secondaryUnitId: string) => {
    const updated = assignRegisteredUserSecondaryUnit(userId, secondaryUnitId, activeUser.name);
    setUsers(updated);
    setActiveUserState(getActiveUser());
    setLogs(getLogs());
    await assignUserSecondaryUnitInCloud(email, secondaryUnitId);
  };

  const handleRestoreRevokedEmail = (email: string) => {
    removeEmailFromRevoked(email);
    setUsers(getUsers());
    setRevokedEmails(getRevokedEmails());
  };

  const handleSaveDocument = (doc: ISODocument) => {
    saveDocument(doc, activeUser.name);
    setDocuments(getDocuments());
    setLogs(getLogs());
  };

  const handleApproveDocument = (id: string) => {
    approveDocument(id, activeUser.name);
    setDocuments(getDocuments());
    setLogs(getLogs());
  };

  const handleDeleteDocument = (id: string) => {
    deleteDocument(id, activeUser.name);
    setDocuments(getDocuments());
    setLogs(getLogs());
  };

  const handleSaveCAPA = (nc: NonConformity) => {
    saveNonConformity(nc, activeUser.name);
    setNonConformities(getNonConformities());
    setLogs(getLogs());
  };

  const handleCloseCAPA = (id: string, verifierName: string, notes: string) => {
    closeNonConformity(id, verifierName, notes);
    setNonConformities(getNonConformities());
    setLogs(getLogs());
  };

  const handleUpdateChecklistItem = (item: AuditChecklistItem) => {
    updateChecklistItem(item);
    setChecklist(getChecklist());
    setLogs(getLogs());
  };

  const handleCreateCapaFromFinding = (item: AuditChecklistItem) => {
    setActiveTab('capa');
    if (!item.findingReference) {
      setIsOpenNewCapaModal(true);
    }
  };

  const handleUpdateIndicator = (indicator: UPTIndicator) => {
    updateIndicator(indicator, activeUser.name);
    setIndicators(getIndicators());
    setLogs(getLogs());
  };

  const handleAddMeasurement = (
    indicatorCode: string,
    data: Omit<IndicatorMeasurement, 'id' | 'date'>
  ) => {
    addIndicatorMeasurement(indicatorCode, data, activeUser);
    setIndicators(getIndicators());
    setLogs(getLogs());
  };

  const handleValidateMeasurement = (
    indicatorCode: string,
    measurementId: string,
    status: 'validado_conforme' | 'observado',
    comment: string
  ) => {
    validateIndicatorMeasurement(indicatorCode, measurementId, status, comment, activeUser);
    setIndicators(getIndicators());
    setLogs(getLogs());
  };

  const handleSelectProcessFilter = (processCode: ProcessLevel0) => {
    setSelectedProcessFilter(processCode);
    setActiveTab('documents');
  };

  const openCapasCount = nonConformities.filter(c => c.status !== 'cerrada').length;

  const handleRegisterUser = (newUser: Omit<UserProfile, 'id'>) => {
    const created = registerUser(newUser);
    setUsers(getUsers());
    setLogs(getLogs());
    handleSwitchUser(created);
    sessionStorage.setItem('upt_sgc_logged_in', 'true');
    setIsLoggedOut(false);
  };

  const handleSelectTab = (tab: NavTab) => {
    if (!isAdmin && !['dashboard', 'process_map', 'documents', 'repository'].includes(tab)) {
      return;
    }
    if (tab === 'documents') {
      setSelectedProcessFilter('all');
    }
    setActiveTab(tab);
  };

  const primaryUnit = resolveUserOrganizationUnit(activeUser);
  const secondaryUnit = resolveUserSecondaryUnit(activeUser);
  const scopedActiveUser: UserProfile = React.useMemo(() => {
    if (!activeUser || !secondaryUnit || isAdmin) return activeUser;
    if (activeUnitScope === 'primary' && primaryUnit) {
      return {
        ...activeUser,
        unitId: primaryUnit.id,
        secondaryUnitId: undefined,
        secondaryOfficeName: undefined,
        organName: primaryUnit.organName,
        areaName: primaryUnit.areaName,
        department: primaryUnit.organName,
        officeName: primaryUnit.displayName,
        procedureCodes: primaryUnit.consolidatedProcedures,
        processCodes: primaryUnit.processCodes,
      };
    }
    if (activeUnitScope === 'secondary') {
      return {
        ...activeUser,
        unitId: secondaryUnit.id,
        secondaryUnitId: undefined,
        secondaryOfficeName: undefined,
        organName: secondaryUnit.organName,
        areaName: secondaryUnit.areaName,
        department: secondaryUnit.organName,
        officeName: secondaryUnit.displayName,
        procedureCodes: secondaryUnit.consolidatedProcedures,
        processCodes: secondaryUnit.processCodes,
      };
    }
    const combined = getCombinedUserProceduresAndProcesses(primaryUnit, secondaryUnit, activeUser.procedureCodes, activeUser.processCodes);
    return {
      ...activeUser,
      procedureCodes: combined.procedureCodes,
      processCodes: combined.processCodes,
    };
  }, [activeUser, primaryUnit, secondaryUnit, activeUnitScope, isAdmin]);

  if (isLoggedOut) {
    return (
      <LoginLandingView
        users={users}
        activeUser={activeUser}
        onLogin={(user) => {
          handleSwitchUser(user);
          sessionStorage.setItem('upt_sgc_logged_in', 'true');
          setIsLoggedOut(false);
        }}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        users={users}
        activeUser={activeUser}
        onSwitchUser={handleSwitchUser}
        scopeMode={scopeMode}
        onToggleScopeMode={setScopeMode}
        activeUnitScope={activeUnitScope}
        onChangeActiveUnitScope={setActiveUnitScope}
        isAdminSession={isAdmin}
        onLogout={() => {
          setIsOwnerSession(false);
          sessionStorage.removeItem('upt_sgc_logged_in');
          setIsLoggedOut(true);
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          documentCount={(isAdmin || scopedActiveUser?.unitId === 'geca' || scopedActiveUser?.unitId === 'geca-office' || (scopedActiveUser?.officeName || '').includes('Gestión de la Calidad (GECA)')) && scopeMode === 'all' ? documents.length : (scopedActiveUser?.procedureCodes?.length || resolveUserOrganizationUnit(scopedActiveUser)?.consolidatedProcedures.length || documents.length)}
          openCapaCount={openCapasCount}
          isAdmin={isAdmin}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              documents={documents}
              nonConformities={nonConformities}
              checklist={checklist}
              logs={logs}
              activeUser={scopedActiveUser}
              scopeMode={scopeMode}
              onNavigate={handleSelectTab}
              onOpenNewDoc={() => {
                setSelectedProcessFilter('all');
                setActiveTab('documents');
                setIsOpenNewDocModal(true);
              }}
              onOpenNewCapa={() => {
                setActiveTab('capa');
                setIsOpenNewCapaModal(true);
              }}
            />
          )}

          {activeTab === 'process_map' && (
            <ProcessMapView onSelectProcessFilter={handleSelectProcessFilter} activeUser={scopedActiveUser} isAdmin={(isAdmin || scopedActiveUser?.unitId === 'geca' || scopedActiveUser?.unitId === 'geca-office' || (scopedActiveUser?.officeName || '').includes('Gestión de la Calidad (GECA)')) && scopeMode === 'all'} />
          )}

          {activeTab === 'documents' && (
            <DocumentManagementView
              documents={documents}
              activeUser={scopedActiveUser}
              onSaveDocument={handleSaveDocument}
              onApproveDocument={handleApproveDocument}
              onDeleteDocument={handleDeleteDocument}
              isOpenNewModal={isOpenNewDocModal}
              onCloseNewModal={() => setIsOpenNewDocModal(false)}
              onOpenNewModal={() => setIsOpenNewDocModal(true)}
              scopeMode={scopeMode}
              onToggleScopeMode={setScopeMode}
              initialProcessFilter={selectedProcessFilter}
              onProcessFilterChange={setSelectedProcessFilter}
            />
          )}

          {activeTab === 'repository' && (
            <RepositoryView />
          )}

          {isAdmin && activeTab === 'indicators' && (
            <IndicatorsView
              indicators={indicators}
              documents={documents}
              activeUser={activeUser}
              onUpdateIndicator={handleUpdateIndicator}
              onAddMeasurement={handleAddMeasurement}
              onValidateMeasurement={handleValidateMeasurement}
              scopeMode={scopeMode}
              onToggleScopeMode={setScopeMode}
            />
          )}

          {isAdmin && activeTab === 'capa' && (
            <CAPAManagementView
              nonConformities={nonConformities}
              activeUser={activeUser}
              onSaveCAPA={handleSaveCAPA}
              onCloseCAPA={handleCloseCAPA}
              isOpenNewModal={isOpenNewCapaModal}
              onCloseNewModal={() => setIsOpenNewCapaModal(false)}
              onOpenNewModal={() => setIsOpenNewCapaModal(true)}
              scopeMode={scopeMode}
              onToggleScopeMode={setScopeMode}
            />
          )}

          {isAdmin && activeTab === 'checklist' && (
            <AuditChecklistView
              checklist={checklist}
              nonConformities={nonConformities}
              activeUser={activeUser}
              onUpdateItem={handleUpdateChecklistItem}
              onCreateCapaFromFinding={handleCreateCapaFromFinding}
              onNavigateToCapa={() => {
                setActiveTab('capa');
              }}
              onOpenNewCapa={() => {
                setActiveTab('capa');
                setIsOpenNewCapaModal(true);
              }}
              scopeMode={scopeMode}
              onToggleScopeMode={setScopeMode}
            />
          )}

          {isAdmin && activeTab === 'logs' && (
            <ActivityLogsView
              logs={logs}
              users={users}
              revokedEmails={revokedEmails}
              onDeleteRegisteredUser={handleDeleteRegisteredUser}
              onReassignUserUnit={handleReassignUserUnit}
              onAssignUserSecondaryUnit={handleAssignUserSecondaryUnit}
              onRestoreRevokedEmail={handleRestoreRevokedEmail}
              onSyncCloudUsers={handleSyncCloudUsers}
            />
          )}
        </main>
      </div>


    </div>
  );
}

export default App;
