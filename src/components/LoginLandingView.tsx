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
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/upt_campus_fachada.jpg')` }}
    >
      {/* Capa de desenfoque suave idéntica al mockup (suave y diurna) */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[5px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none"></div>

      {/* CONTENEDOR PRINCIPAL FLOTANTE */}
      <div className="relative z-10 max-w-5xl w-full mx-auto my-auto pt-16 sm:pt-20">
        
        {/* ESCUDO OFICIAL UPT SUPERPUESTO EN EL BORDE SUPERIOR (Exactamente como en la muestra 1) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <img 
            src="/upt_escudo_oficial.png" 
            alt="Escudo Oficial Universidad Privada de Tacna - Veritas et Vita" 
            className="h-32 sm:h-44 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)] filter contrast-105"
          />
        </div>

        {/* TARJETA UNIFICADA DE VIDRIO ESMERILADO (FROSTED GLASS CONTINUO) */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/70 shadow-[0_25px_60px_rgba(0,0,0,0.18)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 pt-16 sm:pt-20 pb-8 sm:pb-10 px-6 sm:px-10">
          
          {/* LADO IZQUIERDO: TÍTULO, SELLOS ISO Y MEDALLONES CIRCULARES */}
          <div className="lg:col-span-5 flex flex-col justify-between pr-0 lg:pr-8 pb-8 lg:pb-0 border-b lg:border-b-0 lg:border-r border-white/50">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Sistema de <br />
                Gestión de la Calidad
              </h1>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                SGC UPT
              </div>

              {/* SELLOS OFICIALES ISO (Diseño gemelo al mockup) */}
              <div className="mt-6 sm:mt-8 flex items-center gap-3">
                {/* ISO 21001 */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-sky-300 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center font-black text-[9px] tracking-tighter">
                    ISO
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-sky-900 leading-tight">ISO</div>
                    <div className="text-[10px] font-bold text-sky-700">21001:2018</div>
                  </div>
                </div>

                {/* ISO 9001 */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-blue-400 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-blue-800 text-white flex items-center justify-center font-black text-[9px] tracking-tighter">
                    ISO
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-blue-950 leading-tight">ISO</div>
                    <div className="text-[10px] font-bold text-blue-800">9001:2015</div>
                  </div>
                </div>
              </div>
            </div>

            {/* MEDALLONES CIRCULARES INSTITUCIONALES (Diseño exacto al mockup) */}
            <div className="mt-8 flex items-center gap-6">
              {/* Medallón 98 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white/85 border-2 border-slate-300/80 shadow-md flex flex-col items-center justify-center p-2 relative group hover:scale-105 transition-transform">
                  <div className="w-4 h-4 text-slate-700 mb-0.5">
                    <FileText className="w-4 h-4 mx-auto" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">98</div>
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-2 max-w-[90px] leading-tight">
                  Procedimientos vigentes
                </span>
              </div>

              {/* Medallón 61 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white/85 border-2 border-slate-300/80 shadow-md flex flex-col items-center justify-center p-2 relative group hover:scale-105 transition-transform">
                  <div className="w-4 h-4 text-slate-700 mb-0.5">
                    <TrendingUp className="w-4 h-4 mx-auto" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">61</div>
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-2 max-w-[90px] leading-tight">
                  Indicadores monitoreados
                </span>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: FORMULARIO VIDRIO Y PÍLDORAS DE ACCESO */}
          <div className="lg:col-span-7 flex flex-col justify-between pl-0 lg:pl-8 pt-6 lg:pt-0">
            <div>
              {/* Encabezado Pestañas y Badge de 16 Oficinas */}
              <div className="flex items-center justify-between border-b border-white/60 pb-2.5 mb-5">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setStatusMessage(null); }}
                    className={`pb-1 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'border-b-2 border-red-900 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setStatusMessage(null); }}
                    className={`pb-1 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'border-b-2 border-red-900 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Registrar Nuevo Funcionario
                  </button>
                </div>

                {/* Insignia 16 Oficinas Conectadas (Gemela a la imagen) */}
                <div className="px-3 py-1 rounded-full bg-white/80 border border-white text-slate-800 text-xs font-bold flex items-center gap-2 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>16 Oficinas Conectadas</span>
                </div>
              </div>

              {/* Mensajes de Alerta */}
              {statusMessage && (
                <div className={`mb-4 p-3 rounded-2xl text-xs flex items-center gap-2 shadow-xs ${
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

              {/* FORMULARIO LOGIN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Campo Correo Institucional */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Correo Institucional
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={currentUser?.email || 'usuario@upt.pe'}
                        readOnly
                        placeholder="@upt.pe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-slate-900 text-xs font-medium shadow-inner focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Campo Contraseña */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-slate-900 text-xs font-mono shadow-inner focus:outline-none focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Enlace Olvidó Contraseña */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => alert('Para soporte con sus credenciales, comuníquese con TEIN o GECA.')}
                      className="text-[11px] text-slate-700 hover:text-red-900 hover:underline cursor-pointer font-medium"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  </div>

                  {/* Chips de Selección Rápida de Oficinas (Gemelas a la imagen 1) */}
                  <div className="pt-1">
                    <div className="text-[11px] font-bold text-slate-800 mb-2">
                      Acceso rápido de oficinas:
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 shadow-xs ${
                              isSelected
                                ? 'bg-red-900 text-white border-red-900 scale-105 shadow-md'
                                : 'bg-white/75 hover:bg-white text-slate-800 border-white/80'
                            }`}
                          >
                            <span>{chip.label}</span>
                            <span className={`text-[10px] font-mono ${isSelected ? 'text-red-200' : 'text-slate-500'}`}>
                              {chip.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector General de Todas las Dependencias */}
                  <div className="pt-1">
                    <select
                      value={currentUser?.id}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/60 border border-white/80 text-slate-800 focus:outline-none focus:bg-white cursor-pointer"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.officeName || u.department} — {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* BOTÓN ROJO CARMESÍ REDONDEADO (IDÉNTICO AL MOCKUP) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-8 rounded-full bg-[#800020] hover:bg-[#600018] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-900/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <span>Ingresar a Mi Oficina</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              )}

              {/* FORMULARIO REGISTRO */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Nombres y Apellidos *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Mg. Carlos Albarracín"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Cargo o Puesto
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Especialista de Calidad"
                        value={regCharge}
                        onChange={(e) => setRegCharge(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Correo Institucional (@upt.pe) *
                    </label>
                    <input
                      type="text"
                      placeholder="usuario@upt.pe"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Oficina Asignada *
                    </label>
                    <select
                      value={regOfficeIndex}
                      onChange={(e) => setRegOfficeIndex(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white cursor-pointer font-medium"
                    >
                      {OFFICE_DIRECTORY.map((off, idx) => (
                        <option key={off.code} value={idx}>
                          {off.name} {off.proc.length > 0 ? `[${off.proc.join(', ')}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Rol de Acceso en el SGC
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/80 text-xs text-slate-900 focus:outline-none focus:bg-white cursor-pointer font-medium"
                    >
                      <option value="colaborador">Colaborador Administrativo</option>
                      <option value="director_escuela">Dueño de Proceso (Registro de Evidencias)</option>
                      <option value="auditor">Auditor Interno Designado</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-6 rounded-full bg-[#800020] hover:bg-[#600018] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Completar Registro Institucional</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
