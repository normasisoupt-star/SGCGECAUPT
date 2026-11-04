/**
 * Módulo de Seguridad y Protección Institucional SGC UPT
 * - Bloqueo de inspección, clic derecho y atajos de guardado/clonación (F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I/J/C)
 * - Protección Anti-Clickjacking (bloqueo de iframe en sitios de terceros)
 * - Prevención de arrastre y copia masiva no autorizada
 * - Advertencia y protección activa
 */

export function initSystemSecurity(): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. Protección Anti-Clickjacking (evita que el sistema sea incrustado en iframes de terceros para duplicarlo)
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = window.self.location.href;
    }
  } catch {
    // Si hay restricción cross-origin en el top window
  }

  // 2. Bloqueo de Clic Derecho (Menú Contextual)
  const handleContextMenu = (e: MouseEvent) => {
    // Permitir clic derecho en campos de texto (input, textarea) para comodidad del usuario al escribir
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    e.preventDefault();
  };

  // 3. Bloqueo de Atajos de Teclado de Inspección y Duplicación
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12: Abrir Herramientas de Desarrollador
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Ctrl + S: Guardar página web completa (clonación estática)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Ctrl + U: Ver código fuente de la página
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Ctrl + Shift + I / J / C: Abrir Inspector / Consola de Desarrollador
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  // 4. Bloqueo de arrastre de elementos para evitar clonación de imágenes y recursos
  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.tagName === 'IMG') {
      e.preventDefault();
    }
  };

  // Adjuntar listeners de seguridad al documento
  document.addEventListener('contextmenu', handleContextMenu, { capture: true });
  document.addEventListener('keydown', handleKeyDown, { capture: true });
  document.addEventListener('dragstart', handleDragStart, { capture: true });

  // 5. Advertencia de seguridad en consola
  if (typeof console !== 'undefined') {
    const warningStyle = 'font-size: 16px; font-weight: bold; color: #dc2626; text-shadow: 1px 1px #000;';
    const textStyle = 'font-size: 12px; color: #334155; font-weight: 500;';
    console.log('%c⚠️ SISTEMA DE GESTIÓN DE LA CALIDAD - UNIVERSIDAD PRIVADA DE TACNA', warningStyle);
    console.log('%cEste sistema y su contenido son de uso institucional restringido bajo la norma NTP-ISO 21001:2026. La duplicación, distribución o extracción no autorizada de código y documentos está estrictamente prohibida.', textStyle);
  }

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    document.removeEventListener('keydown', handleKeyDown, { capture: true });
    document.removeEventListener('dragstart', handleDragStart, { capture: true });
  };
}
