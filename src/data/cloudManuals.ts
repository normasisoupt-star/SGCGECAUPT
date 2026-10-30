export const UPT_CLOUD_MANUALS = {
  PROCESOS: {
    code: 'MN01.PE.01',
    name: 'Manual de Procesos de la UPT (v3.0)',
    url: 'https://uptpe-my.sharepoint.com/:b:/g/personal/licencia_institucional_upt_pe/IQB8YDTi8srJRbTT3GZ6q6j3AarUvX8AbOyKLcE4EFDsQME?e=tiSwgh',
    localFile: '/manuals/Manual_de_Procesos_UPT_v03.pdf',
  },
  SGC: {
    code: 'MN01.PE.02',
    name: 'Manual del Sistema de Gestión de la Calidad (v1.0)',
    url: 'https://uptpe-my.sharepoint.com/:b:/g/personal/licencia_institucional_upt_pe/IQDBLaiBW97mSZvqty8pj7GOAZqkDWWvLFEmTDaKSjBjLao?e=bEgQc2',
    localFile: '/manuals/Manual_SGC_UPT_v01.pdf',
  },
  ESTRATEGICOS: {
    code: 'MN02.PE.01',
    name: 'Manual de Procedimientos Estratégicos (v3.0)',
    url: 'https://uptpe-my.sharepoint.com/:b:/g/personal/licencia_institucional_upt_pe/IQBtTr5YxA-7T7euysRxmd7gAdmUT_IoyTDDAy1SiehPd3o?e=AiU73l',
    localFile: '/manuals/Manual_de_Procedimientos_Estrategicos_v3.0.pdf',
  },
  MISIONALES: {
    code: 'MN01.PM.01',
    name: 'Manual de Procedimientos Misionales (v3.0)',
    url: 'https://uptpe-my.sharepoint.com/:b:/g/personal/licencia_institucional_upt_pe/IQCFQypgF9xHSozfcY1k5zrWASV3My9PpUq9rsrv9VRUWv8?e=fEJaAq',
    localFile: '/manuals/Manual_de_Procedimientos_Misionales_v3.0.pdf',
  },
  SOPORTE: {
    code: 'MN01.PS.01',
    name: 'Manual de Procedimientos de Soporte (v3.0)',
    url: 'https://uptpe-my.sharepoint.com/:b:/g/personal/licencia_institucional_upt_pe/IQBs2FJNrazcTJ9LmELukrhHAYPkRy0B-zcH7LILgAe6DCM?e=Xgw3QN',
    localFile: '/manuals/Manual_de_Procedimientos_de_Soporte_v3.0.pdf',
  },
};

export const SHAREPOINT_LISTA_MAESTRA_DOCX = 'https://uptpe-my.sharepoint.com/:w:/g/personal/licencia_institucional_upt_pe/cQpPz-kp3DccSpsXKVHz4jBcEgUCuqAAae2ytvwZ6oKsf2TlFQ';

// Resuelve la ruta del PDF de manera absoluta considerando el subpath de GitHub Pages (/SGCGECAUPT/) o local
export function resolveManualPath(localFile: string): string {
  if (!localFile) return localFile;
  if (localFile.startsWith('http://') || localFile.startsWith('https://') || localFile.startsWith('blob:')) {
    return localFile;
  }
  const clean = localFile.replace(/^\.?\//, '');
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const basePath = pathname.endsWith('/') ? pathname : pathname.substring(0, pathname.lastIndexOf('/') + 1);
    return `${window.location.origin}${basePath}${clean}`;
  }
  return `./${clean}`;
}

export function getLocalPdfPath(code: string): string {
  let file = UPT_CLOUD_MANUALS.SGC.localFile;
  if (code === 'MN01.PE.01') file = UPT_CLOUD_MANUALS.PROCESOS.localFile;
  else if (code === 'MN01.PE.02') file = UPT_CLOUD_MANUALS.SGC.localFile;
  else if (code === 'MN02.PE.01' || code.startsWith('PE') || code.includes('.PE.')) file = UPT_CLOUD_MANUALS.ESTRATEGICOS.localFile;
  else if (code === 'MN01.PM.01' || code.startsWith('PM') || code.includes('.PM.')) file = UPT_CLOUD_MANUALS.MISIONALES.localFile;
  else if (code === 'MN01.PS.01' || code.startsWith('PS') || code.includes('.PS.')) file = UPT_CLOUD_MANUALS.SOPORTE.localFile;
  
  return resolveManualPath(file);
}

export function getDocumentExactPageUrl(code: string, page?: number | string | null): string {
  const basePath = getLocalPdfPath(code);
  const pageNum = page ? parseInt(String(page), 10) : 1;
  return `${basePath}#page=${pageNum || 1}`;
}

export function getDocumentCloudUrl(code: string): string {
  if (code === 'MN01.PE.01') return UPT_CLOUD_MANUALS.PROCESOS.url;
  if (code === 'MN01.PE.02') return UPT_CLOUD_MANUALS.SGC.url;
  if (code === 'MN02.PE.01' || code.startsWith('PE') || code.includes('.PE.')) return UPT_CLOUD_MANUALS.ESTRATEGICOS.url;
  if (code === 'MN01.PM.01' || code.startsWith('PM') || code.includes('.PM.')) return UPT_CLOUD_MANUALS.MISIONALES.url;
  if (code === 'MN01.PS.01' || code.startsWith('PS') || code.includes('.PS.')) return UPT_CLOUD_MANUALS.SOPORTE.url;
  return UPT_CLOUD_MANUALS.SGC.url;
}

export function getManualCloudName(code: string): string {
  if (code === 'MN01.PE.01') return UPT_CLOUD_MANUALS.PROCESOS.name;
  if (code === 'MN01.PE.02') return UPT_CLOUD_MANUALS.SGC.name;
  if (code === 'MN02.PE.01' || code.startsWith('PE') || code.includes('.PE.')) return UPT_CLOUD_MANUALS.ESTRATEGICOS.name;
  if (code === 'MN01.PM.01' || code.startsWith('PM') || code.includes('.PM.')) return UPT_CLOUD_MANUALS.MISIONALES.name;
  if (code === 'MN01.PS.01' || code.startsWith('PS') || code.includes('.PS.')) return UPT_CLOUD_MANUALS.SOPORTE.name;
  return 'Manual Institucional UPT';
}
