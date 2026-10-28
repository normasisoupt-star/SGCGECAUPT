import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProcessMapView } from './components/ProcessMapView';
import { DocumentManagementView } from './components/DocumentManagementView';
import { IndicatorsView } from './components/IndicatorsView';
import { CAPAManagementView } from './components/CAPAManagementView';
import { AuditChecklistView } from './components/AuditChecklistView';
import { ActivityLogsView } from './components/ActivityLogsView';

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
  initStorage
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
    setActiveTab('documents');
  };

  const openCapasCount = nonConformities.filter(c => c.status !== 'cerrada').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        users={users}
        activeUser={activeUser}
        onSwitchUser={handleSwitchUser}
        scopeMode={scopeMode}
        onToggleScopeMode={setScopeMode}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          documentCount={documents.length}
          openCapaCount={openCapasCount}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              documents={documents}
              nonConformities={nonConformities}
              checklist={checklist}
              logs={logs}
              activeUser={activeUser}
              onNavigate={setActiveTab}
              onOpenNewDoc={() => {
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
            />
          )}

          {activeTab === 'indicators' && (
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

          {activeTab === 'capa' && (
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

          {activeTab === 'checklist' && (
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

          {activeTab === 'logs' && (
            <ActivityLogsView logs={logs} />
          )}
        </main>
      </div>


    </div>
  );
}

export default App;
