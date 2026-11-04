import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FileText, 
  FileSpreadsheet, 
  FileCheck, 
  Download, 
  Eye, 
  Search, 
  ExternalLink, 
  ChevronRight, 
  ArrowLeft, 
  X, 
  BookOpen, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  REPO_FOLDERS, 
  REPO_ROOT_FILES, 
  REPO_EXTERNAL_DOCS, 
  REPO_MANUALS, 
  REPO_RISKS, 
  RepoFileItem, 
  RepoFolder, 
  SHAREPOINT_REPOSITORIO_SGC_URL 
} from '../data/repositoryData';
import { PdfViewer } from './PdfViewer';

export const RepositoryView: React.FC = () => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [readingPdf, setReadingPdf] = useState<RepoFileItem | null>(null);

  // Determinar los archivos a mostrar según la carpeta activa o búsqueda
  const currentFolder = useMemo(() => {
    return REPO_FOLDERS.find((f) => f.id === currentFolderId) || null;
  }, [currentFolderId]);

  const activeFileList = useMemo(() => {
    if (currentFolderId === 'externos') return REPO_EXTERNAL_DOCS;
    if (currentFolderId === 'manuales') return REPO_MANUALS;
    if (currentFolderId === 'riesgos') return REPO_RISKS;
    return REPO_ROOT_FILES;
  }, [currentFolderId]);

  const filteredFiles = useMemo(() => {
    return activeFileList.filter((file) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q || 
        file.name.toLowerCase().includes(q) || 
        file.code.toLowerCase().includes(q) || 
        file.description.toLowerCase().includes(q);

      const matchesType = 
        selectedType === 'all' || 
        file.fileType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [activeFileList, searchQuery, selectedType]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'word':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'pdf':
        return <FileCheck className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'word':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'excel':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pdf':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner Superior Principal */}
      <div className="rounded-3xl bg-gradient-to-r from-[#001826] via-[#0d2d3f] to-[#164e63] p-6 sm:p-8 text-white shadow-xl border-b-4 border-[#9C7D0F] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#F3E5AB] text-xs font-bold tracking-wider uppercase mb-3 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#F3E5AB]" />
              <span>Universidad Privada de Tacna &bull; Repositorio Institucional SGC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Repositorio SGC y Formatos Oficiales
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Consulta y descarga directa de plantillas editables en Word (.docx), tableros Excel (.xlsx), manuales institucionales y normativas externas oficiales bajo la norma NTP-ISO 21001:2026.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <a
              href={currentFolder?.sharepointUrl || SHAREPOINT_REPOSITORIO_SGC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#9C7D0F] hover:bg-[#b59214] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              title="Abrir carpeta original en la nube de SharePoint / OneDrive UPT"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir en SharePoint UPT</span>
            </a>
          </div>
        </div>
      </div>

      {/* Barra de Navegación (Breadcrumbs) y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
          <button
            onClick={() => {
              setCurrentFolderId(null);
              setSearchQuery('');
            }}
            className={`hover:text-[#0d2d3f] transition-colors cursor-pointer flex items-center gap-1.5 ${
              !currentFolderId ? 'text-[#0d2d3f] font-bold' : 'text-slate-500'
            }`}
          >
            <Folder className="w-4 h-4 text-amber-500" />
            <span>REPOSITORIO SGC (Raíz)</span>
          </button>

          {currentFolder && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[#0d2d3f] font-bold flex items-center gap-1">
                <span>{currentFolder.name}</span>
                <span className="text-xs text-slate-400 font-normal">({currentFolder.itemCount} archivos)</span>
              </span>
            </>
          )}
        </div>

        {/* Buscador y Filtro por Tipo */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-slate-50 hover:bg-white"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] bg-slate-50 hover:bg-white font-medium cursor-pointer"
          >
            <option value="all">Todos los formatos</option>
            <option value="word">Plantillas Word (.docx)</option>
            <option value="excel">Hojas Excel (.xlsx)</option>
            <option value="pdf">Documentos PDF (.pdf)</option>
          </select>
        </div>
      </div>

      {/* Si estamos en la Raíz, mostramos las 3 Carpetas Principales de SharePoint */}
      {!currentFolderId && !searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-sans flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-500" />
              <span>Carpetas Principales del Repositorio</span>
            </h2>
            <span className="text-xs text-slate-400">3 carpetas oficiales</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REPO_FOLDERS.map((folder) => (
              <div
                key={folder.id}
                onClick={() => {
                  setCurrentFolderId(folder.id);
                  setSearchQuery('');
                }}
                className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-[#0d2d3f]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Folder className="w-6 h-6 fill-white/20" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      {folder.itemCount} {folder.itemCount === 1 ? 'archivo' : 'archivos'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0d2d3f] transition-colors leading-snug">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {folder.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0d2d3f] group-hover:translate-x-1 transition-transform">
                  <span>Abrir Carpeta</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de Retorno si estamos dentro de una carpeta */}
      {currentFolderId && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentFolderId(null)}
              className="p-2 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Raíz</span>
            </button>
            <div>
              <div className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Carpeta: {currentFolder?.name}
              </div>
              <div className="text-[11px] text-amber-800">
                {currentFolder?.description}
              </div>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-900 bg-amber-200/60 px-3 py-1 rounded-full border border-amber-300">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'documento disponible' : 'documentos disponibles'}
          </span>
        </div>
      )}

      {/* Lista de Archivos (Tabla Moderna y Limpia) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#0d2d3f]" />
              <span>
                {currentFolder ? `Documentos en ${currentFolder.name}` : 'Formatos y Archivos Oficiales en Raíz (16)'}
              </span>
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Acceso institucional habilitado para todos los usuarios y cargos de la Universidad Privada de Tacna.
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-200/70 text-slate-700 rounded-full font-sans">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'archivo' : 'archivos'}
          </span>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No se encontraron documentos en esta carpeta con los criterios de búsqueda aplicados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Información Principal del Archivo */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    {getFileIcon(file.fileType)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold font-sans bg-slate-900 text-white shadow-2xs">
                        {file.code}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border uppercase font-sans ${getBadgeColor(file.fileType)}`}>
                        {file.fileType === 'word' ? 'Plantilla Word (.docx)' : file.fileType === 'excel' ? 'Hoja Excel (.xlsx)' : 'Documento PDF (.pdf)'}
                      </span>
                      {file.processCode && (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                          Proceso: {file.processCode}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {file.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-medium">
                      <span>Tamaño: {file.fileSize}</span>
                      <span>&bull;</span>
                      <span>Fecha: {file.date}</span>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                  {file.fileType === 'pdf' && (
                    <button
                      onClick={() => setReadingPdf(file)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                      title="Abrir visor interactivo del PDF"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver PDF</span>
                    </button>
                  )}

                  <a
                    href={file.downloadUrl}
                    download={file.name}
                    className={`px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-md transition-all cursor-pointer ${
                      file.fileType === 'word'
                        ? 'bg-blue-700 hover:bg-blue-800'
                        : file.fileType === 'excel'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-700 hover:bg-slate-800'
                    }`}
                    title={`Descargar ${file.name} a tu computadora`}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {file.fileType === 'word'
                        ? 'Descargar Word'
                        : file.fileType === 'excel'
                        ? 'Descargar Excel'
                        : 'Descargar PDF'}
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Visor de PDF Embebido para Documentos PDF del Repositorio */}
      {readingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl lg:max-w-6xl my-auto overflow-hidden flex flex-col h-[94vh] max-h-[94vh]">
            {/* Header del Modal */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#0d2d3f] to-[#001826] border-b-2 border-[#9C7D0F] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg border border-white/20">
                  📄
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#F3E5AB] font-outfit">
                    Universidad Privada de Tacna &bull; Repositorio SGC
                  </div>
                  <h2 className="text-base font-bold text-white leading-snug">
                    {readingPdf.code} - {readingPdf.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={readingPdf.downloadUrl}
                  download={readingPdf.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  title="Descargar archivo PDF completo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Descargar PDF</span>
                </a>
                <button
                  onClick={() => setReadingPdf(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido del PDF */}
            <div className="flex-1 p-4 overflow-hidden bg-slate-100 flex flex-col">
              <PdfViewer
                key={readingPdf.id}
                pdfUrl={readingPdf.downloadUrl}
                isFullDocument={true}
                docCode={readingPdf.code}
                docTitle={readingPdf.name}
                manualName="Repositorio SGC UPT"
                className="w-full h-full flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
