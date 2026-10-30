import React from 'react';
import { 
  LayoutDashboard, 
  Network,
  FileText, 
  LineChart,
  AlertTriangle, 
  ClipboardCheck, 
  History, 
  Building2,
  CheckCircle2
} from 'lucide-react';

export type NavTab = 'dashboard' | 'process_map' | 'documents' | 'indicators' | 'capa' | 'checklist' | 'logs';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  documentCount: number;
  openCapaCount: number;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  documentCount,
  openCapaCount,
  isAdmin = false,
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
      label: 'Pista de Auditoría',
      icon: History,
    },
  ];

  const availableNavItems = isAdmin
    ? navItems
    : navItems.filter((item) => ['dashboard', 'process_map', 'documents'].includes(item.id));

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
                  className={'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ' + (
                    isActive
                      ? 'bg-[#0d2d3f] text-white font-semibold shadow-sm border-l-4 border-[#9C7D0F]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={'w-5 h-5 shrink-0 ' + (isActive ? 'text-white' : 'text-slate-500')} />
                    <span className="text-xs truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (isActive ? 'bg-red-700 text-white' : item.badgeColor)}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Ficha Institucional UPT */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-red-50/40 border border-slate-200/80">
          <div className="flex items-center gap-2 text-red-950 font-bold text-xs mb-1">
            <Building2 className="w-4 h-4 text-red-700" />
            <span>Campus Capanique</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Universidad Privada de Tacna &bull; Licencia SUNEDU &bull; Certificación ISO 21001:2025.
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Oficina GECA</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3 h-3" />
              SGC v03
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 text-[11px] text-slate-400 text-center">
        <span>UPT &copy; 2026 - Gestión de Calidad</span>
      </div>
    </aside>
  );
};
