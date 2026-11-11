import React from 'react';
import { 
  LayoutDashboard, 
  Network,
  FileText, 
  FolderOpen,
  LineChart,
  AlertTriangle, 
  ClipboardCheck, 
  History, 
  Building2,
  CheckCircle2
} from 'lucide-react';

import { OptionalUserModule } from '../types';

export type NavTab = 'dashboard' | 'process_map' | 'documents' | 'repository' | 'indicators' | 'capa' | 'checklist' | 'logs';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  documentCount: number;
  openCapaCount: number;
  isAdmin?: boolean;
  enabledModules?: OptionalUserModule[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  documentCount,
  openCapaCount,
  isAdmin = false,
  enabledModules = [],
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Panel Principal',
      icon: LayoutDashboard,
    },
    {
      id: 'process_map' as NavTab,
      label: 'Mapa de Procesos (13)',
      icon: Network,
      badge: '94 procs',
      badgeColor: 'bg-[#0b4967]/10 text-[#0b4967] font-semibold',
    },
    {
      id: 'documents' as NavTab,
      label: 'Lista Maestra (RG04)',
      icon: FileText,
      badge: documentCount,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'repository' as NavTab,
      label: 'Repositorio SGC',
      icon: FolderOpen,
      badge: '16 formatos',
      badgeColor: 'bg-amber-100 text-amber-900 font-bold',
    },
    {
      id: 'indicators' as NavTab,
      label: 'Tablero de Indicadores',
      icon: LineChart,
      badge: 'Metas',
      badgeColor: 'bg-[#9C7D0F]/15 text-[#9C7D0F] font-bold',
    },
    {
      id: 'capa' as NavTab,
      label: 'No Conformidades (RG08)',
      icon: AlertTriangle,
      badge: openCapaCount,
      badgeColor: openCapaCount > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'checklist' as NavTab,
      label: 'Evaluación ISO 21001',
      icon: ClipboardCheck,
    },
    {
      id: 'logs' as NavTab,
      label: 'Usuarios y Auditoría',
      icon: History,
      badge: 'Control',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
  ];

  const allowedUserTabs = new Set<NavTab>(['dashboard', 'process_map', 'documents', 'repository', ...enabledModules]);
  const availableNavItems = isAdmin
    ? navItems
    : navItems.filter((item) => allowedUserTabs.has(item.id));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            SGC &bull; UPT TACNA
          </div>
          <nav className="space-y-1">
            {availableNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#001826] text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#F3E5AB]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#9C7D0F] text-white font-bold'
                          : item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Banner Institucional ISO 21001 */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SGOE UPT VIGENTE</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Sistema de Gestión para Organizaciones Educativas bajo la norma NTP-ISO 21001:2026.
          </p>
        </div>
      </div>

      {/* Footer del Sidebar */}
      <div className="p-4 border-t border-slate-200 text-[11px] text-slate-400">
        <div className="font-semibold text-slate-700">Oficina de Gestión de la Calidad</div>
        <div>GECA &bull; Versión 3.0 (2026)</div>
      </div>
    </aside>
  );
};
