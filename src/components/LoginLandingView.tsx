import React, { useState } from 'react';
import { 
  ArrowRight, 
  UserPlus, 
  FileText, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserRole, ProcessLevel0 } from '../types';

interface LoginLandingViewProps {
  users: UserProfile[];
  activeUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  onRegisterUser: (user: Omit<UserProfile, 'id'>) => void;
}

const OFFICE_DIRECTORY = [
  { name: 'Oficina de Planeamiento y Desarrollo (OPLA)', code: 'opla', role: 'opla' as UserRole, proc: ['PE.01'] as ProcessLevel0[], charge: 'Jefe de OPLA', defaultUser: 'opla' },
  { name: 'Oficina de Gestión de la Calidad (GECA)', code: 'geca', role: 'geca' as UserRole, proc: ['PE.02', 'PE.03'] as ProcessLevel0[], charge: 'Jefe de Gestión de la Calidad', defaultUser: 'calidad' },
  { name: 'Área de Personal y Recursos Humanos (APHU)', code: 'aphu', role: 'aphu' as UserRole, proc: ['PS.01'] as ProcessLevel0[], charge: 'Jefe de Personal / RRHH', defaultUser: 'personal' },
  { name: 'Oficina de Tecnologías de Información (TEIN)', code: 'tein', role: 'tein' as UserRole, proc: ['PS.04'] as ProcessLevel0[], charge: 'Jefe de Tecnologías de Información', defaultUser: 'sistemas' },
  { name: 'Vicerrectorado Académico (VRAC)', code: 'vrac', role: 'vrac' as UserRole, proc: ['PM.01'] as ProcessLevel0[], charge: 'Vicerrector Académico', defaultUser: 'vrac' },
  { name: 'Vicerrectorado de Investigación (VRIN)', code: 'vrin', role: 'vrin' as UserRole, proc: ['PM.02'] as ProcessLevel0[], charge: 'Vicerrector de Investigación', defaultUser: 'investigacion' },
  { name: 'Dirección General de Administración (DIGA)', code: 'diga', role: 'diga' as UserRole, proc: ['PS.03', 'PS.05'] as ProcessLevel0[], charge: 'Director General de Administración', defaultUser: 'diga' },
  { name: 'Dirección de Escuela / Decanatos (GPAD)', code: 'director_escuela', role: 'director_escuela' as UserRole, proc: ['PM.01'] as ProcessLevel0[], charge: 'Director de Escuela', defaultUser: 'escuela' },
];

export const LoginLandingView: React.FC<LoginLandingViewProps> = ({
  users,
  activeUser,
  onLogin,
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const initialUser = activeUser || users[0];
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUser?.id || '');
  const [emailUsername, setEmailUsername] = useState<string>(() => {
    if (initialUser?.email) {
      return initialUser.email.replace('@upt.pe', '');
    }
    return 'calidad';
  });
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCharge, setRegCharge] = useState('');
  const [regOfficeIndex, setRegOfficeIndex] = useState(0);
  const [regRole, setRegRole] = useState<UserRole>('colaborador');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUser = users.find(u => u.id === selectedUserId) || initialUser;

  const handleSelectQuickOffice = (roleKey: string) => {
    const found = users.find(u => u.role === roleKey);
    if (found) {
      setSelectedUserId(found.id);
      setEmailUsername(found.email ? found.email.replace('@upt.pe', '') : found.role);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      onLogin(currentUser);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor complete su nombre y correo institucional.' });
      return;
    }

    const selectedOfficeDef = OFFICE_DIRECTORY[regOfficeIndex];
    const newUser: Omit<UserProfile, 'id'> = {
      name: regName.trim(),
      email: regEmail.trim().toLowerCase().endsWith('@upt.pe') ? regEmail.trim().toLowerCase() : `${regEmail.trim().toLowerCase()}@upt.pe`,
      charge: regCharge.trim() || selectedOfficeDef.charge,
      department: selectedOfficeDef.name,
      officeName: selectedOfficeDef.name,
      role: regRole,
      processCodes: selectedOfficeDef.proc,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    onRegisterUser(newUser);
    setStatusMessage({
      type: 'success',
      text: `¡Registro exitoso! Se ha habilitado tu espacio de trabajo para ${selectedOfficeDef.name}.`,
    });

    setTimeout(() => {
      const updatedUser: UserProfile = {
        ...newUser,
        id: `u-custom-${Date.now()}`,
      };
      onLogin(updatedUser);
    }, 1200);
  };

  return (
    <div className="h-screen max-h-screen w-full relative flex flex-col justify-center items-center px-4 py-2 font-sans overflow-hidden select-none">
      {/* BARRA SUPERIOR INSTITUCIONAL: PORTAL OFICIAL UPT • SGC */}
      <div className="fixed top-0 left-0 right-0 px-6 py-2.5 z-20 flex justify-between items-center bg-black/25 backdrop-blur-md border-b border-white/10 text-white text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-[11px] drop-shadow-sm font-sans">
            PORTAL OFICIAL UPT &bull; SGC
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-white/90">
          <span className="hidden sm:inline bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
            Tacna, Perú
          </span>
        </div>
      </div>

      {/* FONDO GENERAL: Fotografía oficial del campus UPT Capanique con luz natural */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10"
        style={{ 
          backgroundImage: `url('/upt_campus_fachada.jpg')`,
        }}
      />
      {/* CONTENEDOR PRINCIPAL FLOTANTE */}
      <div className="relative z-10 w-full max-w-[880px] xl:max-w-[920px] mx-auto my-auto pt-5 pb-1">
        
        {/* TARJETA CENTRAL: Glassmorphism translúcido de alta definición */}
        <div 
          className="relative py-6 sm:py-8 px-6 sm:px-8 lg:px-10"
          style={{
            background: 'rgba(255, 255, 255, 0.28)',
            backdropFilter: 'blur(8px) saturate(130%)',
            WebkitBackdropFilter: 'blur(8px) saturate(130%)',
            border: '1px solid rgba(255, 255, 255, 0.65)',
            borderRadius: '24px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.12)',
          }}
        >
          {/* ESCUDO UPT TOTALMENTE ENVUELTO POR EL FONDO DE CRISTAL */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <img 
              src="/upt_escudo_oficial.png" 
              alt="Escudo Oficial Universidad Privada de Tacna - Veritas et Vita" 
              className="h-24 sm:h-28 md:h-32 w-auto object-contain filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.16)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* LADO IZQUIERDO: TÍTULO, SELLOS ISO FORMALES Y MEDALLAS CONCÉNTRICAS */}
            <div className="flex flex-col justify-between pr-0 md:pr-8 pb-6 md:pb-0 border-b md:border-b-0 md:border-r border-white/60">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
                Sistema de <br />
                Gestión de la Calidad
              </h1>
              <div className="text-lg sm:text-xl font-black text-[#1E3F5D] mt-0.5 tracking-tight flex items-center gap-2">
                <span>SGC UPT</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#9C7D0F]/15 text-[#9C7D0F] border border-[#9C7D0F]/30">
                  VERITAS ET VITA
                </span>
              </div>

              {/* 4. BADGES ISO: Tarjetas rectangulares con 'Norma de Calidad', logotipo formal ISO y colores sincronizados */}
              <div className="mt-3 flex items-center gap-2.5">
                {/* ISO 21001:2018 */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-[#9C7D0F]/30 shadow-xs hover:border-[#1E3F5D] transition-colors">
                  <svg className="w-6 h-6 text-[#1E3F5D] shrink-0" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
                    <ellipse cx="50" cy="50" rx="20" ry="45" fill="none" stroke="currentColor" strokeWidth="4" />
                    <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="5" />
                    <line x1="15" y1="28" x2="85" y2="28" stroke="currentColor" strokeWidth="4" />
                    <line x1="15" y1="72" x2="85" y2="72" stroke="currentColor" strokeWidth="4" />
                  </svg>
                  <div className="leading-tight text-left">
                    <div className="text-[10px] font-bold text-[#9C7D0F] uppercase tracking-wider">Norma de Calidad</div>
                    <div className="text-xs font-black text-[#1E3F5D] tracking-tight">ISO 21001:2018</div>
                  </div>
                </div>

                {/* ISO 9001:2015 */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-[#9C7D0F]/30 shadow-xs hover:border-[#1E3F5D] transition-colors">
                  <svg className="w-6 h-6 text-[#1E3F5D] shrink-0" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
                    <ellipse cx="50" cy="50" rx="20" ry="45" fill="none" stroke="currentColor" strokeWidth="4" />
                    <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="5" />
                    <line x1="15" y1="28" x2="85" y2="28" stroke="currentColor" strokeWidth="4" />
                    <line x1="15" y1="72" x2="85" y2="72" stroke="currentColor" strokeWidth="4" />
                  </svg>
                  <div className="leading-tight text-left">
                    <div className="text-[10px] font-bold text-[#9C7D0F] uppercase tracking-wider">Norma de Calidad</div>
                    <div className="text-xs font-black text-[#1E3F5D] tracking-tight">ISO 9001:2015</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. INDICADORES INFERIORES: Medallas con anillo concéntrico oro rectoral (#9C7D0F) y azul (#1E3F5D) */}
            <div className="mt-4 flex items-center gap-6">
              {/* Medalla 98 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 p-1 shadow-md border-2 border-[#1E3F5D]/25 ring-2 ring-[#1E3F5D]/10">
                  <div className="w-full h-full rounded-full border border-[#1E3F5D]/30 flex flex-col items-center justify-center p-1 bg-white/60">
                    <FileText className="w-4 h-4 text-[#1E3F5D] mb-0.5" />
                    <span className="text-lg sm:text-xl font-black text-[#1E3F5D] leading-none">98</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-2 max-w-[90px] leading-tight">
                  Procedimientos vigentes
                </span>
              </div>

              {/* Medalla 61 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 p-1 shadow-md border-2 border-[#9C7D0F]/35 ring-2 ring-[#9C7D0F]/15">
                  <div className="w-full h-full rounded-full border border-[#9C7D0F]/40 flex flex-col items-center justify-center p-1 bg-white/60">
                    <TrendingUp className="w-4 h-4 text-[#9C7D0F] mb-0.5" />
                    <span className="text-lg sm:text-xl font-black text-[#1E3F5D] leading-none">61</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-2 max-w-[90px] leading-tight">
                  Indicadores monitoreados
                </span>
              </div>
            </div>

            {/* Pie de acreditación institucional: Oficina Gestión de la Calidad */}
            <div className="mt-4 pt-2 border-t border-slate-300/50 flex items-center justify-start text-[11px] text-slate-700 font-semibold tracking-wide">
              <span>Oficina Gestión de la Calidad</span>
            </div>
          </div>

          {/* LADO DERECHO: FORMULARIO LIMPIO */}
          <div className="flex flex-col justify-between pl-0 md:pl-6 pt-4 md:pt-0">
            <div>
              {/* Pestañas Iniciar Sesión / Registrar */}
              <div className="flex items-center gap-6 border-b border-slate-300/60 pb-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setStatusMessage(null); }}
                  className={`text-xs font-bold transition-all cursor-pointer relative pb-1.5 ${
                    activeTab === 'login'
                      ? 'text-[#1E3F5D] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1E3F5D]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setStatusMessage(null); }}
                  className={`text-xs font-bold transition-all cursor-pointer relative pb-1.5 ${
                    activeTab === 'register'
                      ? 'text-[#1E3F5D] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1E3F5D]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Registrar Nuevo Funcionario
                </button>
              </div>

              {/* Pill Badge: 🟢 16 Oficinas Conectadas */}
              <div className="mt-2 mb-2 flex justify-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#9C7D0F]/20 text-slate-800 text-xs font-bold shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                  <span>16 Oficinas Conectadas</span>
                </div>
              </div>

              {/* Mensajes de Alerta */}
              {statusMessage && (
                <div className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-100/90 text-emerald-950 border border-emerald-300'
                    : 'bg-rose-100/90 text-rose-950 border border-rose-300'
                }`}>
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* 6. FORMULARIO: Con colores sincronizados de Stitch (#1E3F5D y #9C7D0F) */}
              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-2">
                  {/* Campo Correo Institucional con @upt.pe fijo a la derecha */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Correo Institucional
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={emailUsername}
                        onChange={(e) => {
                          const val = e.target.value.replace('@upt.pe', '');
                          setEmailUsername(val);
                        }}
                        placeholder="usuario"
                        className="w-full pl-3.5 pr-20 py-1.5 rounded-xl bg-white/75 border border-white/90 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:bg-white focus:border-[#1E3F5D] focus:ring-2 focus:ring-[#1E3F5D]/20 transition-all"
                      />
                      <span className="absolute right-3.5 text-xs font-bold text-[#1E3F5D]/70 pointer-events-none select-none">
                        @upt.pe
                      </span>
                    </div>
                  </div>

                  {/* Campo Contraseña */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-1.5 pr-10 rounded-xl bg-white/75 border border-white/90 text-xs font-mono text-slate-900 shadow-inner focus:outline-none focus:bg-white focus:border-[#1E3F5D] focus:ring-2 focus:ring-[#1E3F5D]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Chips de Acceso Rápido de Oficinas */}
                  <div>
                    <div className="text-[10px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Acceso rápido de oficinas:</span>
                      <span className="text-[10px] font-bold text-[#9C7D0F]">SGC ISO</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'OPLA', code: 'PE.01', role: 'opla' },
                        { label: 'GECA', code: 'PE.02', role: 'geca' },
                        { label: 'APHU', code: 'PS.01', role: 'aphu' },
                        { label: 'TEIN', code: 'PS.04', role: 'tein' },
                        { label: 'VRAC', code: 'PM.01', role: 'vrac' },
                      ].map(chip => {
                        const isSelected = currentUser?.role === chip.role;
                        return (
                          <button
                            key={chip.role}
                            type="button"
                            onClick={() => handleSelectQuickOffice(chip.role)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 shadow-2xs ${
                              isSelected
                                ? 'bg-[#1E3F5D] text-white border-[#1E3F5D] scale-105 shadow-sm'
                                : 'bg-white/75 hover:bg-white text-slate-700 border-white/80'
                            }`}
                          >
                            <span>{chip.label}</span>
                            <span className={`text-[10px] font-mono ${isSelected ? 'text-[#fdd666]' : 'text-slate-500'}`}>
                              {chip.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BOTÓN PRINCIPAL: Azul Institucional Stitch (#1E3F5D) con esquinas redondeadas (rounded-xl) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#1E3F5D] to-[#132B42] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group border-t border-white/20"
                    >
                      <span>Ingresar a Mi Oficina</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              ) : (
                /* REGISTRO DE NUEVO FUNCIONARIO */
                <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nombres y Apellidos *</label>
                      <input
                        type="text"
                        placeholder="Ej. Mg. Carlos Albarracín"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-lg bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1E3F5D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Cargo o Puesto</label>
                      <input
                        type="text"
                        placeholder="Ej. Especialista de Calidad"
                        value={regCharge}
                        onChange={(e) => setRegCharge(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1E3F5D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Correo Institucional (@upt.pe) *</label>
                    <input
                      type="text"
                      placeholder="usuario@upt.pe"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1E3F5D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Oficina Asignada *</label>
                    <select
                      value={regOfficeIndex}
                      onChange={(e) => setRegOfficeIndex(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1E3F5D] cursor-pointer font-medium"
                    >
                      {OFFICE_DIRECTORY.map((off, idx) => (
                        <option key={off.code} value={idx}>
                          {off.name} {off.proc.length > 0 ? `[${off.proc.join(', ')}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Rol en el SGC</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1E3F5D] cursor-pointer font-medium"
                    >
                      <option value="colaborador">Colaborador Administrativo</option>
                      <option value="director_escuela">Dueño de Proceso</option>
                      <option value="auditor">Auditor Interno</option>
                    </select>
                  </div>

                  <div className="pt-1.5">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#1E3F5D] to-[#132B42] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-t border-white/20"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Completar Registro Institucional</span>
                    </button>
                  </div>
                </form>
              )}

              {/* MESA DE AYUDA SGC */}
              <div className="mt-2.5 pt-2 border-t border-slate-300/40 text-center">
                <div className="text-[10px] font-bold text-[#1E3F5D] uppercase tracking-wider mb-1">
                  Mesa de Ayuda SGC
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-slate-700">
                  <a href="mailto:autoevaluacion@upt.edu.pe" className="text-[#1E3F5D] font-medium hover:underline">
                    autoevaluacion@upt.edu.pe
                  </a>
                  <span className="text-slate-400">&bull;</span>
                  <a href="https://www.upt.edu.pe" target="_blank" rel="noreferrer" className="text-[#1E3F5D] font-medium hover:underline">
                    www.upt.edu.pe
                  </a>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-[#9C7D0F] font-bold">051-427212 (443)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
