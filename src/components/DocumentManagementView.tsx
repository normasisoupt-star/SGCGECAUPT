import React, { useState } from 'react';
import { 
  FileText,
  Compass,
  Building2,
  RotateCcw,
  HelpCircle,
  Filter, 
  Search, 
  Plus, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  Trash2, 
  History, 
  Upload, 
  X,
  AlertCircle,
  BookOpen,
  Printer,
  ExternalLink,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  ISODocument, 
  DocumentType, 
  DocumentStatus, 
  ProcessLevel0,
  ProcessCategory,
  UserProfile 
} from '../types';
import { UPT_PROCESSES } from '../data/initialData';
import { UPT_PROCEDURES_DETAILED } from '../data/proceduresDetailed';
import { getDocumentCloudUrl, getManualCloudName, getDocumentExactPageUrl, getLocalPdfPath, SHAREPOINT_LISTA_MAESTRA_DOCX } from '../data/cloudManuals';
import { PdfViewer } from './PdfViewer';
import { getProcedureRange } from '../data/procedurePageRanges';
import { normalizeSearchText, getSynonymProcedureCodes, UPT_DEPENDENCIES, GUIDE_TOPICS, GuideTopic } from '../data/searchSynonyms';

interface DocumentManagementViewProps {
  documents: ISODocument[];
  activeUser: UserProfile;
  onSaveDocument: (doc: ISODocument) => void;
  onApproveDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  isOpenNewModal: boolean;
  onCloseNewModal: () => void;
  onOpenNewModal: () => void;
}

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  vigente: { label: 'Vigente', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
  revision: { label: 'En Revisión', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  borrador: { label: 'Borrador', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText },
  obsoleto: { label: 'Obsoleto', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: AlertCircle },
};

function getPageAndManual(code: string, storageLocation: string, description: string) {
  const range = getProcedureRange(code);
  const pageMatch = storageLocation.match(/Pág\.?\s*(\d+)/i) || description.match(/Pág\.?\s*(\d+)/i);
  const fallbackPage = pageMatch ? pageMatch[1] : null;
  
  let manual = storageLocation.replace('Repositorio Calidad UPT / ', '').replace('Repositorio Institucional / ', '');
  manual = manual.replace(/\(Pág\.?\s*[\d\s\-a]+\)/i, '').trim();
  if (range && (!manual || manual === 'Carpeta SGC' || manual === '')) {
    manual = range.manual;
  }

  const startPage = range ? range.startPage : (fallbackPage ? parseInt(fallbackPage, 10) : 1);
  const endPage = range ? range.endPage : startPage;
  const rangeText = range ? range.rangeText : (fallbackPage ? String(fallbackPage) : '1');
  const pageCount = range ? range.pageCount : 1;

    const activitiesPage = range ? range.activitiesPage : startPage;
  return { manual, page: fallbackPage || (range ? String(range.startPage) : null), range, startPage, endPage, activitiesPage, rangeText, pageCount };
}



export const DocumentManagementView: React.FC<DocumentManagementViewProps> = ({
  documents,
  activeUser,
  onSaveDocument,
  onApproveDocument,
  onDeleteDocument,
  isOpenNewModal,
  onCloseNewModal,
  onOpenNewModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<string>('all');

  const [viewingDoc, setViewingDoc] = useState<ISODocument | null>(null);
  const [readingDoc, setReadingDoc] = useState<ISODocument | null>(null);
  const [readingTab, setReadingTab] = useState<'pdf' | 'details'>('pdf');
  const [targetPdfPage, setTargetPdfPage] = useState<number | null>(null);
  const [versioningDoc, setVersioningDoc] = useState<ISODocument | null>(null);

  // Estados para nuevo documento
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<DocumentType>('Procedimiento');
  const [newProcessCode, setNewProcessCode] = useState<ProcessLevel0>('PE.02');
  const [newIsoClause, setNewIsoClause] = useState('ISO 9001: 7.5 / ISO 21001: 7.5');
  const [newDescription, setNewDescription] = useState('');
  const [newStorageLocation, setNewStorageLocation] = useState('Repositorio Institucional / Calidad GECA');
  const [newRetentionYears, setNewRetentionYears] = useState('5 años post-obsolescencia');
  const [newFinalDisposition, setNewFinalDisposition] = useState('Archivo Central / Digitalización Permanente');

  // Estados para nueva versión
  const [newVersionNumber, setNewVersionNumber] = useState('');
  const [newVersionReason, setNewVersionReason] = useState('');

  // Estados para búsqueda asistida y por dependencias
  const [selectedDependency, setSelectedDependency] = useState('all');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [selectedGuidePillar, setSelectedGuidePillar] = useState<'all' | 'Misional' | 'Soporte' | 'Estratégico'>('all');
  const [selectedGuideTopicId, setSelectedGuideTopicId] = useState<string | null>(null);

  const canApprove = activeUser.role === 'geca';
  const canCreate = activeUser.role === 'geca' || activeUser.role === 'vrac' || activeUser.role === 'vrin' || activeUser.role === 'diga';
  const isRectorado = activeUser.role === 'rectorado';

  const normalizedTerm = normalizeSearchText(searchTerm);
  const synonymCodes = getSynonymProcedureCodes(searchTerm);

  const filteredDocs = documents.filter((doc) => {
    const normTitle = normalizeSearchText(doc.title);
    const normCode = normalizeSearchText(doc.code);
    const normProcName = normalizeSearchText(doc.processName);
    const normDesc = normalizeSearchText(doc.description || '');
    const normUploadedBy = normalizeSearchText(doc.uploadedBy || '');

    const matchesSearch =
      !normalizedTerm ||
      normTitle.includes(normalizedTerm) ||
      normCode.includes(normalizedTerm) ||
      normProcName.includes(normalizedTerm) ||
      normDesc.includes(normalizedTerm) ||
      normUploadedBy.includes(normalizedTerm) ||
      synonymCodes.has(doc.code);

    const matchesType = selectedType === 'all' || doc.documentType === selectedType;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    const matchesProcess = selectedProcess === 'all' || doc.processCode === selectedProcess;

    let matchesDependency = true;
    if (selectedDependency !== 'all') {
      const depObj = UPT_DEPENDENCIES.find((d) => d.id === selectedDependency);
      if (depObj && depObj.filterKeywords.length > 0) {
        const combinedMeta = `${normUploadedBy} ${normProcName} ${normCode} ${normTitle}`.toLowerCase();
        matchesDependency = depObj.filterKeywords.some((kw) => combinedMeta.includes(kw.toLowerCase()));
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesProcess && matchesDependency;
  });

  const isFilterActive =
    searchTerm.trim() !== '' ||
    selectedDependency !== 'all' ||
    selectedType !== 'all' ||
    selectedStatus !== 'all' ||
    selectedProcess !== 'all';

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedDependency('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedProcess('all');
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    const procObj = UPT_PROCESSES.find((p) => p.code === newProcessCode);
    const category: ProcessCategory = procObj ? (procObj.category as ProcessCategory) : 'Estratégico';

    const newDoc: ISODocument = {
      id: `doc-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      documentType: newType,
      processCode: newProcessCode,
      processName: procObj ? procObj.name : 'Gestión Institucional',
      category,
      version: '01',
      status: canApprove ? 'vigente' : 'revision',
      fileName: `${newCode.trim().toUpperCase()}_${newTitle.slice(0, 30).trim().replace(/\s+/g, '_')}_v01.pdf`,
      fileSize: '1.1 MB',
      uploadedBy: activeUser.name,
      approvedBy: canApprove ? activeUser.name : undefined,
      approvalResolution: canApprove ? 'Aprobado internamente por GECA' : undefined,
      updatedAt: new Date().toISOString().split('T')[0],
      isoClause: newIsoClause,
      description: newDescription,
      storageLocation: newStorageLocation,
      retentionYears: newRetentionYears,
      finalDisposition: newFinalDisposition,
      changeLog: [
        {
          id: `cl-${Date.now()}`,
          version: '01',
          date: new Date().toISOString().split('T')[0],
          author: activeUser.name,
          reason: 'Creación e incorporación a la Lista Maestra de la UPT.',
        },
      ],
    };

    onSaveDocument(newDoc);
    onCloseNewModal();
    resetForm();
  };

  const resetForm = () => {
    setNewCode('');
    setNewTitle('');
    setNewType('Procedimiento');
    setNewProcessCode('PE.02');
    setNewIsoClause('ISO 9001: 7.5 / ISO 21001: 7.5');
    setNewDescription('');
    setNewStorageLocation('Repositorio Institucional / Calidad GECA');
    setNewRetentionYears('5 años post-obsolescencia');
    setNewFinalDisposition('Archivo Central / Digitalización Permanente');
  };

  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versioningDoc || !newVersionNumber || !newVersionReason) return;

    const updatedDoc: ISODocument = {
      ...versioningDoc,
      version: newVersionNumber,
      status: 'revision',
      updatedAt: new Date().toISOString().split('T')[0],
      changeLog: [
        {
          id: `cl-${Date.now()}`,
          version: newVersionNumber,
          date: new Date().toISOString().split('T')[0],
          author: activeUser.name,
          reason: newVersionReason,
        },
        ...versioningDoc.changeLog,
      ],
    };

    onSaveDocument(updatedDoc);
    setVersioningDoc(null);
    setNewVersionNumber('');
    setNewVersionReason('');
  };

  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Nombre del Documento',
      'Proceso',
      'Categoría',
      'Tipo',
      'Versión',
      'Estado',
      'Aprobación / Resolución',
      'Fecha',
      'Cláusula ISO',
      'Ubicación en Manual',
    ];

    const rows = filteredDocs.map((d) => [
      `"${d.code}"`,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.processCode} - ${d.processName}"`,
      `"${d.category}"`,
      `"${d.documentType}"`,
      `"v${d.version}"`,
      `"${d.status}"`,
      `"${d.approvalResolution || ''}"`,
      `"${d.updatedAt}"`,
      `"${d.isoClause}"`,
      `"${d.storageLocation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UPT_Lista_Maestra_Documentos_RG04_PE_02_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
              Formato RG04.PE.02 / RG05.PE.02
            </span>
            <span className="text-xs text-slate-500">Oficina de Gestión de la Calidad (GECA)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Lista Maestra de Documentos UPT</h1>
          <p className="text-sm text-slate-500">
            Inventario oficial basado en <span className="font-semibold text-slate-700">Lista Maestra de Documentos Internos_21_09.docx</span> con apertura exacta de página para cada procedimiento institucional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={SHAREPOINT_LISTA_MAESTRA_DOCX}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir Lista Maestra de Documentos Internos_21_09.docx oficial en SharePoint institucional UPT"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 shadow-2xs transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <span>SharePoint Docx (21/09)</span>
          </a>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar Lista Maestra</span>
          </button>

          {canCreate && (
            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-red-800 text-white hover:bg-red-900 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Procedimiento</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas resumen de estado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-400">Total Documentos</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{documents.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            {documents.filter((d) => d.documentType === 'Procedimiento').length} Procedimientos + {documents.filter((d) => d.documentType === 'Manual').length} Manuales
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-400">Vigentes (Oficiales)</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {documents.filter((d) => d.status === 'vigente').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Res. Rectoral N° 0418-2026</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-400">En Revisión / Borrador</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {documents.filter((d) => d.status === 'revision' || d.status === 'borrador').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">En proceso de aprobación</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-400">Procesos UPT Cubiertos</div>
          <div className="text-2xl font-bold text-red-800 mt-1">13 / 13</div>
          <div className="text-[11px] text-slate-400 mt-1">Estratégicos, Misionales, Soporte</div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Input de Búsqueda Inteligente */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por trámite cotidiano (ej: matrícula, título, compras, sueldos, biblioteca), código o tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-700 bg-slate-50/60 placeholder:text-slate-400 font-sans"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Borrar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botón Asistente Guiado Institucional */}
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all cursor-pointer shrink-0 border border-slate-800"
            title="Asistente para encontrar procedimientos por tema o trámite sin códigos"
          >
            <Compass className="w-4 h-4 text-red-400" />
            <span>Asistente Guiado de Búsqueda</span>
          </button>
        </div>

        {/* Filtros Institucionales */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtrar:</span>
          </div>

          {/* Filtro por Oficina / Dependencia */}
          <select
            value={selectedDependency}
            onChange={(e) => setSelectedDependency(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-700 bg-slate-50 hover:bg-white cursor-pointer font-medium max-w-[250px]"
            title="Filtrar por oficina o área responsable de la UPT"
          >
            {UPT_DEPENDENCIES.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>

          {/* Filtro por Proceso */}
          <select
            value={selectedProcess}
            onChange={(e) => setSelectedProcess(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-700 bg-slate-50 hover:bg-white cursor-pointer font-medium max-w-[210px]"
          >
            <option value="all">Todos los Procesos (13)</option>
            {UPT_PROCESSES.map((proc) => (
              <option key={proc.code} value={proc.code}>
                {proc.code} - {proc.name}
              </option>
            ))}
          </select>

          {/* Filtro por Tipo */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-700 bg-slate-50 hover:bg-white cursor-pointer font-medium"
          >
            <option value="all">Todos los Tipos ({documents.length})</option>
            <option value="Procedimiento">Procedimientos ({documents.filter((d) => d.documentType === 'Procedimiento').length})</option>
            <option value="Manual">Manuales ({documents.filter((d) => d.documentType === 'Manual').length})</option>
            <option value="Directiva / Política">Directivas</option>
            <option value="Reglamento">Reglamentos</option>
            <option value="Registro / Formato">Formatos (RG)</option>
          </select>

          {/* Filtro por Estado */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-700 bg-slate-50 hover:bg-white cursor-pointer font-medium"
          >
            <option value="all">Todos los Estados</option>
            <option value="vigente">Vigente</option>
            <option value="revision">En Revisión</option>
            <option value="borrador">Borrador</option>
            <option value="obsoleto">Obsoleto</option>
          </select>

          {/* Botón de Limpiar Filtros si hay algo activo */}
          {isFilterActive && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer border border-red-200 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Indicador de Resultados Activos */}
        {isFilterActive && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                Mostrando {filteredDocs.length} de {documents.length} documentos
              </span>
              {synonymCodes.size > 0 && searchTerm && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                  💡 Búsqueda temática inteligente activada
                </span>
              )}
            </div>
            {filteredDocs.length === 0 && (
              <span className="text-red-600 font-medium">
                No se encontraron coincidencias. Prueba borrando los filtros.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabla Oficial Lista Maestra */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 min-w-[320px]">Código / Nombre del Documento</th>
                <th className="px-4 py-3.5 min-w-[200px]">Proceso UPT</th>
                <th className="px-4 py-3.5">Tipo</th>
                <th className="px-3 py-3.5 text-center">Versión</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 min-w-[180px]">Ubicación en Manual</th>
                <th className="px-5 py-3.5 text-right min-w-[140px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No se encontraron documentos en la Lista Maestra con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const statusInfo = STATUS_CONFIG[doc.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        {doc.documentType !== 'Manual' && !doc.code.startsWith('MN') && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wider bg-slate-900 text-white font-sans shadow-2xs">
                              {doc.code}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-sans">
                              {doc.category}
                            </span>
                          </div>
                        )}
                        <div className={`font-medium text-slate-900 whitespace-normal break-words leading-snug ${doc.documentType !== 'Manual' && !doc.code.startsWith('MN') ? 'mt-1.5' : ''}`}>
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{doc.isoClause}</div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-700">
                        <div className="font-semibold text-slate-900">{doc.processCode}</div>
                        <div className="text-[11px] text-slate-500 whitespace-normal leading-normal mt-0.5">{doc.processName}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium font-sans">
                          {doc.documentType}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className="font-sans text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                          v{doc.version}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ' + statusInfo.color}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {(() => {
                          const { manual, page, range, rangeText, pageCount } = getPageAndManual(doc.code, doc.storageLocation, doc.description);
                          return (
                            <div className="space-y-1.5">
                              {range ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs shadow-2xs">
                                  <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>Págs. {rangeText}</span>
                                  <span className="text-[10px] text-amber-700 font-normal">({pageCount} pág.)</span>
                                </span>
                              ) : page ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs shadow-2xs">
                                  <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>Página {page}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                  Manual Institucional
                                </span>
                              )}
                              <div className="text-[11px] font-semibold text-slate-800 leading-tight">
                                {manual}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {doc.approvalResolution}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Botón principal: Abrir Procedimiento */}
                          <button
                            onClick={() => {
                              setTargetPdfPage(null); setReadingDoc(doc);
                              setReadingTab('pdf');
                            }}
                            title="Abrir Visor Oficial del Procedimiento (PDF en su página de referencia)"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-800 hover:bg-red-900 shadow-2xs transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Abrir</span>
                          </button>

                          {/* Ver Ficha Técnica */}
                          <button
                            onClick={() => setViewingDoc(doc)}
                            title="Ver ficha técnica de custodia e historial"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {doc.status === 'revision' && canApprove && (
                            <button
                              onClick={() => onApproveDocument(doc.id)}
                              title="Aprobar documento oficialmente"
                              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          )}

                          {canCreate && (
                            <button
                              onClick={() => {
                                setVersioningDoc(doc);
                                const parts = doc.version.split('.');
                                const major = parseInt(parts[0], 10) || 1;
                                setNewVersionNumber(String(major + 1).padStart(2, '0'));
                              }}
                              title="Crear nueva versión (Control de cambios)"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          )}

                          {canApprove && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Está seguro de eliminar el procedimiento ${doc.code} de la Lista Maestra?`)) {
                                  onDeleteDocument(doc.id);
                                }
                              }}
                              title="Eliminar procedimiento"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Visor Interactivo del Procedimiento Oficial UPT */}
      {readingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl lg:max-w-6xl my-4 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Cabecera formato oficial SGC UPT */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-900 to-red-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg border border-white/20">
                  🏛️
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-red-200">
                    Universidad Privada de Tacna &bull; Sistema de Gestión de la Calidad
                  </div>
                  <h2 className="text-base font-bold text-white leading-snug">
                    {readingDoc.code} - {readingDoc.title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getDocumentCloudUrl(readingDoc.code)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir documento en SharePoint UPT (Nube)"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SharePoint UPT</span>
                </a>
                <button
                  onClick={() => window.print()}
                  title="Imprimir procedimiento"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReadingDoc(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Barra de estado y metadatos */}
            <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-4">
                <span><strong>Proceso:</strong> {readingDoc.processCode} {readingDoc.processName}</span>
                <span><strong>Versión Oficial:</strong> v{readingDoc.version}</span>
                <span><strong>Estado:</strong> <span className="capitalize text-emerald-700 font-bold">{readingDoc.status}</span></span>
              </div>
              <div className="text-[11px] text-slate-500 font-sans font-semibold tracking-wide">
                {readingDoc.approvalResolution} &bull; Vigente desde: {readingDoc.updatedAt}
              </div>
            </div>

            {/* Contenido Oficial del Procedimiento */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700 leading-relaxed">
              {(() => {
                const { manual, page, range, startPage, endPage, activitiesPage, rangeText, pageCount } = getPageAndManual(readingDoc.code, readingDoc.storageLocation, readingDoc.description);
                const detailed = UPT_PROCEDURES_DETAILED[readingDoc.code];
                const officialObj = detailed ? detailed.objective : readingDoc.description;
                const officialScope = detailed ? detailed.scope : 'Aplica a todas las dependencias académicas y administrativas correspondientes de la Universidad Privada de Tacna.';

                return (
                  <>
                    {/* Banner Destacado de Ubicación de Página */}
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center font-bold shadow-xs shrink-0 px-1">
                          <span className="text-[9px] uppercase tracking-wider font-semibold">PÁGS</span>
                          <span className="text-xs leading-none font-sans font-bold tracking-tight text-center">{rangeText}</span>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                            Ubicación Exacta en el Manual Oficial UPT
                          </div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {manual} &bull; <span className="text-amber-900 underline decoration-amber-400">Páginas {rangeText} ({pageCount} {pageCount === 1 ? 'página' : 'páginas'})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Aprobado por Consejo Universitario &bull; {readingDoc.approvalResolution}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-wrap items-center gap-2">
                        {page && (
                          <span className="px-3 py-1.5 rounded-xl bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs border border-amber-300">
                            <BookOpen className="w-4 h-4 text-amber-800" />
                            <span>Págs. {rangeText} del PDF</span>
                          </span>
                        )}
                        <a
                          href={getDocumentExactPageUrl(readingDoc.code, page)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                          title={`Abrir PDF oficial directamente en la Página ${page || 1} en nueva pestaña`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Abrir en Pestaña Completa</span>
                        </a>
                        <a
                          href={getDocumentCloudUrl(readingDoc.code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Ver manual original completo en la nube de SharePoint UPT"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">SharePoint (Nube)</span>
                        </a>
                      </div>
                    </div>

                    {/* Selector de Pestañas: Visor PDF vs Ficha Estructurada */}
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                      <button
                        type="button"
                        onClick={() => setReadingTab('pdf')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          readingTab === 'pdf'
                            ? 'bg-red-800 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>📄 Documento Oficial PDF (Págs. {rangeText})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadingTab('details')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          readingTab === 'details'
                            ? 'bg-red-800 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>📋 Ficha y Resumen del Procedimiento</span>
                      </button>
                    </div>

                    {/* Vista 1: Visor de PDF Oficial Embebido (Predeterminada) */}
                    {readingTab === 'pdf' && (
                      <div className="space-y-3">
                        <PdfViewer
                          key={`${readingDoc.code}-${startPage}-${endPage}-${targetPdfPage || 'default'}`}
                          pdfUrl={getLocalPdfPath(readingDoc.code)}
                          startPage={startPage}
                          endPage={endPage}
                          initialPage={targetPdfPage || startPage}
                          activitiesPage={activitiesPage}
                          docCode={readingDoc.code}
                          docTitle={readingDoc.title}
                          manualName={manual}
                          className="w-full"
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <span>💡 <strong>Visualización Oficial Directa:</strong> Puede hacer zoom, imprimir o desplazarse por las páginas directamente en el visor de arriba.</span>
                          </span>
                          <a
                            href={getDocumentExactPageUrl(readingDoc.code, page)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold shrink-0 hover:underline"
                          >
                            <span>Abrir en Pestaña Completa</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Vista 2: Ficha Técnica y Resumen Estructurado */}
                    {readingTab === 'details' && (
                      <div className="space-y-6">
                        {/* Sección 1 y 2: Objetivo y Alcance Literales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 space-y-2">
                            <h3 className="font-bold text-red-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-red-700" />
                              <span>1. Objetivo Oficial del Procedimiento</span>
                            </h3>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                              {officialObj}
                            </p>
                            <div className="pt-2 text-[11px] text-slate-500">
                              <strong>Responsable Principal:</strong> {readingDoc.uploadedBy}
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-slate-700" />
                              <span>2. Alcance Institucional</span>
                            </h3>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {officialScope}
                            </p>
                            <div className="pt-2 text-[11px] text-slate-500">
                              <strong>Requisito Normativo:</strong> {readingDoc.isoClause}
                            </div>
                          </div>
                        </div>

                        {/* Sección de Acceso a Actividades Oficiales en PDF */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-red-50/40 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                Actividades y Diagrama de Flujo del Procedimiento
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Consulte el desarrollo oficial de actividades directamente en la pestaña del visor PDF incrustado.
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetPdfPage(activitiesPage);
                              setReadingTab('pdf');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs shrink-0"
                            title={`Ir directamente a la página ${activitiesPage} de actividades del procedimiento`}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Ver Actividades en PDF (Pág. {activitiesPage})</span>
                          </button>
                        </div>

                        {/* Sección 3: Registros y Formatos Vinculados */}
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-700" />
                            <span>3. Registros y Formatos Oficiales Vinculados (RG)</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-emerald-950">RG04.PE.02 Lista Maestra de Documentos</div>
                                <div className="text-[11px] text-emerald-700">Control de vigencia y revisiones</div>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Oficial</span>
                            </div>
                            <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-emerald-950">RG08.PE.02 Registro de No Conformidad</div>
                                <div className="text-[11px] text-emerald-700">En caso de desvíos en el procedimiento</div>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Oficial</span>
                            </div>
                          </div>
                        </div>

                        {/* Sección 4: Historial de Cambios */}
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <History className="w-4 h-4 text-slate-600" />
                            <span>4. Control de Cambios del Documento (Anexo 1 UPT)</span>
                          </h3>
                          <div className="space-y-2">
                            {readingDoc.changeLog && readingDoc.changeLog.length > 0 ? (
                              readingDoc.changeLog.map((log) => (
                                <div key={log.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-slate-900 font-sans font-semibold tracking-wide">v{log.version}</span> - {log.reason}
                                  </div>
                                  <div className="text-slate-400 text-[11px] shrink-0 ml-2">
                                    {log.date} &bull; {log.author}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-slate-400">Sin cambios registrados.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Pie del modal */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500">
                Documento controlado de la Universidad Privada de Tacna.
              </div>
              <button
                onClick={() => setReadingDoc(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Ver Ficha Técnica de Custodia */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-700" />
                <h3 className="font-bold text-slate-900">Ficha Documental - Lista Maestra UPT</h3>
              </div>
              <button 
                onClick={() => setViewingDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold tracking-wider bg-slate-900 text-white font-sans shadow-2xs">
                    {viewingDoc.code}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1.5">{viewingDoc.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">{viewingDoc.isoClause}</p>
                </div>
                <span className="font-sans text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                  Versión {viewingDoc.version}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400">Proceso:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{viewingDoc.processCode}</div>
                </div>
                <div>
                  <div className="text-slate-400">Tipo:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{viewingDoc.documentType}</div>
                </div>
                <div>
                  <div className="text-slate-400">Estado:</div>
                  <div className="font-semibold text-slate-800 mt-0.5 capitalize">{viewingDoc.status}</div>
                </div>
                <div>
                  <div className="text-slate-400">Aprobación:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{viewingDoc.approvedBy || 'Consejo Universitario'}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1 text-slate-600">
                <div><strong>Ubicación de Custodia:</strong> {viewingDoc.storageLocation}</div>
                <div><strong>Tiempo de Retención:</strong> {viewingDoc.retentionYears}</div>
                <div><strong>Disposición Final:</strong> {viewingDoc.finalDisposition}</div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Historial de Versiones (Anexo 1 - Control de Cambios)</span>
                </h4>

                <div className="space-y-3">
                  {viewingDoc.changeLog && viewingDoc.changeLog.length > 0 ? (
                    viewingDoc.changeLog.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-sans font-semibold tracking-wide font-bold text-slate-900">Versión {log.version}</span>
                          <span className="text-slate-400">{log.date} &bull; Autor: {log.author}</span>
                        </div>
                        <p className="text-xs text-slate-600">{log.reason}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400">Sin modificaciones previas registradas.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
              <button
                onClick={() => {
                  const doc = viewingDoc;
                  setViewingDoc(null);
                  setTargetPdfPage(null); setReadingDoc(doc);
                  setReadingTab('pdf');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-xl transition-colors cursor-pointer"
              >
                Abrir Procedimiento Completo
              </button>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Nueva Versión */}
      {versioningDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-red-700" />
                <h3 className="font-bold text-slate-900">Generar Nueva Versión</h3>
              </div>
              <button 
                onClick={() => setVersioningDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVersion} className="p-6 space-y-4">
              <div className="p-3 bg-red-50 text-red-900 rounded-2xl text-xs space-y-1">
                <div>Documento: <span className="font-bold">{versioningDoc.code} - {versioningDoc.title}</span></div>
                <div>Versión actual: <span className="font-sans font-semibold tracking-wide font-bold">v{versioningDoc.version}</span></div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nuevo Número de Versión *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 04"
                  value={newVersionNumber}
                  onChange={(e) => setNewVersionNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Justificación Técnica del Cambio (Anexo 1) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detalle los motivos y cambios realizados respecto a la versión anterior..."
                  value={newVersionReason}
                  onChange={(e) => setNewVersionReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setVersioningDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Registrar Versión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asistente Institucional de Búsqueda Guiada */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Cabecera Institucional */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-800 flex items-center justify-center text-white">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Asistente Institucional de Búsqueda UPT
                  </h2>
                  <p className="text-xs text-slate-300">
                    Encuentra tu procedimiento oficial seleccionando tu tema o trámite cotidiano
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas de Ámbitos Institucionales */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 mr-1">Ámbito:</span>
              {[
                { id: 'all', label: 'Todos los Temas' },
                { id: 'Misional', label: 'Formación y Estudiantes (Misional)' },
                { id: 'Soporte', label: 'Administración y Soporte' },
                { id: 'Estratégico', label: 'Dirección y Calidad' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedGuidePillar(tab.id as any);
                    setSelectedGuideTopicId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedGuidePillar === tab.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido con Scroll */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {GUIDE_TOPICS.filter(
                  (t) => selectedGuidePillar === 'all' || t.pillar === selectedGuidePillar
                ).map((topic) => {
                  const isExpanded = selectedGuideTopicId === topic.id;
                  const matchingDocs = documents.filter((d) =>
                    topic.procedureCodes.includes(d.code)
                  );

                  return (
                    <div
                      key={topic.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isExpanded
                          ? 'border-red-700 bg-red-50/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {topic.pillar}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 mt-1.5">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {topic.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          {matchingDocs.length} procedimientos asociados
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedGuideTopicId(isExpanded ? null : topic.id)
                          }
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                        >
                          {isExpanded ? 'Ocultar' : 'Ver Procedimientos'}
                        </button>
                      </div>

                      {/* Lista desplegada de procedimientos del tema */}
                      {isExpanded && (
                        <div className="mt-3.5 pt-3 border-t border-red-100 space-y-2">
                          {matchingDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="min-w-0">
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white font-sans mr-2">
                                  {doc.code}
                                </span>
                                <div className="text-xs font-medium text-slate-900 truncate mt-0.5">
                                  {doc.title}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsGuideModalOpen(false);
                                  setReadingDoc(doc);
                                  setTargetPdfPage(null);
                                  setReadingTab('pdf');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold bg-red-800 hover:bg-red-900 text-white rounded-lg shadow-2xs shrink-0 cursor-pointer transition-colors"
                              >
                                Ver PDF
                              </button>
                            </div>
                          ))}

                          <div className="pt-2 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm(topic.title);
                                setIsGuideModalOpen(false);
                              }}
                              className="text-xs font-semibold text-red-700 hover:text-red-800 underline cursor-pointer"
                            >
                              Filtrar estos procedimientos en la Lista Maestra →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pie de modal */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Sistema de Gestión de la Calidad (SGC) - Universidad Privada de Tacna
              </span>
              <button
                type="button"
                onClick={() => setIsGuideModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer transition-colors"
              >
                Cerrar Asistente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Nuevo Documento */}
      {isOpenNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-700" />
                <h3 className="font-bold text-slate-900">Registrar Nuevo Documento en Lista Maestra</h3>
              </div>
              <button 
                onClick={onCloseNewModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Código Oficial UPT *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: PM.01.03.06"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 font-sans font-semibold tracking-wide"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tipo de Documento *
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as DocumentType)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                  >
                    <option value="Procedimiento">Procedimiento</option>
                    <option value="Manual">Manual</option>
                    <option value="Directiva / Política">Directiva / Política</option>
                    <option value="Reglamento">Reglamento</option>
                    <option value="Registro / Formato">Registro / Formato</option>
                    <option value="Instructivo">Instructivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nombre Completo del Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Procedimiento de Matrícula y Convalidaciones"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Proceso Perteneciente *
                  </label>
                  <select
                    value={newProcessCode}
                    onChange={(e) => setNewProcessCode(e.target.value as ProcessLevel0)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                  >
                    {UPT_PROCESSES.map((proc) => (
                      <option key={proc.code} value={proc.code}>
                        {proc.code} - {proc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Cláusula ISO Asociada
                  </label>
                  <input
                    type="text"
                    value={newIsoClause}
                    onChange={(e) => setNewIsoClause(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Descripción u Objetivo del Documento
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve resumen del objetivo institucional..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Ubicación de Custodia
                  </label>
                  <input
                    type="text"
                    value={newStorageLocation}
                    onChange={(e) => setNewStorageLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tiempo de Retención
                  </label>
                  <input
                    type="text"
                    value={newRetentionYears}
                    onChange={(e) => setNewRetentionYears(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onCloseNewModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Registrar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
