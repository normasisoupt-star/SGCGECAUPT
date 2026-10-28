import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  UserPlus, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles,
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
  { name: 'Oficina de Planeamiento y Desarrollo (OPLA)', code: 'opla', role: 'opla' as UserRole, proc: ['PE.01'] as ProcessLevel0[], charge: 'Jefe de OPLA' },
  { name: 'Oficina de Gestión de la Calidad y Acreditación (GECA)', code: 'geca', role: 'geca' as UserRole, proc: ['PE.02', 'PE.03'] as ProcessLevel0[], charge: 'Jefe de la Oficina de Gestión de la Calidad' },
  { name: 'Área de Personal y Recursos Humanos (APHU)', code: 'aphu', role: 'aphu' as UserRole, proc: ['PS.01'] as ProcessLevel0[], charge: 'Jefe de Personal / Recursos Humanos' },
  { name: 'Oficina de Tecnologías de Información (TEIN)', code: 'tein', role: 'tein' as UserRole, proc: ['PS.04'] as ProcessLevel0[], charge: 'Jefe de Tecnologías de Información' },
  { name: 'Dirección de Escuela / Decanatos (GPAD)', code: 'director_escuela', role: 'director_escuela' as UserRole, proc: ['PM.01'] as ProcessLevel0[], charge: 'Director de Escuela Profesional' },
  { name: 'Vicerrectorado Académico (VRAC)', code: 'vrac', role: 'vrac' as UserRole, proc: ['PM.01'] as ProcessLevel0[], charge: 'Vicerrector Académico' },
  { name: 'Vicerrectorado de Investigación (VRIN)', code: 'vrin', role: 'vrin' as UserRole, proc: ['PM.02'] as ProcessLevel0[], charge: 'Vicerrector de Investigación' },
  { name: 'Dirección General de Administración (DIGA)', code: 'diga', role: 'diga' as UserRole, proc: ['PS.03', 'PS.05'] as ProcessLevel0[], charge: 'Director General de Administración' },
  { name: 'Responsabilidad Social Universitaria (RESU)', code: 'resu', role: 'resu' as UserRole, proc: ['PM.03'] as ProcessLevel0[], charge: 'Jefe de RSU' },
  { name: 'Centros de Información y Biblioteca (BISA)', code: 'bisa', role: 'bisa' as UserRole, proc: ['PS.02'] as ProcessLevel0[], charge: 'Jefe de Biblioteca y Centros de Información' },
  { name: 'Oficina de Admisión (ADMA)', code: 'adma', role: 'adma' as UserRole, proc: ['PM.01'] as ProcessLevel0[], charge: 'Jefe de Admisión' },
  { name: 'Oficina de Bienestar Universitario (OBUN)', code: 'obun', role: 'obun' as UserRole, proc: ['PM.01'] as ProcessLevel0[], charge: 'Jefe de Bienestar Universitario' },
  { name: 'Escuela de Postgrado (ESPG)', code: 'espg', role: 'espg' as UserRole, proc: ['PM.01'] as ProcessLevel0[], charge: 'Director de Postgrado' },
  { name: 'Equipo Auditor Interno SGC', code: 'auditor', role: 'auditor' as UserRole, proc: [] as ProcessLevel0[], charge: 'Auditor Líder ISO 21001 / ISO 9001' },
];

export const LoginLandingView: React.FC<LoginLandingViewProps> = ({
  users,
  activeUser,
  onLogin,
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [selectedUserId, setSelectedUserId] = useState<string>(activeUser?.id || users[0]?.id || '');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCharge, setRegCharge] = useState('');
  const [regOfficeIndex, setRegOfficeIndex] = useState(0);
  const [regRole, setRegRole] = useState<UserRole>('colaborador');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUser = users.find(u => u.id === selectedUserId) || activeUser || users[0];

  const handleSelectQuickOffice = (roleKey: string) => {
    const found = users.find(u => u.role === roleKey);
    if (found) {
      setSelectedUserId(found.id);
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

    // Auto login after 1.2s
    setTimeout(() => {
      const updatedUser: UserProfile = {
        ...newUser,
        id: `u-custom-${Date.now()}`,
      };
      onLogin(updatedUser);
    }, 1200);
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/upt_campus_fachada.jpg')` }}
    >
      {/* Capa de difuminado óptico de fondo (Lens blur + vignette suave) */}
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-md"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-900/40 pointer-events-none"></div>

      {/* 1. CABECERA: Escudo Oficial UPT Agrandado y Nítido */}
      <header className="relative z-10 flex flex-col items-center justify-center pt-2 sm:pt-4 pb-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="relative group cursor-pointer" title="Universidad Privada de Tacna - Veritas et Vita">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl group-hover:bg-amber-400/30 transition-all"></div>
          <img 
            src="/upt_escudo_oficial.png" 
            alt="Escudo Oficial de la Universidad Privada de Tacna - Veritas et Vita" 
            className="h-28 sm:h-36 md:h-40 w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.45)] group-hover:scale-105 transition-transform duration-300 relative z-10"
          />
        </div>
      </header>

      {/* 2. PANEL CENTRAL FLOTANTE (Glassmorphism Frosted Glass) */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto animate-in zoom-in-95 fade-in duration-500">
        <div className="bg-white/88 backdrop-blur-2xl rounded-3xl border border-white/70 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LADO IZQUIERDO: Información Institucional SGC UPT (Sin logo redundante) */}
          <div className="lg:col-span-5 p-7 sm:p-9 bg-gradient-to-br from-white/60 via-slate-50/70 to-red-50/40 border-b lg:border-b-0 lg:border-r border-slate-200/70 flex flex-col justify-between">
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100/80 border border-red-200/80 text-[10px] font-black uppercase tracking-wider text-red-900 mb-4 shadow-2xs">
                <Sparkles className="w-3 h-3 text-red-700" />
                <span>SGC Institucional UPT</span>
              </div>

              {/* Título Principal Limpio y Jerarquizado */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Sistema de Gestión de la Calidad
              </h1>
              <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-900 via-rose-800 to-amber-700 mt-1">
                SGC UPT
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Plataforma institucional para el aseguramiento de la calidad educativa, control documental y trazabilidad de procesos universitarios.
              </p>

              {/* Sellos Oficiales de Certificación ISO */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                  <div className="text-left">
                    <div className="text-[10px] font-bold tracking-tight">ISO 21001:2018</div>
                    <div className="text-[9px] text-sky-700 font-semibold">Org. Educativas</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <div className="text-left">
                    <div className="text-[10px] font-bold tracking-tight">ISO 9001:2015</div>
                    <div className="text-[9px] text-blue-700 font-semibold">Gestión de Calidad</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medallones Institucionales (98 Procedimientos & 61 Indicadores) */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-900 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-none">98</div>
                  <div className="text-[10px] font-bold text-slate-500 mt-0.5">Procedimientos</div>
                  <div className="text-[9px] text-red-800 font-semibold">Lista Maestra</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-none">61</div>
                  <div className="text-[10px] font-bold text-slate-500 mt-0.5">Indicadores</div>
                  <div className="text-[9px] text-amber-800 font-semibold">Multianual UPT</div>
                </div>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Tarjeta de Acceso y Registro con Píldoras Interactivas */}
          <div className="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between bg-white/95">
            <div>
              {/* Barra Superior de Pestañas + Badge de Oficinas Conectadas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setStatusMessage(null); }}
                    className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'border-red-900 text-red-900'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setStatusMessage(null); }}
                    className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'border-red-900 text-red-900'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Registrar Nuevo Funcionario
                  </button>
                </div>

                {/* Badge 16 Oficinas Conectadas */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>16 Oficinas Conectadas</span>
                </div>
              </div>

              {/* Mensaje de Estado / Alerta */}
              {statusMessage && (
                <div className={`mb-5 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 shadow-2xs ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}>
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* VISTA 1: INICIAR SESIÓN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-300">
                  {/* Selector Rápido de Oficinas (Chips de un solo toque) */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Acceso Rápido por Oficina:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'OPLA', code: 'PE.01', role: 'opla' },
                        { label: 'GECA', code: 'PE.02', role: 'geca' },
                        { label: 'APHU', code: 'PS.01', role: 'aphu' },
                        { label: 'TEIN', code: 'PS.04', role: 'tein' },
                        { label: 'VRAC', code: 'PM.01', role: 'vrac' },
                        { label: 'DIGA', code: 'PS.03', role: 'diga' },
                      ].map(chip => {
                        const isCurrent = currentUser?.role === chip.role;
                        return (
                          <button
                            key={chip.role}
                            type="button"
                            onClick={() => handleSelectQuickOffice(chip.role)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                              isCurrent
                                ? 'bg-red-900 text-white border-red-900 scale-105'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>{chip.label}</span>
                            <span className={`text-[10px] font-mono ${isCurrent ? 'text-red-200' : 'text-slate-500'}`}>
                              {chip.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector de Dependencia / Funcionario */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Dependencia u Oficina Universitaria
                    </label>
                    <div className="relative">
                      <select
                        value={currentUser?.id}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/80 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 transition-all text-slate-900 cursor-pointer"
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.officeName || u.department} — {u.name} ({u.charge})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Correo Institucional */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Correo Institucional (@upt.pe)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        readOnly
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-100/70 text-slate-700 text-xs font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-900 text-slate-900 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Opciones Adicionales */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-red-900 focus:ring-red-900"
                      />
                      <span className="font-medium text-[11px]">Recordar mi oficina</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Para soporte o restablecimiento de credenciales, comuníquese con la Oficina de Tecnologías de Información (TEIN) o GECA.')}
                      className="text-red-900 hover:text-red-950 font-bold text-[11px] hover:underline"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  </div>

                  {/* Botón Principal de Ingreso */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-900 via-rose-800 to-amber-700 hover:from-red-950 hover:to-amber-800 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-900/25 hover:shadow-xl hover:shadow-red-900/35 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 group"
                  >
                    <span>Ingresar a Mi Oficina</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}

              {/* VISTA 2: REGISTRO DE NUEVO FUNCIONARIO */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Nombres y Apellidos *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Mg. Carlos Albarracín"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Cargo o Puesto
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Especialista de Calidad"
                        value={regCharge}
                        onChange={(e) => setRegCharge(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-900 text-xs"
                      />
                    </div>
                  </div>

                  {/* Correo Institucional */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Correo Institucional (@upt.pe) *
                    </label>
                    <input
                      type="text"
                      placeholder="usuario@upt.pe"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-900 text-xs"
                    />
                  </div>

                  {/* Oficina Asignada */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Oficina o Dependencia Asignada *
                    </label>
                    <select
                      value={regOfficeIndex}
                      onChange={(e) => setRegOfficeIndex(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-900 text-xs cursor-pointer font-medium"
                    >
                      {OFFICE_DIRECTORY.map((off, idx) => (
                        <option key={off.code} value={idx}>
                          {off.name} {off.proc.length > 0 ? `[${off.proc.join(', ')}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rol en el SGC */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Rol de Acceso en el Sistema
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-900 text-xs cursor-pointer font-medium"
                    >
                      <option value="colaborador">Colaborador Administrativo (Consulta y Gestión de Procesos)</option>
                      <option value="director_escuela">Dueño de Proceso (Registro de Avances y Evidencias de KPIs)</option>
                      <option value="auditor">Auditor Interno Designado (Emisión de Dictámenes de Auditoría)</option>
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Tu cuenta quedará vinculada automáticamente a los procesos oficiales de tu oficina.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Completar Registro Institucional</span>
                  </button>
                </form>
              )}
            </div>

            {/* Pie de la tarjeta */}
            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Universidad Privada de Tacna &bull; 2026</span>
              <span className="font-semibold text-slate-500">Campus Capanique</span>
            </div>
          </div>
        </div>
      </main>

      {/* 3. PIE DE PÁGINA INFERIOR */}
      <footer className="relative z-10 text-center py-2 text-slate-300 text-[11px] font-medium drop-shadow-sm">
        UNIVERSIDAD PRIVADA DE TACNA &bull; OFICINA DE GESTIÓN DE LA CALIDAD (GECA) &bull; SISTEMA SGC ISO 21001 & ISO 9001
      </footer>
    </div>
  );
};
