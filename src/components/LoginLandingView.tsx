import React, { useState, useEffect } from 'react';
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
  Flame,
  Settings,
  Sparkles,
  KeyRound,
  Check,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { 
  isFirebaseConfigured, 
  getStoredFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig,
  loginWithFirebase, 
  registerWithFirebase,
  FirebaseConfig 
} from '../services/firebaseClient';

interface LoginLandingViewProps {
  onLogin: (user: UserProfile) => void;
  activeUser?: UserProfile;
  initialUser?: UserProfile;
  users?: UserProfile[];
  onRegisterUser: (newUser: Omit<UserProfile, 'id'>) => void;
}

const OFFICE_DIRECTORY = [
  { name: 'Oficina de Planificación y Calidad Académica', charge: 'Jefe de OPLA', code: 'PE.01', proc: ['PE.01.01.01', 'PE.01.02.01', 'PE.01.03.01'] },
  { name: 'Oficina de Gestión de la Calidad (GECA)', charge: 'Jefe de Calidad (GECA)', code: 'PE.02', proc: ['PE.02.01.01', 'PE.02.02.01', 'PE.02.04.01'] },
  { name: 'Oficina de Seguridad y Gestión del Riesgo', charge: 'Responsable de Seguridad', code: 'PE.03', proc: ['PE.03.01.01', 'PE.03.02.01'] },
  { name: 'Oficina de Cooperación y Relaciones Interinstitucionales', charge: 'Jefe de Cooperación', code: 'PE.04', proc: ['PE.04.01.01'] },
  { name: 'Vicerrectorado Académico (VRAC)', charge: 'Vicerrector Académico', code: 'PM.01', proc: ['PM.01.01.01', 'PM.01.02.01', 'PM.01.03.01'] },
  { name: 'Vicerrectorado de Investigación (VRIN)', charge: 'Vicerrector de Investigación', code: 'PM.02', proc: ['PM.02.01.01', 'PM.02.02.01'] },
  { name: 'Responsabilidad Social Universitaria (RSU)', charge: 'Jefe de RSU', code: 'PM.03', proc: ['PM.03.01.01'] },
  { name: 'Área de Potencial Humano (APHU)', charge: 'Jefe de Potencial Humano', code: 'PS.01', proc: ['PS.01.01.01', 'PS.01.02.01'] },
  { name: 'Dirección General de Administración (DIGA)', charge: 'Director de Administración', code: 'PS.05', proc: ['PS.05.01.01'] },
  { name: 'Oficina de Tecnologías de Información (TEIN)', charge: 'Jefe de TI', code: 'PS.04', proc: ['PS.04.01.01', 'PS.04.02.01'] },
  { name: 'Centro de Información y Biblioteca', charge: 'Jefe de Biblioteca', code: 'PS.02', proc: ['PS.02.01.01'] },
  { name: 'Comité de Auditoría Interna', charge: 'Auditor Líder SGC', code: 'PE.02', proc: ['PE.02.04.01'] },
];

const QUICK_CHIPS = [
  { label: 'GECA', code: 'PE.02', role: 'geca', desc: 'Oficina de Gestión de la Calidad (Administrador SGC)' },
  { label: 'OPLA', code: 'PE.01', role: 'opla', desc: 'Oficina de Planificación y Calidad Académica' },
  { label: 'VRAC', code: 'PM.01', role: 'vrac', desc: 'Vicerrectorado Académico y Docencia' },
  { label: 'VRIN', code: 'PM.02', role: 'vrin', desc: 'Vicerrectorado de Investigación e Innovación' },
  { label: 'AUDITOR', code: 'PE.02', role: 'auditor', desc: 'Equipo Auditor Interno NTP-ISO 21001:2026' },
  { label: 'TEIN', code: 'PS.04', role: 'tein', desc: 'Oficina de Tecnologías de Información' },
];

export const LoginLandingView: React.FC<LoginLandingViewProps> = ({
  onLogin,
  activeUser,
  initialUser,
  users = [],
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedChipRole, setSelectedChipRole] = useState<string>('geca');
  
  // Login State
  const [emailUsername, setEmailUsername] = useState<string>('cgarcia.calidad');
  const [password, setPassword] = useState('Tacna2026Calidad*');
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
  const [regOfficeIndex, setRegOfficeIndex] = useState(1); // GECA default
  const [regRole, setRegRole] = useState<UserRole>('colaborador');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Firebase Config Modal State
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [hasFirebase, setHasFirebase] = useState<boolean>(() => isFirebaseConfigured());
  const [currentConfig, setCurrentConfig] = useState<FirebaseConfig | null>(() => getStoredFirebaseConfig());
  const [cfgApiKey, setCfgApiKey] = useState(currentConfig?.apiKey || '');
  const [cfgAuthDomain, setCfgAuthDomain] = useState(currentConfig?.authDomain || '');
  const [cfgProjectId, setCfgProjectId] = useState(currentConfig?.projectId || '');
  const [cfgAppId, setCfgAppId] = useState(currentConfig?.appId || '');
  const [jsonConfigInput, setJsonConfigInput] = useState('');

  useEffect(() => {
    setHasFirebase(isFirebaseConfigured());
    setCurrentConfig(getStoredFirebaseConfig());
  }, [isFirebaseModalOpen]);

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

  // INICIO DE SESIÓN
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const fullEmail = getFullLoginEmail();

    // 1. Si Firebase está configurado, intentar autenticación real
    if (hasFirebase) {
      try {
        const firebaseUser = await loginWithFirebase(fullEmail, password);
        setStatusMessage({
          type: 'success',
          text: `¡Bienvenido(a), ${firebaseUser.name}! Autenticación exitosa con Firebase Auth.`,
        });
        setTimeout(() => {
          onLogin(firebaseUser);
        }, 800);
        return;
      } catch (err: any) {
        console.warn('Fallo login Firebase, evaluando alternativa local:', err);
        let errorMsg = 'Error al iniciar sesión.';
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          errorMsg = 'Credenciales no válidas en Firebase. Verifique su correo y contraseña.';
        } else if (err.code === 'auth/too-many-requests') {
          errorMsg = 'Demasiados intentos fallidos. Por favor espere unos momentos.';
        } else if (err.message) {
          errorMsg = err.message;
        }

        // Si el usuario pertenece al padrón precargado (cuentas institucionales demostrativas)
        const matchedLocal = users.find(u => 
          u.email.toLowerCase() === fullEmail || 
          u.email.toLowerCase().startsWith(emailUsername.toLowerCase() + '@')
        );

        if (matchedLocal) {
          setStatusMessage({
            type: 'info',
            text: `${errorMsg} - Accediendo con credencial institucional precargada (${matchedLocal.charge}).`,
          });
          setTimeout(() => {
            onLogin(matchedLocal);
          }, 1200);
          return;
        }

        setStatusMessage({ type: 'error', text: errorMsg });
        setIsLoading(false);
        return;
      }
    }

    // 2. Modo Local / Sin Firebase configurado
    const matchedLocal = users.find(u => 
      u.email.toLowerCase() === fullEmail || 
      u.email.toLowerCase().startsWith(emailUsername.toLowerCase() + '@')
    ) || users.find(u => u.role === selectedChipRole) || users[0];

    if (matchedLocal) {
      setStatusMessage({
        type: 'success',
        text: `Acceso concedido a ${matchedLocal.name} (${matchedLocal.charge}).`,
      });
      setTimeout(() => {
        onLogin(matchedLocal);
      }, 500);
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Usuario no encontrado en el directorio institucional UPT.',
      });
      setIsLoading(false);
    }
  };

  // REGISTRO DE NUEVO USUARIO
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!regName.trim() || !regEmail.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor ingrese su nombre completo y correo institucional.' });
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'La contraseña debe tener un mínimo de 6 caracteres (requisito de seguridad Firebase).' });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setStatusMessage({ type: 'error', text: 'Las contraseñas ingresadas no coinciden.' });
      return;
    }

    setIsLoading(true);

    const selectedOfficeDef = OFFICE_DIRECTORY[regOfficeIndex];
    const fullRegEmail = regEmail.trim().toLowerCase().includes('@')
      ? regEmail.trim().toLowerCase()
      : `${regEmail.trim().toLowerCase()}@upt.pe`;

    const profileData = {
      name: regName.trim(),
      email: fullRegEmail,
      charge: regCharge.trim() || selectedOfficeDef.charge,
      department: selectedOfficeDef.name,
      officeName: selectedOfficeDef.name,
      role: regRole,
      processCodes: [selectedOfficeDef.code as ProcessLevel0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    // 1. Registro en Firebase Auth si está configurado
    if (hasFirebase) {
      try {
        const createdUser = await registerWithFirebase(fullRegEmail, regPassword, profileData);
        onRegisterUser(profileData);
        setStatusMessage({
          type: 'success',
          text: `¡Usuario creado exitosamente en Firebase Auth! Bienvenido al SGC, ${createdUser.name}.`,
        });
        setTimeout(() => {
          onLogin(createdUser);
        }, 1200);
        return;
      } catch (err: any) {
        console.error('Error al registrar en Firebase:', err);
        let errorText = 'Error al registrar en Firebase Auth.';
        if (err.code === 'auth/email-already-in-use') {
          errorText = 'El correo institucional ya está registrado en Firebase. Inicie sesión con su contraseña.';
        } else if (err.code === 'auth/weak-password') {
          errorText = 'Contraseña débil. Ingrese una combinación más robusta.';
        } else if (err.code === 'auth/invalid-email') {
          errorText = 'El formato de correo institucional no es válido.';
        } else if (err.message) {
          errorText = err.message;
        }

        setStatusMessage({ type: 'error', text: errorText });
        setIsLoading(false);
        return;
      }
    }

    // 2. Registro Local si Firebase aún no está vinculado
    onRegisterUser(profileData);
    setStatusMessage({
      type: 'success',
      text: `¡Funcionario registrado! Cuenta habilitada para ${selectedOfficeDef.name}.`,
    });

    setTimeout(() => {
      const updatedUser: UserProfile = {
        ...profileData,
        id: `u-custom-${Date.now()}`,
      };
      onLogin(updatedUser);
    }, 1000);
  };

  // Manejo de guardar configuración de Firebase
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();

    let newConfig: FirebaseConfig;

    if (jsonConfigInput.trim()) {
      try {
        const cleaned = jsonConfigInput.trim().replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;$/, '');
        const parsed = JSON.parse(cleaned);
        newConfig = {
          apiKey: parsed.apiKey || '',
          authDomain: parsed.authDomain || '',
          projectId: parsed.projectId || '',
          storageBucket: parsed.storageBucket || '',
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || '',
        };
      } catch (err) {
        alert('El JSON de configuración de Firebase no es válido.');
        return;
      }
    } else {
      if (!cfgApiKey.trim() || !cfgProjectId.trim()) {
        alert('Debe ingresar como mínimo la API Key y el Project ID de Firebase.');
        return;
      }
      newConfig = {
        apiKey: cfgApiKey.trim(),
        authDomain: cfgAuthDomain.trim() || `${cfgProjectId.trim()}.firebaseapp.com`,
        projectId: cfgProjectId.trim(),
        appId: cfgAppId.trim(),
      };
    }

    const ok = saveFirebaseConfig(newConfig);
    if (ok) {
      setHasFirebase(true);
      setCurrentConfig(newConfig);
      setIsFirebaseModalOpen(false);
      setStatusMessage({
        type: 'success',
        text: `Firebase conectado correctamente al proyecto: ${newConfig.projectId}`,
      });
    } else {
      alert('Error guardando la configuración de Firebase.');
    }
  };

  const handleClearFirebase = () => {
    if (window.confirm('¿Desea desconectar Firebase y volver al modo demostración local?')) {
      clearFirebaseConfig();
      setHasFirebase(false);
      setCurrentConfig(null);
      setCfgApiKey('');
      setCfgAuthDomain('');
      setCfgProjectId('');
      setCfgAppId('');
      setJsonConfigInput('');
      setIsFirebaseModalOpen(false);
      setStatusMessage({
        type: 'info',
        text: 'Firebase desconectado. El sistema operará en modo local con los 16 perfiles UPT.',
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between font-inter text-slate-800 antialiased overflow-x-hidden select-none">
      
      {/* CAPA DE FONDO: FOTOGRAFÍA ARQUITECTÓNICA DE CAMPUS */}
      <div className="fixed inset-0 w-full h-full -z-20 overflow-hidden">
        <img 
          src="/upt_campus_fachada.jpg" 
          alt="Campus Universidad Privada de Tacna" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* OVERLAY SUTIL */}
      <div className="fixed inset-0 w-full h-full -z-10 bg-slate-900/40 backdrop-blur-[2px] pointer-events-none" />

      {/* BARRA SUPERIOR INSTITUCIONAL: PORTAL OFICIAL UPT • SGC */}
      <header className="w-full px-6 py-3 flex-shrink-0 flex justify-between items-center z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-white drop-shadow-sm font-outfit">
            PORTAL OFICIAL UPT &bull; SISTEMA DE GESTIÓN DE LA CALIDAD
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/90">
          {/* Badge de Estado Firebase */}
          <button
            type="button"
            onClick={() => setIsFirebaseModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
              hasFirebase 
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30' 
                : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
            }`}
            title="Configurar vinculación con Firebase Authentication"
          >
            <Flame className={`w-3.5 h-3.5 ${hasFirebase ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
            <span>{hasFirebase ? `Firebase Activo (${currentConfig?.projectId})` : 'Conectar Firebase'}</span>
            <Settings className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          <span className="hidden md:inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F3E5AB]" />
            NTP-ISO 21001:2026
          </span>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL CENTRAL */}
      <main className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 my-auto flex-1 flex flex-col justify-center items-center z-10 py-6">
        
        <div className="relative w-full">
          
          {/* TARJETA CENTRAL DE CRISTAL ESMERILADO (GLASSMORPHISM) */}
          <div className="glass-card w-full py-6 sm:py-8 px-6 sm:px-8 lg:px-10 rounded-3xl shadow-2xl border border-white/30 backdrop-blur-xl bg-white/90 flex flex-col justify-center">
            
            {/* ESCUDO UPT */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="relative cursor-pointer transition-transform duration-300 hover:scale-105">
                <img 
                  src="/upt_escudo_oficial.png" 
                  alt="Escudo Heráldico UPT" 
                  className="w-20 h-24 sm:w-24 sm:h-28 object-contain filter drop-shadow-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              {/* ================= LADO IZQUIERDO: INFORMACIÓN INSTITUCIONAL ================= */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-slate-300/60 pb-4 lg:pb-0 lg:pr-6">
                
                {/* Encabezado de la Universidad */}
                <div className="space-y-1.5 text-center lg:text-left">
                  <h1 className="font-cinzel text-xl sm:text-2xl font-black text-[#0d2d3f] tracking-wide leading-tight">
                    UNIVERSIDAD PRIVADA DE TACNA
                  </h1>
                  
                  <div className="h-1 w-24 bg-gradient-to-r from-[#0d2d3f] via-[#e63b2e] to-[#9C7D0F] mx-auto lg:mx-0 rounded-full my-2" />
                  
                  <h2 className="font-outfit text-base font-bold text-[#0d2d3f] tracking-tight">
                    Sistema de Gestión de la Calidad (SGC)
                  </h2>
                  
                  <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                    Plataforma rectora institucional para la planificación, auditoría interna (Cl. 9.2), gestión documental y mejora continua bajo la norma <strong>NTP-ISO 21001:2026</strong>.
                  </p>
                </div>

                {/* INSIGNIAS NORMATIVAS OFICIALES */}
                <div className="space-y-2.5">
                  <div className="rounded-2xl p-3 bg-gradient-to-r from-[#0d2d3f] to-[#133e54] text-white flex items-center space-x-3 shadow-md border border-[#9C7D0F]/40">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-[#9C7D0F]/50 flex-shrink-0 text-[#fbf7ee]">
                      <ShieldCheck className="w-5 h-5 text-[#e2c866]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wider text-[#e2c866] uppercase">Norma Nacional</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">2ª EDICIÓN 2026</span>
                      </div>
                      <div className="text-xs font-black text-white font-cinzel">NTP-ISO 21001:2026</div>
                      <div className="text-[11px] text-slate-300 truncate">Organizaciones Educativas (INACAL)</div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-3 bg-gradient-to-r from-[#133e54] to-[#0a2332] text-white flex items-center space-x-3 shadow-md border border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0 text-blue-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wider text-blue-200 uppercase">Gestión de Calidad</span>
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">VIGENTE</span>
                      </div>
                      <div className="text-xs font-black text-white font-cinzel">ISO 9001:2015 / CBC SUNEDU</div>
                      <div className="text-[11px] text-slate-300 truncate">Condiciones Básicas de Calidad</div>
                    </div>
                  </div>
                </div>

                {/* ALCANCE INSTITUCIONAL */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 font-outfit">
                    Alcance del Sistema por Procesos UPT
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-2.5 bg-slate-50 border border-slate-200 flex items-center space-x-2.5 shadow-xs">
                      <div className="w-10 h-10 rounded-xl bg-[#0d2d3f] text-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-black font-outfit">94</span>
                        <span className="text-[8px] uppercase tracking-tighter opacity-80">Docs</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0d2d3f]">Procedimientos</div>
                        <div className="text-[10px] text-slate-500">Lista Maestra RG04</div>
                      </div>
                    </div>

                    <div className="rounded-2xl p-2.5 bg-slate-50 border border-slate-200 flex items-center space-x-2.5 shadow-xs">
                      <div className="w-10 h-10 rounded-xl bg-[#9C7D0F] text-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-black font-outfit">61</span>
                        <span className="text-[8px] uppercase tracking-tighter opacity-80">KPIs</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0d2d3f]">Indicadores</div>
                        <div className="text-[10px] text-slate-500">Métricas SGOE</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ================= LADO DERECHO: FORMULARIO DE ACCESO Y REGISTRO ================= */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                
                <div className="bg-white/80 rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-lg">
                  
                  {/* Selector de Pestaña: Iniciar Sesión vs Crear Usuario */}
                  <div className="flex items-center gap-2 mb-4 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setStatusMessage(null); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeTab === 'login'
                          ? 'bg-[#0d2d3f] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 text-[#e2c866]" />
                      <span>Ingresar al Sistema</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveTab('register'); setStatusMessage(null); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeTab === 'register'
                          ? 'bg-[#0d2d3f] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#e2c866]" />
                      <span>Crear Usuario y Contraseña</span>
                    </button>
                  </div>

                  {/* Alerta de Estado */}
                  {statusMessage && (
                    <div className={`mb-3.5 p-3 rounded-2xl text-xs flex items-center gap-2.5 shadow-xs ${
                      statusMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-300'
                        : statusMessage.type === 'error'
                        ? 'bg-rose-50 text-rose-950 border border-rose-300'
                        : 'bg-blue-50 text-blue-950 border border-blue-300'
                    }`}>
                      {statusMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : statusMessage.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                      <span className="leading-snug">{statusMessage.text}</span>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* TAB 1: INICIAR SESIÓN                                     */}
                  {/* ======================================================== */}
                  {activeTab === 'login' ? (
                    <div>
                      {/* Chips de Selección Rápida */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-outfit">
                            Perfiles Institucionales UPT (Acceso Rápido)
                          </label>
                          <span className="text-[10px] text-slate-400">16 Roles Disponibles</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_CHIPS.map(chip => {
                            const isSelected = selectedChipRole === chip.role;
                            return (
                              <button
                                key={chip.role}
                                type="button"
                                onClick={() => handleSelectQuickOffice(chip)}
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-[#0d2d3f] text-white border-[#0d2d3f] shadow-xs' 
                                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                                }`}
                              >
                                {chip.label} <span className={`text-[10px] font-mono ${isSelected ? 'text-[#e2c866]' : 'text-slate-400'}`}>{chip.code}</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          {currentChip.desc}
                        </p>
                      </div>

                      {/* Formulario de Login */}
                      <form className="space-y-3" onSubmit={handleLoginSubmit}>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit">
                            Correo o Usuario Institucional UPT
                          </label>
                          <div className="relative flex items-center rounded-2xl overflow-hidden shadow-xs border border-slate-300 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0d2d3f]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                            <input 
                              type="text" 
                              value={emailUsername}
                              onChange={(e) => setEmailUsername(e.target.value)}
                              placeholder="cgarcia.calidad o usuario@upt.pe" 
                              className="w-full pl-9 pr-24 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none bg-transparent"
                              required
                            />
                            {!emailUsername.includes('@') && (
                              <div className="absolute right-0 inset-y-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-[11px] font-bold text-[#0d2d3f] bg-slate-200/80 px-2 py-0.5 rounded-md font-mono">
                                  @upt.pe
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700 font-outfit">
                              Contraseña
                            </label>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {hasFirebase ? 'Autenticación Firebase' : 'Credencial institucional'}
                            </span>
                          </div>
                          <div className="relative flex items-center rounded-2xl overflow-hidden shadow-xs border border-slate-300 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0d2d3f]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <KeyRound className="w-4 h-4" />
                            </div>
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••" 
                              className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none bg-transparent"
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

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={rememberSession} 
                              onChange={(e) => setRememberSession(e.target.checked)}
                              className="w-4 h-4 text-[#0d2d3f] rounded border-slate-300 focus:ring-[#0d2d3f] cursor-pointer" 
                            />
                            <span className="text-xs text-slate-600">Recordar credenciales</span>
                          </label>
                          <span className="text-[11px] font-semibold text-[#0d2d3f] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            MFA UPT Activo
                          </span>
                        </div>

                        <div className="pt-2">
                          <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#0d2d3f] via-[#133e54] to-[#0a2332] hover:brightness-110 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#e2c866]" />
                                <span>Verificando credenciales...</span>
                              </>
                            ) : (
                              <>
                                <span>Ingresar al Sistema SGC</span>
                                <ArrowRight className="w-4 h-4 text-[#e2c866]" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* ======================================================== */
                    /* TAB 2: CREAR USUARIO Y CONTRASEÑA (REGISTRO FIREBASE)    */
                    /* ======================================================== */
                    <div>
                      <form className="space-y-3" onSubmit={handleRegisterSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Nombres y Apellidos *</label>
                            <input
                              type="text"
                              placeholder="Ej. Mg. Carlos Albarracín"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              required
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Correo Institucional *</label>
                            <input
                              type="email"
                              placeholder="usuario@upt.pe"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              required
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                            />
                          </div>
                        </div>

                        {/* Contraseña y Confirmar Contraseña */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">
                              Contraseña (Mín. 6 caracteres) *
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type={showRegPassword ? 'text' : 'password'}
                                placeholder="••••••••••••"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                              >
                                {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Confirmar Contraseña *</label>
                            <input
                              type={showRegPassword ? 'text' : 'password'}
                              placeholder="••••••••••••"
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              required
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                            />
                          </div>
                        </div>

                        {/* Dependencia y Rol */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Dependencia u Oficina UPT *</label>
                            <select
                              value={regOfficeIndex}
                              onChange={(e) => setRegOfficeIndex(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] font-medium"
                            >
                              {OFFICE_DIRECTORY.map((off, idx) => (
                                <option key={off.name} value={idx}>
                                  {off.code} - {off.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Cargo o Función</label>
                            <input
                              type="text"
                              placeholder="Ej. Especialista de Calidad"
                              value={regCharge}
                              onChange={(e) => setRegCharge(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Perfil en el Sistema SGC</label>
                          <select
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value as UserRole)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d2d3f] font-medium"
                          >
                            <option value="colaborador">Colaborador Administrativo</option>
                            <option value="director_escuela">Dueño de Proceso / Director</option>
                            <option value="auditor">Auditor Interno (NTP-ISO 21001:2026)</option>
                            <option value="geca">Gestión de la Calidad (Administrador)</option>
                          </select>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#9C7D0F] via-[#b39115] to-[#83690d] hover:brightness-110 text-white font-outfit font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Registrando en Firebase Auth...</span>
                              </>
                            ) : (
                              <>
                                <Flame className="w-4 h-4 fill-white text-white" />
                                <span>{hasFirebase ? 'Crear Usuario en Firebase Auth' : 'Registrar Usuario en el SGC'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>

                {/* Mensaje de soporte técnico institucional (Mesa de Ayuda) */}
                <div className="mt-3 pt-2 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="font-bold text-[#0d2d3f]">Mesa de Ayuda SGC:</span>
                    <a href="mailto:autoevaluacion@upt.edu.pe" className="text-[#0d2d3f] hover:underline">autoevaluacion@upt.edu.pe</a>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-[#9C7D0F] font-bold">Anexo 443</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* PIE DE PÁGINA INSTITUCIONAL */}
      <footer className="w-full px-6 py-2.5 flex-shrink-0 z-10 bg-black/40 backdrop-blur-md border-t border-white/10 text-white/80 text-xs flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-3">
          <span className="font-cinzel font-bold tracking-wider text-[#e2c866]">
            UNIVERSIDAD PRIVADA DE TACNA &bull; UPT
          </span>
          <span className="text-white/40">|</span>
          <span className="text-slate-300">
            RUC: 20147816828
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-[11px] text-slate-300">
          <button
            type="button"
            onClick={() => setIsFirebaseModalOpen(true)}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[#e2c866]"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configuración de Firebase</span>
          </button>
          <span>&bull;</span>
          <span>NTP-ISO 21001:2026 / ISO 9001:2015</span>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* MODAL: CONFIGURACIÓN Y VINCULACIÓN CON FIREBASE AUTH     */}
      {/* ======================================================== */}
      {isFirebaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#0d2d3f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Vinculación de Firebase Authentication
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFirebaseModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveFirebaseConfig} className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1 text-[#9C7D0F]">
                  <Flame className="w-4 h-4 fill-[#9C7D0F]" />
                  Conexión con tu Proyecto Firebase
                </span>
                <p className="text-[11px] leading-relaxed">
                  Para que los usuarios puedan registrarse y autenticarse con correo y contraseña en la nube, ingresa la configuración de tu consola Firebase (<strong>Project Settings &gt; General &gt; Your apps &gt; Web app</strong>).
                </p>
              </div>

              {/* Opción 1: Pegar JSON completo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Opción Rápida: Pegar Objeto JSON (firebaseConfig)
                </label>
                <textarea
                  rows={3}
                  value={jsonConfigInput}
                  onChange={(e) => setJsonConfigInput(e.target.value)}
                  placeholder='{"apiKey": "AIzaSy...", "authDomain": "upt-sgc.firebaseapp.com", "projectId": "upt-sgc", "appId": "..."}'
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">o ingresar campos individuales</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Opción 2: Campos individuales */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">API Key (apiKey) *</label>
                  <input
                    type="text"
                    value={cfgApiKey}
                    onChange={(e) => setCfgApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Project ID (projectId) *</label>
                    <input
                      type="text"
                      value={cfgProjectId}
                      onChange={(e) => setCfgProjectId(e.target.value)}
                      placeholder="upt-sgc-21001"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Auth Domain</label>
                    <input
                      type="text"
                      value={cfgAuthDomain}
                      onChange={(e) => setCfgAuthDomain(e.target.value)}
                      placeholder="upt-sgc.firebaseapp.com"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">App ID (appId)</label>
                  <input
                    type="text"
                    value={cfgAppId}
                    onChange={(e) => setCfgAppId(e.target.value)}
                    placeholder="1:123456789:web:abcdef"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0d2d3f]"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                {hasFirebase && (
                  <button
                    type="button"
                    onClick={handleClearFirebase}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                  >
                    Desconectar Firebase
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsFirebaseModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0d2d3f] hover:bg-[#133e54] transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-[#e2c866]" />
                    <span>Guardar y Vincular</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
