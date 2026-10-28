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
  const [isLoggedOut, setIsLoggedOut] = useState(false);

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

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Encabezado Institucional */}
          <div className="bg-gradient-to-r from-red-900 via-rose-800 to-amber-700 p-6 text-white text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center mb-3 shadow-inner">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
              UNIVERSIDAD PRIVADA DE TACNA
            </span>
            <h2 className="text-xl font-black tracking-tight mt-0.5">
              Sistema de Gestión de la Calidad
            </h2>
            <p className="text-[11px] text-rose-200 mt-1">
              ISO 21001:2018 &bull; ISO 9001:2015 &bull; SGC UPT
            </p>
          </div>

          {/* Cuerpo de Reingreso */}
          <div className="p-6">
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Acceso a Mi Espacio de Trabajo
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Has cerrado tu sesión de trabajo. Selecciona tu dependencia u oficina para reingresar:
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Dependencia / Funcionario UPT
                </label>
                <select
                  value={activeUser.id}
                  onChange={(e) => {
                    const selected = users.find(u => u.id === e.target.value);
                    if (selected) handleSwitchUser(selected);
                  }}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-900"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.officeName || u.department} — {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-white shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{activeUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{activeUser.charge}</div>
                  <div className="text-[10px] text-red-900 font-bold mt-0.5">{activeUser.officeName || activeUser.department}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLoggedOut(false)}
                className="w-full py-3 rounded-xl bg-red-900 hover:bg-red-950 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-red-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Ingresar a Mi Oficina</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 block font-medium">
                Oficina de Gestión de la Calidad (GECA) &bull; Campus Capanique
              </span>
            </div>
          </div>
        </div>
      </div>
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
        onLogout={() => setIsLoggedOut(true)}
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
