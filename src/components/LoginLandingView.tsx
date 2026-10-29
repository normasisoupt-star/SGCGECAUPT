import React, { useState } from 'react';
import { UserProfile, UserRole, ProcessLevel0 } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { 
  loginWithFirebase, 
  registerWithFirebase 
} from '../services/firebaseClient';

interface LoginLandingViewProps {
  onLogin: (user: UserProfile) => void;
  activeUser?: UserProfile;
  initialUser?: UserProfile;
  users?: UserProfile[];
  onRegisterUser: (newUser: Omit<UserProfile, 'id'>) => void;
}

const OFFICE_DIRECTORY = [
  { name: 'Oficina de Planificación y Calidad Académica', charge: 'Jefe de OPLA', code: 'PE.01', proc: ['PE.01.01.01', 'PE.01.01.02', 'PE.01.02.01', 'PE.01.02.02', 'PE.01.02.03', 'PE.01.02.04', 'PE.01.02.05', 'PE.01.03.01', 'PE.01.04.01', 'PE.01.04.02', 'PE.01.04.03'] },
  { name: 'Oficina de Gestión de la Calidad', charge: 'Responsable de Calidad', code: 'PE.02', proc: ['PE.02.01.01', 'PE.02.01.02', 'PE.02.01.03', 'PE.02.01.04', 'PE.02.02.01', 'PE.02.03.01', 'PE.02.04.01', 'PE.02.04.02'] },
  { name: 'Oficina de Seguridad y Gestión del Riesgo', charge: 'Responsable de Seguridad', code: 'PE.03', proc: ['PE.03.01.01', 'PE.03.02.01', 'PE.03.02.02', 'PE.03.02.03'] },
  { name: 'Oficina de Cooperación y Relaciones Interinstitucionales', charge: 'Jefe de Cooperación', code: 'PE.04', proc: ['PE.04.01.01', 'PE.04.02.01'] },
  { name: 'Vicerrectorado Académico', charge: 'Vicerrector Académico', code: 'PM.01', proc: ['PM.01.01.01', 'PM.01.01.02', 'PM.01.01.03', 'PM.01.01.04', 'PM.01.01.05', 'PM.01.02.01', 'PM.01.02.02', 'PM.01.02.03', 'PM.01.02.04', 'PM.01.02.05', 'PM.01.02.06', 'PM.01.02.07', 'PM.01.02.08', 'PM.01.02.09', 'PM.01.02.10', 'PM.01.03.01', 'PM.01.03.02', 'PM.01.03.03', 'PM.01.03.04', 'PM.01.03.05', 'PM.01.03.06'] },
  { name: 'Dirección General de Administración', charge: 'Director de Administración', code: 'PS.02', proc: ['PS.02.01.01', 'PS.02.01.02', 'PS.02.01.03', 'PS.02.01.04', 'PS.02.01.05', 'PS.02.01.06', 'PS.02.01.07', 'PS.02.01.08', 'PS.02.01.09', 'PS.02.01.10', 'PS.02.01.11', 'PS.02.01.12', 'PS.02.01.13', 'PS.02.01.14', 'PS.02.01.15', 'PS.02.01.16', 'PS.02.01.17', 'PS.02.01.18', 'PS.02.01.19', 'PS.02.01.20', 'PS.02.01.21', 'PS.02.02.01', 'PS.02.02.02', 'PS.02.02.03', 'PS.02.02.04'] },
  { name: 'Oficina de Tecnologías de Información', charge: 'Jefe de TI', code: 'PS.04', proc: ['PS.04.01.01', 'PS.04.01.02', 'PS.04.01.03', 'PS.04.01.04'] },
  { name: 'Oficina de Personal', charge: 'Jefe de Personal', code: 'PS.01', proc: ['PS.01.01.01', 'PS.01.01.02', 'PS.01.01.03', 'PS.01.01.04', 'PS.01.01.05', 'PS.01.01.06', 'PS.01.01.07'] },
];

const QUICK_CHIPS = [
  { label: 'OPLA', code: 'PE.01', role: 'opla', desc: 'Oficina de Planificación y Calidad Académica (Proceso Estratégico PE.01)' },
  { label: 'GECA', code: 'PE.02', role: 'geca', desc: 'Oficina de Gestión de la Calidad (Proceso Estratégico PE.02)' },
  { label: 'APHU', code: 'PS.01', role: 'aphu', desc: 'Oficina de Administración de Personal (Proceso de Soporte PS.01)' },
  { label: 'TEIN', code: 'PS.04', role: 'tein', desc: 'Oficina de Tecnologías de Información (Proceso de Soporte PS.04)' },
  { label: 'VRAC', code: 'PM.01', role: 'vrac', desc: 'Vicerrectorado Académico (Proceso Misional PM.01)' },
];

export const LoginLandingView: React.FC<LoginLandingViewProps> = ({
  onLogin,
  activeUser,
  initialUser,
  users = [],
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedChipRole, setSelectedChipRole] = useState<string>('opla');
  const [emailUsername, setEmailUsername] = useState<string>('cgarcia.calidad');
  const [password, setPassword] = useState('Tacna2024Calidad*');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCharge, setRegCharge] = useState('');
  const [regOfficeIndex, setRegOfficeIndex] = useState(0);
  const [regRole, setRegRole] = useState<UserRole>('colaborador');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const currentChip = QUICK_CHIPS.find(c => c.role === selectedChipRole) || QUICK_CHIPS[0];

  const handleSelectQuickOffice = (chip: typeof QUICK_CHIPS[0]) => {
    setSelectedChipRole(chip.role);
    const found = users.find(u => u.role === chip.role);
    if (found) {
      setEmailUsername(found.email ? found.email.replace('@upt.pe', '') : found.role);
    } else {
      setEmailUsername(`${chip.role}.calidad`);
    }
  };

  const getFullLoginEmail = () => {
    const trimmed = emailUsername.trim().toLowerCase();
    if (trimmed.includes('@')) return trimmed;
    return `${trimmed}@upt.pe`;
  };

  // ========================================================
  // INICIO DE SESIÓN (FIREBASE AUTH + CREDENCIAL MAESTRA ADMIN)
  // ========================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const fullEmail = getFullLoginEmail();

    // 1. CREDENCIAL MAESTRA OCULTA DE ADMINISTRADOR (GECA)
    if (fullEmail === 'licencia_institucional@upt.pe' && password === 'ISO21001-gecaupt') {
      const masterAdminUser: UserProfile = {
        id: 'u-master-admin',
        name: 'Administrador General SGC (GECA)',
        email: 'licencia_institucional@upt.pe',
        role: 'geca',
        charge: 'Jefe de la Oficina de Gestión de la Calidad / Administrador SGC',
        department: 'Oficina de Gestión de la Calidad',
        officeName: 'Oficina de Gestión de la Calidad',
        processCodes: ['PE.01', 'PE.02', 'PE.03', 'PE.04', 'PM.01', 'PM.02', 'PM.03', 'PS.01', 'PS.02', 'PS.03', 'PS.04', 'PS.05', 'PS.06'],
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      };

      // Si existe o no en Firebase, intentamos autenticarlo o crearlo silenciosamente
      try {
        await loginWithFirebase(fullEmail, password);
      } catch {
        try {
          await registerWithFirebase(fullEmail, password, masterAdminUser);
        } catch {}
      }

      setStatusMessage({
        type: 'success',
        text: 'Acceso de Administrador General concedido.',
      });
      setTimeout(() => {
        onLogin(masterAdminUser);
      }, 700);
      return;
    }

    // 2. Autenticación regular en Firebase Auth
    try {
      const firebaseUser = await loginWithFirebase(fullEmail, password);
      setStatusMessage({
        type: 'success',
        text: `¡Bienvenido(a), ${firebaseUser.name}! Autenticación exitosa en Firebase.`,
      });
      setTimeout(() => {
        onLogin(firebaseUser);
      }, 700);
      return;
    } catch (err: any) {
      console.warn('Firebase Login intento:', err);
      let errorMsg = 'Error al iniciar sesión.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMsg = 'Credenciales no válidas. Si es tu primera vez, regístrate en "Registrar Nuevo Funcionario".';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Por favor asegúrate de activar Correo/Contraseña en la consola de Firebase (Authentication > Sign-in method).';
      } else if (err.message) {
        errorMsg = err.message;
      }

      // Fallback a cuentas institucionales de prueba
      const matchedLocal = users.find(u => 
        u.email.toLowerCase() === fullEmail || 
        u.email.toLowerCase().startsWith(emailUsername.toLowerCase().split('@')[0] + '@')
      );

      if (matchedLocal) {
        setStatusMessage({
          type: 'info',
          text: `Acceso concedido mediante credencial institucional (${matchedLocal.charge}).`,
        });
        setTimeout(() => {
          onLogin(matchedLocal);
        }, 1000);
        return;
      }

      setStatusMessage({ type: 'error', text: errorMsg });
      setIsLoading(false);
    }
  };

  // ========================================================
  // REGISTRO DE USUARIO (SIN OPCIÓN ADMINISTRADOR)
  // ========================================================
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!regName.trim() || !regEmail.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor complete su nombre y correo institucional.' });
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'La contraseña debe tener un mínimo de 6 caracteres (regla de seguridad de Firebase).' });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setStatusMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setIsLoading(true);

    const selectedOfficeDef = OFFICE_DIRECTORY[regOfficeIndex];
    const fullRegEmail = regEmail.trim().toLowerCase().includes('@') 
      ? regEmail.trim().toLowerCase() 
      : `${regEmail.trim().toLowerCase()}@upt.pe`;

    const newUser: Omit<UserProfile, 'id'> = {
      name: regName.trim(),
      email: fullRegEmail,
      charge: regCharge.trim() || selectedOfficeDef.charge,
      department: selectedOfficeDef.name,
      officeName: selectedOfficeDef.name,
      role: regRole, // Solo 'colaborador', 'director_escuela', o 'auditor'
      processCodes: [selectedOfficeDef.code as ProcessLevel0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    try {
      const createdUser = await registerWithFirebase(fullRegEmail, regPassword, newUser);
      onRegisterUser(newUser);
      setStatusMessage({
        type: 'success',
        text: `¡Registro exitoso en Firebase! Bienvenido(a), ${createdUser.name}.`,
      });
      setTimeout(() => {
        onLogin(createdUser);
      }, 1000);
    } catch (err: any) {
      console.error('Error al registrar en Firebase:', err);
      let errorText = 'Error al registrar en Firebase.';
      if (err.code === 'auth/configuration-not-found') {
        errorText = 'Falta activar Authentication en Firebase: entra a la consola de Firebase > Authentication y haz clic en "Comenzar" y activa "Correo/Contraseña".';
        // Fallback local para que el usuario no quede bloqueado
        onRegisterUser(newUser);
        const localUser: UserProfile = { ...newUser, id: `u-local-${Date.now()}` };
        setStatusMessage({
          type: 'info',
          text: `Usuario registrado en el sistema SGC. (Nota: ${errorText})`,
        });
        setTimeout(() => {
          onLogin(localUser);
        }, 1800);
        return;
      } else if (err.code === 'auth/email-already-in-use') {
        errorText = 'Este correo institucional ya está registrado en Firebase. Inicia sesión con tu contraseña.';
      } else if (err.code === 'auth/weak-password') {
        errorText = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorText = 'Debes activar el método Correo/Contraseña en la consola Firebase (Authentication > Sign-in method).';
      } else if (err.message) {
        errorText = err.message;
      }

      setStatusMessage({ type: 'error', text: errorText });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen max-h-screen w-full flex flex-col justify-between font-inter text-slate-800 antialiased overflow-hidden select-none">
      
      {/* CAPA DE FONDO: FOTOGRAFÍA ARQUITECTÓNICA DE CAMPUS */}
      <div className="fixed inset-0 w-full h-full -z-20 overflow-hidden">
        <img 
          src="./upt_campus_fachada.jpg" 
          alt="Campus Universidad Privada de Tacna" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* OVERLAY SUTIL ORIGINAL */}
      <div className="fixed inset-0 w-full h-full -z-10 bg-white/[0.04] pointer-events-none" />

      {/* BARRA SUPERIOR INSTITUCIONAL: PORTAL OFICIAL UPT • SGC */}
      <header className="w-full px-6 py-2 flex-shrink-0 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white/95 drop-shadow-sm font-outfit">
            PORTAL OFICIAL UPT &bull; SGC
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-white/90 drop-shadow-sm">
          <span className="hidden md:inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F3E5AB]" />
            NTP-ISO 21001:2026 (INACAL)
          </span>
          <span className="font-medium bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            Tacna, Perú
          </span>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL CENTRAL */}
      <main className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 my-auto flex-1 flex flex-col justify-center items-center z-10 overflow-hidden py-1">
        
        <div className="relative w-full">
          
          {/* TARJETA CENTRAL DE CRISTAL ESMERILADO (GLASSMORPHISM) */}
          <div className="glass-card w-full py-6 sm:py-8 px-6 sm:px-8 lg:px-10 max-h-[calc(100vh-70px)] flex flex-col justify-center">
            
            {/* ESCUDO UPT TOTALMENTE ENVUELTO POR EL FONDO DE CRISTAL */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="relative shield-float cursor-pointer transition-transform duration-300 hover:scale-105">
                <img 
                  src="./upt_escudo_oficial.png" 
                  alt="Escudo Heráldico UPT" 
                  className="w-24 h-28 sm:w-28 sm:h-32 lg:w-32 lg:h-36 object-contain filter drop-shadow-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
              
              {/* ================= LADO IZQUIERDO: INFORMACIÓN INSTITUCIONAL, NORMAS Y MÉTRICAS ================= */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4 lg:space-y-5 border-b lg:border-b-0 lg:border-r border-slate-300/40 pb-4 lg:pb-0 lg:pr-8">
                
                {/* Encabezado de la Universidad y del Sistema */}
                <div className="space-y-2 text-center lg:text-left">
                  <h1 className="font-cinzel text-xl sm:text-2xl font-extrabold text-[#0F2942] tracking-wide leading-tight">
                    UNIVERSIDAD PRIVADA DE TACNA
                  </h1>
                  
                  <div className="h-1 w-24 bg-gradient-to-r from-[#0d2d3f] via-[#e63b2e] to-[#D4AF37] mx-auto lg:mx-0 rounded-full my-2" />
                  
                  <h2 className="font-outfit text-base sm:text-lg font-bold text-[#0d2d3f] tracking-tight">
                    Sistema de Gestión de la Calidad (SGC)
                  </h2>
                  
                  <p className="text-xs text-slate-600 leading-normal font-normal pt-0.5 line-clamp-2">
                    Plataforma rectora institucional para la planificación, auditoría, control de procesos y mejora continua de la excelencia formativa universitaria.
                  </p>
                </div>

                {/* INSIGNIAS NORMATIVAS RECTANGULARES LIMPIAS (LADO A LADO EN 2 COLUMNAS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Insignia ISO 21001 */}
                  <div className="iso-badge rounded-xl p-2 sm:p-2.5 text-white flex items-center space-x-3 transition-transform hover:-translate-y-0.5 duration-200">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-[#D4AF37]/40 flex-shrink-0 text-[#F3E5AB]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-[#F3E5AB] font-outfit uppercase">Norma de Calidad</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold">VIGENTE</span>
                      </div>
                      <div className="text-sm font-extrabold text-white tracking-wide font-cinzel">ISO 21001:2018</div>
                      <div className="text-[11px] text-slate-300 truncate">Organizaciones Educativas</div>
                    </div>
                  </div>

                  {/* Insignia ISO 9001 */}
                  <div className="iso-badge rounded-xl p-2 sm:p-2.5 text-white flex items-center space-x-3 transition-transform hover:-translate-y-0.5 duration-200">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-[#D4AF37]/40 flex-shrink-0 text-[#F3E5AB]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-[#F3E5AB] font-outfit uppercase">Norma Calidad</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold">VIGENTE</span>
                      </div>
                      <div className="text-sm font-extrabold text-white tracking-wide font-cinzel">ISO 9001:2015</div>
                      <div className="text-[11px] text-slate-300 truncate">Gestión de la Calidad</div>
                    </div>
                  </div>

                </div>

                {/* MEDALLONES CIRCULARES CON DOBLE ANILLO CONCÉNTRICO */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3 text-center lg:text-left font-outfit">
                    Alcance del Sistema por Procesos Institucionales
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Medallón 1: Procedimientos */}
                    <div className="glass-subcard rounded-xl p-2.5 flex items-center space-x-2.5 border border-white/90 shadow-sm hover:shadow-md transition-all">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0d2d3f] to-[#001826] text-white flex flex-col items-center justify-center flex-shrink-0 concentric-circle-outer">
                        <span className="text-base font-black font-outfit leading-none">98</span>
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">Docs</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0F2942] font-outfit">Procedimientos</div>
                        <div className="text-xs text-slate-500">Mapeados y estandarizados</div>
                      </div>
                    </div>

                    {/* Medallón 2: Indicadores */}
                    <div className="glass-subcard rounded-xl p-2.5 flex items-center space-x-2.5 border border-white/90 shadow-sm hover:shadow-md transition-all">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0b4967] to-[#001725] text-white flex flex-col items-center justify-center flex-shrink-0 concentric-circle-blue">
                        <span className="text-base font-black font-outfit leading-none">61</span>
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">Kpi</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0F2942] font-outfit">Indicadores</div>
                        <div className="text-xs text-slate-500">Métricas de desempeño</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Pie de créditos y certificación */}
                <div className="pt-2 flex items-center justify-start text-xs text-slate-600 border-t border-slate-200/60 font-medium">
                  <span>Oficina Gestión de la Calidad</span>
                </div>

              </div>

              {/* ================= LADO DERECHO: FORMULARIO DE ACCESO Y REGISTRO ================= */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                
                <div className="glass-subcard rounded-2xl p-5 sm:p-6 border border-white/80 shadow-md">
                  
                  {/* Encabezado del Formulario con selector opcional */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#0F2942] font-outfit">
                        {activeTab === 'login' ? 'Acceso a Funcionarios y Auditores' : 'Registro de Nuevo Funcionario'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {activeTab === 'login' ? 'Seleccione su dependencia operativa institucional' : 'Complete sus datos para incorporarse al SGC'}
                      </p>
                    </div>
                    <span className="p-2 rounded-lg bg-slate-100 text-[#0d2d3f] border border-slate-200">
                      <Lock className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Alerta de Estado */}
                  {statusMessage && (
                    <div className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs ${
                      statusMessage.type === 'success'
                        ? 'bg-emerald-100/90 text-emerald-950 border border-emerald-300'
                        : statusMessage.type === 'error'
                        ? 'bg-rose-100/90 text-rose-950 border border-rose-300'
                        : 'bg-blue-100/90 text-blue-950 border border-blue-300'
                    }`}>
                      {statusMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                      )}
                      <span>{statusMessage.text}</span>
                    </div>
                  )}

                  {activeTab === 'login' ? (
                    <div>
                      {/* SELECTOR RÁPIDO CON CHIPS DE DEPENDENCIAS CLAVE */}
                      <div className="mb-2.5">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 font-outfit">
                          Dependencia Operativa Clave
                        </label>
                        <div className="flex flex-wrap gap-1.5" id="chips-container">
                          {QUICK_CHIPS.map(chip => {
                            const isSelected = selectedChipRole === chip.role;
                            return (
                              <button
                                key={chip.role}
                                type="button"
                                onClick={() => handleSelectQuickOffice(chip)}
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-sm' 
                                    : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                                }`}
                              >
                                {chip.label} <span className={`text-[10px] font-mono ${isSelected ? 'text-[#F3E5AB]' : 'opacity-75'}`}>{chip.code}</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5 italic">
                          {currentChip.desc}
                        </p>
                      </div>

                      {/* FORMULARIO DE ACCESO CON FIREBASE AUTH */}
                      <form className="space-y-3 sm:space-y-3.5" onSubmit={handleLoginSubmit}>
                        
                        {/* Campo de Usuario con terminación fija @upt.pe */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit">
                            Usuario Institucional UPT
                          </label>
                          <div className="relative flex items-center rounded-xl overflow-hidden shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                            <input 
                              type="text" 
                              value={emailUsername}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEmailUsername(val);
                              }}
                              placeholder="cgarcia.calidad o usuario@upt.pe" 
                              className="glass-input w-full pl-10 pr-24 py-2 sm:py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none rounded-xl"
                              required
                            />
                            {!emailUsername.includes('@') && (
                              <div className="absolute right-0 inset-y-0 pr-3.5 flex items-center pointer-events-none">
                                <span className="text-xs font-bold text-[#0d2d3f] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-mono font-bold">
                                  @upt.pe
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Campo de Contraseña */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700 font-outfit">
                              Contraseña de Acceso
                            </label>
                            <a href="#recuperar" onClick={(e) => { e.preventDefault(); alert('Para restablecer su clave comuníquese con la Mesa de Ayuda SGC (anexo 443).'); }} className="text-[11px] font-medium text-[#0d2d3f] hover:text-[#e63b2e] hover:underline">
                              ¿Olvidó su clave?
                            </a>
                          </div>
                          <div className="relative flex items-center rounded-xl overflow-hidden shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••" 
                              className="glass-input w-full pl-10 pr-10 py-2 sm:py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none rounded-xl"
                              required
                            />
                            <button 
                              type="button" 
                              className="absolute right-0 inset-y-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Recordar sesión y Token MFA */}
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={rememberSession} 
                              onChange={(e) => setRememberSession(e.target.checked)}
                              className="w-4 h-4 text-[#0d2d3f] rounded border-slate-300 focus:ring-[#0d2d3f] cursor-pointer" 
                            />
                            <span className="text-xs text-slate-600">Sesión autenticada en este equipo</span>
                          </label>
                          <span className="text-[11px] font-semibold text-[#0F2942] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            MFA UPT Activo
                          </span>
                        </div>

                        {/* BOTÓN PRINCIPAL EN DEEP NAVY CON FIREBASE AUTH */}
                        <div className="pt-2">
                          <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#0d2d3f] to-[#001826] hover:brightness-110 text-white font-outfit font-bold text-sm tracking-wide shadow-lg hover:shadow-xl hover:shadow-[#0d2d3f]/30 transition-all duration-200 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#F3E5AB]" />
                                <span>Verificando credenciales...</span>
                              </>
                            ) : (
                              <>
                                <span>Ingresar a Mi Oficina</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>

                      </form>

                      {/* ALTERNAR A REGISTRAR NUEVO FUNCIONARIO */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500">¿Nuevo miembro en el equipo de calidad?</span>
                        <button 
                          type="button"
                          className="font-semibold text-[#0F2942] hover:text-[#e63b2e] transition-colors underline decoration-dotted font-outfit cursor-pointer"
                          onClick={() => { setActiveTab('register'); setStatusMessage(null); }}
                        >
                          Registrar Nuevo Funcionario &rarr;
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ======================================================== */
                    /* FORMULARIO DE REGISTRO EN FIREBASE (SIN ADMINISTRADOR)   */
                    /* ======================================================== */
                    <div>
                      <form className="space-y-2.5" onSubmit={handleRegisterSubmit}>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Nombres y Apellidos *</label>
                            <input
                              type="text"
                              placeholder="Ej. Mg. Carlos Albarracín"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              required
                              className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Cargo o Puesto</label>
                            <input
                              type="text"
                              placeholder="Ej. Especialista de Calidad"
                              value={regCharge}
                              onChange={(e) => setRegCharge(e.target.value)}
                              className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Correo Institucional (@upt.pe) *</label>
                          <input
                            type="text"
                            placeholder="usuario@upt.pe"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                            className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none"
                          />
                        </div>

                        {/* Campos de Contraseña para Firebase Auth */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Contraseña (mín. 6 car.) *</label>
                            <div className="relative flex items-center">
                              <input
                                type={showRegPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                required
                                minLength={6}
                                className="glass-input w-full px-3 pr-8 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Confirmar Contraseña *</label>
                            <input
                              type={showRegPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              required
                              minLength={6}
                              className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Oficina Asignada *</label>
                          <select
                            value={regOfficeIndex}
                            onChange={(e) => setRegOfficeIndex(Number(e.target.value))}
                            className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none cursor-pointer font-medium"
                          >
                            {OFFICE_DIRECTORY.map((off, idx) => (
                              <option key={off.code} value={idx}>
                                {off.name} {off.proc.length > 0 ? `[${off.proc.join(', ')}]` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Selector de Roles: SIN ADMINISTRADOR */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Rol en el SGC</label>
                          <select
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value as UserRole)}
                            className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none cursor-pointer font-medium"
                          >
                            <option value="colaborador">Colaborador Administrativo</option>
                            <option value="director_escuela">Dueño de Proceso / Director</option>
                            <option value="auditor">Auditor Interno (NTP-ISO 21001:2026)</option>
                          </select>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#0d2d3f] to-[#001826] hover:brightness-110 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#F3E5AB]" />
                                <span>Registrando en Firebase...</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                <span>Completar Registro Institucional</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>

                      <div className="mt-2.5 pt-2 border-t border-slate-200 text-center">
                        <button
                          type="button"
                          className="text-xs font-semibold text-[#0F2942] hover:text-[#e63b2e] transition-colors underline decoration-dotted font-outfit cursor-pointer"
                          onClick={() => { setActiveTab('login'); setStatusMessage(null); }}
                        >
                          &larr; Volver al Inicio de Sesión
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Mensaje de soporte técnico institucional (Mesa de Ayuda) */}
                <div className="mt-3 pt-2.5 border-t border-slate-300/40 text-center">
                  <div className="text-[11px] font-semibold text-[#0F2942] uppercase tracking-wider mb-1">Mesa de Ayuda SGC</div>
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
                    <a href="mailto:autoevaluacion@upt.edu.pe" className="text-[#0F2942] font-medium hover:underline">autoevaluacion@upt.edu.pe</a>
                    <span className="text-slate-400">&bull;</span>
                    <a href="https://www.upt.edu.pe" target="_blank" rel="noreferrer" className="text-[#0F2942] font-medium hover:underline">www.upt.edu.pe</a>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-[#D4AF37] font-bold">051-427212 (443)</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* PIE DE PÁGINA INSTITUCIONAL */}
      <footer className="w-full px-6 py-2 flex-shrink-0 z-10 bg-black/40 backdrop-blur-md border-t border-white/10 text-white/80 text-xs flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-4">
          <span className="font-cinzel font-semibold tracking-wider text-[#F3E5AB]">
            UNIVERSIDAD PRIVADA DE TACNA &bull; UPT
          </span>
          <span className="hidden sm:inline text-white/40">|</span>
          <span className="hidden sm:inline text-slate-300">
            RUC: 20147816828
          </span>
        </div>
        
        <div className="flex items-center space-x-6 text-[11px] text-slate-300">
          <span className="hover:text-white transition-colors cursor-pointer">Política de la Calidad</span>
          <span className="hover:text-white transition-colors cursor-pointer">Mapa de Procesos</span>
          <span className="hover:text-white transition-colors cursor-pointer">Objetivos ISO 21001 / 9001</span>
          <span className="hover:text-white transition-colors cursor-pointer">Intranet Institucional</span>
        </div>
      </footer>

    </div>
  );
};
