import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Download, 
  Printer, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  BookOpen,
  Layers,
  FileText,
  RefreshCw
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

interface PdfPageItemProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: number;
  index: number;
  totalInRange: number;
  isSingleMode?: boolean;
}

const PdfPageItem: React.FC<PdfPageItemProps> = ({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  index,
  totalInRange,
  isSingleMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!canvasRef.current || !pdfDoc) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      setRendering(true);

      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * pixelRatio, rotation });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const displayWidth = Math.round(viewport.width / pixelRatio);
        const displayHeight = Math.round(viewport.height / pixelRatio);
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        setPageSize((prev) => {
          if (prev && prev.width === displayWidth && prev.height === displayHeight) return prev;
          return { width: displayWidth, height: displayHeight };
        });

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!isCancelled) {
          setRendering(false);
          renderTaskRef.current = null;
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering PDF page ${pageNumber}:`, err);
        }
        if (!isCancelled) {
          setRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber, scale, rotation]);

  return (
    <div 
      id={`pdf-page-${pageNumber}`}
      className={`relative bg-white shadow-xl rounded-xl overflow-hidden border border-slate-300 mx-auto transition-shadow ${
        isSingleMode ? 'mb-0' : 'mb-8'
      }`}
      style={{
        width: pageSize ? `${pageSize.width}px` : 'auto',
        minHeight: pageSize ? `${pageSize.height}px` : '400px',
      }}
    >
      {/* Cabecera de Página */}
      {!isSingleMode && (
        <div className="bg-slate-100/95 backdrop-blur-xs px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 font-medium select-none sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-950 font-bold border border-amber-300 text-xs shadow-2xs">
              Página {pageNumber}
            </span>
            <span className="text-slate-500 font-semibold">
              (Hoja {index + 1} de {totalInRange} del procedimiento)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Documento Oficial SGC
          </span>
        </div>
      )}

      {/* Canvas */}
      <div className="relative bg-white flex items-center justify-center">
        {rendering && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex flex-col items-center justify-center z-10 text-slate-600">
            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
            <span className="text-xs font-semibold mt-2">Cargando pág. {pageNumber}...</span>
          </div>
        )}
        <canvas ref={canvasRef} className="block max-w-none" />
      </div>
    </div>
  );
};

interface PdfViewerProps {
  pdfUrl: string;
  startPage?: number;
  endPage?: number;
  initialPage?: number;
  activitiesPage?: number;
  docCode?: string;
  docTitle?: string;
  manualName?: string;
  className?: string;
  isFullDocument?: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  startPage = 1,
  endPage,
  initialPage,
  activitiesPage,
  docCode,
  docTitle,
  manualName,
  className = '',
  isFullDocument = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.25);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Viewing mode: 'all' (all procedure pages sequentially) or 'single' (one page with prev/next)
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [singleCurrentPage, setSingleCurrentPage] = useState<number>(startPage || 1);

  // Determine effective range (if full document / manual, render all pages from 1 to numPages)
  const isFull = Boolean(isFullDocument || endPage === undefined || endPage === null || endPage === 0);
  const effectiveStart = isFull ? 1 : Math.max(1, startPage || initialPage || 1);
  const effectiveEnd = isFull ? (numPages || effectiveStart) : Math.max(effectiveStart, endPage || effectiveStart);

  // List of all pages to render in 'all' mode
  const pagesInRange = useMemo(() => {
    if (!numPages) return [effectiveStart];
    const clampedStart = Math.min(effectiveStart, numPages);
    const clampedEnd = Math.min(Math.max(clampedStart, effectiveEnd), numPages);
    const pages: number[] = [];
    for (let p = clampedStart; p <= clampedEnd; p++) {
      pages.push(p);
    }
    return pages;
  }, [effectiveStart, effectiveEnd, numPages]);

  // Resolver la URL absoluta del PDF para que funcione tanto en localhost como en GitHub Pages
  const resolvedPdfUrl = useMemo(() => {
    if (!pdfUrl) return pdfUrl;
    if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://') || pdfUrl.startsWith('blob:')) {
      return pdfUrl;
    }
    const clean = pdfUrl.replace(/^\.?\//, '');
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const basePath = pathname.endsWith('/') ? pathname : pathname.substring(0, pathname.lastIndexOf('/') + 1);
      return `${window.location.origin}${basePath}${clean}`;
    }
    return `./${clean}`;
  }, [pdfUrl]);

  // Load the PDF document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({
      url: resolvedPdfUrl,
      cMapPacked: true,
      enableXfa: true,
    });

    loadingTask.promise
      .then((loadedDoc) => {
        if (isCancelled) return;
        setPdfDoc(loadedDoc);
        setNumPages(loadedDoc.numPages);
        const maxEnd = isFull ? loadedDoc.numPages : (endPage || effectiveStart);
        const target = initialPage && initialPage >= effectiveStart && initialPage <= maxEnd ? initialPage : effectiveStart;
        setSingleCurrentPage(target);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (isCancelled) return;
        console.error('Error loading PDF with PDF.js:', err);
        setError(`No se pudo cargar el documento oficial (${err.message || 'Error de conexión'}).`);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      try {
        loadingTask.destroy();
      } catch {
        // ignore
      }
    };
  }, [resolvedPdfUrl, reloadKey]);

  // Salto a página específica estrictamente dentro del contenedor del PDF (sin sacudir el modal ni la pantalla)
  const scrollToPage = (pageNum: number) => {
    if (viewMode === 'all') {
      const container = containerRef.current;
      const el = document.getElementById(`pdf-page-${pageNum}`);
      if (el && container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetScroll = container.scrollTop + (elRect.top - containerRect.top) - 16;
        container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    } else {
      setSingleCurrentPage(pageNum);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  };

  useEffect(() => {
    if (!loading && pdfDoc && initialPage && initialPage >= effectiveStart && initialPage <= effectiveEnd) {
      const timer = setTimeout(() => {
        scrollToPage(initialPage);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [loading, pdfDoc, initialPage, effectiveStart, effectiveEnd]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));
  const resetZoom = () => setScale(1.25);
  const fitWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 64;
      if (containerWidth > 300) {
        setScale(Math.min(Math.max(containerWidth / 800, 0.8), 2.2));
      }
    }
  };
  const rotateDoc = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current?.parentElement;
    if (!document.fullscreenElement) {
      el?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-900 shadow-md ${className}`}>
      {/* Barra de herramientas superior */}
      <div className="bg-slate-800 border-b border-slate-700 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-white text-xs select-none">
        
        {/* Identificador del procedimiento y rango oficial */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700/60 text-red-200 font-bold flex items-center gap-1.5 shadow-xs">
            <FileText className="w-3.5 h-3.5 text-red-400" />
            {isFull ? (
              <span>Manual Completo ({numPages || '...'} págs.)</span>
            ) : (
              <>
                <span>Págs. {effectiveStart} a {effectiveEnd}</span>
                <span className="text-red-300 font-normal">({pagesInRange.length} {pagesInRange.length === 1 ? 'página' : 'páginas'})</span>
              </>
            )}
          </div>

          {/* Selector de modo: Todas las páginas vs Una a una */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mostrar todas las páginas del documento de forma continua"
            >
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>Todas ({pagesInRange.length})</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ver una página a la vez"
            >
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>Individual</span>
              </span>
            </button>
          </div>
        </div>

        {/* Acceso rápido a las páginas del rango (Píldoras o Buscador) */}
        {pagesInRange.length > 1 && viewMode === 'all' && (
          pagesInRange.length <= 15 ? (
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-0.5 max-w-md">
              <span className="text-[11px] text-slate-400 mr-0.5">Saltar a:</span>
              {pagesInRange.map((p, idx) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => scrollToPage(p)}
                  className="px-2 py-0.5 rounded-md bg-slate-700 hover:bg-amber-600 hover:text-white text-[11px] font-bold text-slate-300 transition-colors cursor-pointer"
                  title={`Ir a Página ${p} (Hoja ${idx + 1})`}
                >
                  Pág. {p}
                </button>
              ))}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
              <span className="text-slate-400">Ir a pág:</span>
              <input
                type="number"
                min={effectiveStart}
                max={effectiveEnd}
                defaultValue={effectiveStart}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (val >= effectiveStart && val <= effectiveEnd) scrollToPage(val);
                  }
                }}
                className="w-14 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-bold text-center text-xs"
              />
              <span className="text-slate-400">de {effectiveEnd}</span>
            </div>
          )
        )}

        {/* Controles en modo Individual */}
        {viewMode === 'single' && (
          <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg px-2 py-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setSingleCurrentPage((prev) => Math.max(effectiveStart, prev - 1))}
              disabled={singleCurrentPage <= effectiveStart || loading}
              className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400">Pág.</span>
              <input
                type="number"
                min={effectiveStart}
                max={effectiveEnd}
                value={singleCurrentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val >= effectiveStart && val <= effectiveEnd) {
                    setSingleCurrentPage(val);
                  }
                }}
                className="w-12 px-1 py-0.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-bold text-center text-xs"
              />
              <span className="font-bold text-amber-300">de {effectiveEnd}</span>
            </div>
            <button
              type="button"
              onClick={() => setSingleCurrentPage((prev) => Math.min(effectiveEnd, prev + 1))}
              disabled={singleCurrentPage >= effectiveEnd || loading}
              className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controles de Zoom y Vista */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 0.6 || loading}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
            title="Reducir zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 font-mono text-[11px] text-slate-200 cursor-pointer"
            title="Restablecer zoom al 125%"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 3.0 || loading}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={fitWidth}
            className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] transition-colors cursor-pointer"
            title="Ajustar al ancho"
          >
            Ajustar
          </button>
          <button
            type="button"
            onClick={rotateDoc}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer"
            title="Girar 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Acciones de exportación y nueva pestaña */}
        <div className="flex items-center gap-1.5">
          <a
            href={`${resolvedPdfUrl}#page=${effectiveStart}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Abrir directamente en una nueva pestaña del navegador"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pestaña Completa</span>
          </a>

          <a
            href={resolvedPdfUrl}
            download
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            title="Descargar archivo PDF completo"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Pantalla Completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Área Principal de Visualización (Canvas HTML5 - Inmune a bloqueos) */}
      <div 
        ref={containerRef}
        className="relative flex-1 w-full min-h-[360px] sm:min-h-[460px] max-h-[58vh] sm:max-h-[66vh] overflow-auto bg-slate-950/95 p-3 sm:p-6"
      >
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[320px] sm:min-h-[400px] text-white space-y-3">
            <Loader2 className="w-9 h-9 text-red-500 animate-spin" />
            <div className="text-sm font-semibold">Cargando páginas del procedimiento oficial...</div>
            <div className="text-xs text-slate-400">
              {manualName || 'Manual Oficial'} &bull; Páginas {effectiveStart} a {effectiveEnd}
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-white space-y-4 my-auto min-h-[400px]">
            <div className="w-14 h-14 rounded-full bg-red-900/40 border border-red-500/50 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-red-200">No se pudo cargar el documento en este momento</h4>
              <p className="text-xs text-slate-400 max-w-md mt-1">{error}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar Carga</span>
              </button>
              <a
                href={`${resolvedPdfUrl}#page=${effectiveStart}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir en Pestaña Completa</span>
              </a>
            </div>
          </div>
        )}

        {!loading && !error && pdfDoc && (
          <div className="space-y-6">
            {viewMode === 'all' ? (
              // Muestra TODAS las páginas del procedimiento una debajo de otra en desplazamiento continuo
              pagesInRange.map((pageNum, idx) => (
                <PdfPageItem
                  key={pageNum}
                  pdfDoc={pdfDoc}
                  pageNumber={pageNum}
                  scale={scale}
                  rotation={rotation}
                  index={idx}
                  totalInRange={pagesInRange.length}
                />
              ))
            ) : (
              // Modo Individual: solo la página seleccionada
              <PdfPageItem
                key={singleCurrentPage}
                pdfDoc={pdfDoc}
                pageNumber={singleCurrentPage}
                scale={scale}
                rotation={rotation}
                index={singleCurrentPage - effectiveStart}
                totalInRange={pagesInRange.length}
                isSingleMode={true}
              />
            )}
          </div>
        )}
      </div>

      {/* Pie de estado del visor */}
      <div className="bg-slate-800/90 border-t border-slate-700/80 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white">{docCode || 'UPT'}</span>
          <span>&bull;</span>
          <span className="truncate max-w-md">{docTitle || 'Procedimiento Institucional'}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>Manual: <strong className="text-slate-200">{manualName || 'Oficial'}</strong></span>
          <span>&bull;</span>
          <span>
            {isFull ? (
              <>Documento Completo: <strong className="text-amber-300">{numPages || '...'} páginas</strong></>
            ) : (
              <>Procedimiento Completo: <strong className="text-amber-300">Págs. {effectiveStart} a {effectiveEnd} ({pagesInRange.length} {pagesInRange.length === 1 ? 'pág.' : 'págs.'})</strong></>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
