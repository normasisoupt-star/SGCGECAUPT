import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, UserCheck } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProcessMapView } from './components/ProcessMapView';
import { DocumentManagementView } from './components/DocumentManagementView';
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
  getLogs,
  subscribeToRealtime,
  initStorage,
  registerUser
} from './services/storage';

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
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<string>('all');
  const [isLoggedOut, setIsLoggedOut] = useState(() => sessionStorage.getItem('upt_sgc_logged_in') !== 'true');

  const isAdmin = activeUser?.role === 'geca';

  // Si el usuario no es Administrador, restringir la navegación a los 3 módulos permitidos
  useEffect(() => {
    if (!isAdmin && !['dashboard', 'process_map', 'documents'].includes(activeTab)) {
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
  };

  useEffect(() => {
    const unsubscribe = subscribeToRealtime(() => {
      refreshAll();
    });
    return unsubscribe;
  }, []);

  const handleSwitchUser = (user: UserProfile) => {
    setActiveUser(user);
    setActiveUserState(user);
    if (user.role === 'geca' || user.role === 'rectorado' || user.role === 'auditor') {
      setScopeMode('all');
    } else {
      setScopeMode('my_office');
    }
  };

  const handleSaveDocument = (doc: ISODocument) => {
    saveDocument(doc, activeUser.name);
    refreshAll();
  };

  const handleApproveDocument = (id: string) => {
    approveDocument(id, activeUser.name);
    refreshAll();
  };

  const handleDeleteDocument = (id: string) => {
    deleteDocument(id, activeUser.name);
    refreshAll();
  };

  const handleSaveCAPA = (nc: NonConformity) => {
    saveNonConformity(nc, activeUser.name);
    refreshAll();
  };

  const handleCloseCAPA = (id: string, verifierName: string, notes: string) => {
    closeNonConformity(id, verifierName, notes);
    refreshAll();
  };

  const handleUpdateChecklistItem = (item: AuditChecklistItem) => {
    updateChecklistItem(item);
    refreshAll();
  };

  const handleCreateCapaFromFinding = (item: AuditChecklistItem) => {
    setActiveTab('capa');
    if (!item.findingReference) {
      setIsOpenNewCapaModal(true);
    }
  };

  const handleUpdateIndicator = (indicator: UPTIndicator) => {
    updateIndicator(indicator, activeUser.name);
    refreshAll();
  };

  const handleAddMeasurement = (
    indicatorCode: string,
    data: Omit<IndicatorMeasurement, 'id' | 'date'>
  ) => {
    addIndicatorMeasurement(indicatorCode, data, activeUser);
    refreshAll();
  };

  const handleValidateMeasurement = (
    indicatorCode: string,
    measurementId: string,
    status: 'validado_conforme' | 'observado',
    comment: string
  ) => {
    validateIndicatorMeasurement(indicatorCode, measurementId, status, comment, activeUser);
    refreshAll();
  };

  const handleSelectProcessFilter = (processCode: ProcessLevel0) => {
    setSelectedProcessFilter(processCode);
    setActiveTab('documents');
  };

  const openCapasCount = nonConformities.filter(c => c.status !== 'cerrada').length;

  const handleRegisterUser = (newUser: Omit<UserProfile, 'id'>) => {
    const created = registerUser(newUser);
    refreshAll();
    handleSwitchUser(created);
    sessionStorage.setItem('upt_sgc_logged_in', 'true');
    setIsLoggedOut(false);
  };

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

  const handleSelectTab = (tab: NavTab) => {
    if (!isAdmin && !['dashboard', 'process_map', 'documents'].includes(tab)) {
      return;
    }
    if (tab === 'documents') {
      setSelectedProcessFilter('all');
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        users={users}
        activeUser={activeUser}
        onSwitchUser={handleSwitchUser}
        scopeMode={scopeMode}
        onToggleScopeMode={setScopeMode}
        onLogout={() => {
          sessionStorage.removeItem('upt_sgc_logged_in');
          setIsLoggedOut(true);
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          documentCount={documents.length}
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
              activeUser={activeUser}
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
            <ProcessMapView onSelectProcessFilter={handleSelectProcessFilter} />
          )}

          {activeTab === 'documents' && (
            <DocumentManagementView
              documents={documents}
              activeUser={activeUser}
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
            <ActivityLogsView logs={logs} />
          )}
        </main>
      </div>


    </div>
  );
}

export default App;
