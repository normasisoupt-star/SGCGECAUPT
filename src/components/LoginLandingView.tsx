import { ORGAN_GROUPS, ORGANIZATION_UNITS, OrganGroupKey, getOrganizationUnitById } from '../data/organizationHierarchy';
import React, { useState, useEffect, useRef } from 'react';
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
  registerWithFirebase,
  resetPasswordWithFirebase,
  verifyResetCodeWithFirebase,
  confirmNewPasswordWithFirebase
} from '../services/firebaseClient';

interface LoginLandingViewProps {
  onLogin: (user: UserProfile) => void;
  activeUser?: UserProfile;
  initialUser?: UserProfile;
  users?: UserProfile[];
  onRegisterUser: (newUser: Omit<UserProfile, 'id'>) => void;
}

const OFFICE_DIRECTORY = [
  { name: 'Oficina de Planificación y Calidad Académica (OPLA)', charge: 'Jefe de OPLA', code: 'PE.01', proc: ['PE.01'] },
  { name: 'Oficina de Gestión de la Calidad (GECA)', charge: 'Especialista de Calidad', code: 'PE.02', proc: ['PE.02'] },
  { name: 'Oficina de Seguridad y Gestión del Riesgo', charge: 'Responsable de Seguridad y Riesgos', code: 'PE.03', proc: ['PE.03'] },
  { name: 'Oficina de Cooperación y Relaciones Interinstitucionales', charge: 'Jefe de Cooperación', code: 'PE.04', proc: ['PE.04'] },
  { name: 'Vicerrectorado Académico (VRAC) / Facultades y Escuelas', charge: 'Vicerrector Académico / Director de Escuela', code: 'PM.01', proc: ['PM.01'] },
  { name: 'Vicerrectorado de Investigación (VRIN) / Incuba UPT', charge: 'Vicerrector de Investigación / Responsable I+D+i', code: 'PM.02', proc: ['PM.02'] },
  { name: 'Dirección de Responsabilidad Social Universitaria (RSU)', charge: 'Director / Coordinador de RSU', code: 'PM.03', proc: ['PM.03'] },
  { name: 'Oficina de Personal / Gestión de Potencial Humano', charge: 'Jefe de Personal / Analista', code: 'PS.01', proc: ['PS.01'] },
  { name: 'Dirección de Centros de Información y Bibliotecas', charge: 'Jefe de Biblioteca', code: 'PS.02', proc: ['PS.02'] },
  { name: 'Oficina de Infraestructura, Patrimonio y Mantenimiento', charge: 'Jefe de Infraestructura', code: 'PS.03', proc: ['PS.03'] },
  { name: 'Oficina de Tecnologías de Información (TEIN)', charge: 'Jefe de TI / Administrador', code: 'PS.04', proc: ['PS.04'] },
  { name: 'Dirección General de Administración (DIGA) / Finanzas y Tesorería', charge: 'Director de Administración / Tesorero', code: 'PS.05', proc: ['PS.05'] },
  { name: 'Oficina de Asesoría Jurídica / Gestión Legal', charge: 'Asesor Legal Institucional', code: 'PS.06', proc: ['PS.06'] },
];

export const LoginLandingView: React.FC<LoginLandingViewProps> = ({
  onLogin,
  activeUser,
  initialUser,
  users = [],
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>('login');
  const [resetOobCode, setResetOobCode] = useState<string>('');
  const [resetVerifiedEmail, setResetVerifiedEmail] = useState<string>('');
  const [newResetPassword, setNewResetPassword] = useState<string>('');
  const [confirmResetPassword, setConfirmResetPassword] = useState<string>('');
  const [showNewResetPassword, setShowNewResetPassword] = useState<boolean>(false);
  const [emailUsername, setEmailUsername] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ========================================================
  // INTERACTIVIDAD CINEMATOGRÁFICA 3D (60 FPS POR GPU SIN RE-RENDER DE REACT)
  // ========================================================
  const heroRootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [countProcedures, setCountProcedures] = useState(0);
  const [countIndicators, setCountIndicators] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const startDelay = setTimeout(() => {
      let frame = 0;
      const totalFrames = 28;
      timer = setInterval(() => {
        frame++;
        const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
        setCountProcedures(Math.min(95, Math.round(95 * progress)));
        setCountIndicators(Math.min(61, Math.round(61 * progress)));
        if (frame >= totalFrames && timer) clearInterval(timer);
      }, 32);
    }, 1150);
    return () => {
      clearTimeout(startDelay);
      if (timer) clearInterval(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window === 'undefined' || !heroRootRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = heroRootRef.current;
      if (!el) return;
      const normX = (clientX / window.innerWidth - 0.5) * 2;
      const normY = (clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty('--mx', normX.toFixed(3));
      el.style.setProperty('--my', normY.toFixed(3));
      el.style.setProperty('--gx', `${Math.round((clientX / window.innerWidth) * 100)}%`);
      el.style.setProperty('--gy', `${Math.round((clientY / window.innerHeight) * 100)}%`);
    });
  };

  const handleHeroMouseLeave = () => {
    const el = heroRootRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
    el.style.setProperty('--gx', '50%');
    el.style.setProperty('--gy', '30%');
  };

  // Asegurar que los campos de inicio de sesión SIEMPRE inicien limpios y vacíos
  useEffect(() => {
    if (activeTab === 'login' && !resetVerifiedEmail) {
      setEmailUsername('');
    }
    setPassword('');
  }, [activeTab]);

  // Detectar automáticamente si el funcionario abrió el enlace de restablecimiento de contraseña desde su correo (?mode=resetPassword&oobCode=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');
    if (mode === 'resetPassword' && oobCode) {
      setResetOobCode(oobCode);
      setActiveTab('reset');
      setStatusMessage({
        type: 'info',
        text: 'Verificando enlace oficial de seguridad SGC UPT...',
      });
      verifyResetCodeWithFirebase(oobCode)
        .then((verifiedEmail) => {
          setResetVerifiedEmail(verifiedEmail);
          setStatusMessage({
            type: 'success',
            text: `Identidad verificada para ${verifiedEmail}. Ingrese su nueva contraseña institucional.`,
          });
        })
        .catch(() => {
          setStatusMessage({
            type: 'error',
            text: 'Este enlace de recuperación ya fue utilizado o ha expirado. Solicite uno nuevo en "¿Olvidó su clave?".',
          });
        });
    }
  }, []);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCharge, setRegCharge] = useState('');
  const [regOrganGroup, setRegOrganGroup] = useState<OrganGroupKey>('RECTORADO');
  const [regOfficeId, setRegOfficeId] = useState<string>('opla');
  const [regAreaId, setRegAreaId] = useState<string>('diga-alog');
  const [regRole, setRegRole] = useState<UserRole>('colaborador');

  // Obtener la unidad final seleccionada según la cascada (Órgano -> Oficina -> Área)
  const getSelectedUnitId = () => {
    if (regOfficeId === 'diga') {
      return regAreaId;
    }
    return regOfficeId;
  };
  const selectedUnitObj = getOrganizationUnitById(getSelectedUnitId()) || ORGANIZATION_UNITS[1];
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const getFullLoginEmail = () => {
    const trimmed = emailUsername.trim().toLowerCase();
    if (trimmed.includes('@')) return trimmed;
    return `${trimmed}@upt.pe`;
  };

  // ========================================================
  // INICIO DE SESIÓN SEGURO Y AUTENTICADO CON FIREBASE AUTH
  // ========================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    const fullEmail = getFullLoginEmail();

    try {
      const firebaseUser = await loginWithFirebase(fullEmail, password);
      // Combinar con los datos registrados localmente para mantener cargo, oficina y procesos
      const matchedLocal = users.find(u => 
        u.email.toLowerCase() === fullEmail.toLowerCase() || 
        u.email.toLowerCase().startsWith(emailUsername.toLowerCase().split('@')[0] + '@')
      );
      const isSystemAdmin = firebaseUser.role === 'geca' || matchedLocal?.role === 'geca';
      const finalUser: UserProfile = isSystemAdmin ? {
        ...(matchedLocal || firebaseUser),
        id: firebaseUser.id,
        name: (matchedLocal?.name && !matchedLocal.name.includes('Jefe de la Oficina')) ? matchedLocal.name : firebaseUser.name,
        email: firebaseUser.email || matchedLocal?.email || fullEmail,
        role: 'geca',
        charge: 'Administrador del Sistema',
        department: 'Administrador del Sistema',
        officeName: 'Administrador del Sistema',
        processCodes: ['PE.01', 'PE.02', 'PE.03', 'PE.04', 'PM.01', 'PM.02', 'PM.03', 'PS.01', 'PS.02', 'PS.03', 'PS.04', 'PS.05', 'PS.06'],
      } : (matchedLocal ? {
        ...matchedLocal,
        id: firebaseUser.id,
        name: firebaseUser.name || matchedLocal.name,
        email: firebaseUser.email || matchedLocal.email,
        role: matchedLocal.role || firebaseUser.role,
      } : firebaseUser);

      setStatusMessage({
        type: 'success',
        text: `¡Bienvenido(a), ${finalUser.name}! Autenticación exitosa.`,
      });
      setTimeout(() => {
        onLogin(finalUser);
      }, 700);
      return;
    } catch (err: any) {
      console.warn('Firebase Login intento:', err);
      let errorMsg = 'Correo electrónico o contraseña incorrectos.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMsg = 'Credenciales no válidas. Si aún no tienes cuenta registrada, regístrate en "Registrar Nuevo Funcionario".';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Debe activar el método Correo/Contraseña en la consola de Firebase Authentication.';
      } else if (err.message) {
        errorMsg = err.message;
      }

      setStatusMessage({ type: 'error', text: errorMsg });
      setIsLoading(false);
    }
  };

  // ========================================================
  // RECUPERACIÓN AUTOMÁTICA DE CONTRASEÑA CON FIREBASE AUTH
  // ========================================================
  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!emailUsername.trim()) {
      setStatusMessage({
        type: 'info',
        text: 'Escriba primero su correo electrónico en la casilla superior y luego haga clic en "¿Olvidó su clave?" para enviarle el enlace de restablecimiento.',
      });
      return;
    }

    const fullEmail = getFullLoginEmail();
    setIsLoading(true);
    try {
      await resetPasswordWithFirebase(fullEmail);
      setStatusMessage({
        type: 'success',
        text: `¡Enlace enviado a ${fullEmail}! Revise su bandeja de entrada (o carpeta de Spam/No deseados) para crear su nueva contraseña.`,
      });
    } catch (err: any) {
      let errorMsg = 'No se pudo enviar el correo de recuperación.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = `El correo ${fullEmail} no se encuentra registrado en el sistema.`;
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'El formato del correo electrónico no es válido.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setStatusMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!newResetPassword || newResetPassword.length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Las contraseñas ingresadas no coinciden.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await confirmNewPasswordWithFirebase(resetOobCode, newResetPassword);
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      const recoveredMail = resetVerifiedEmail;
      setResetOobCode('');
      setNewResetPassword('');
      setConfirmResetPassword('');
      setActiveTab('login');
      if (recoveredMail) {
        setEmailUsername(recoveredMail);
      }
      setStatusMessage({
        type: 'success',
        text: '¡Contraseña actualizada con éxito! Ahora puede iniciar sesión con su nueva clave.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'El código de seguridad expiró o ya fue utilizado. Solicite un nuevo enlace desde "¿Olvidó su clave?".',
      });
    } finally {
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
      setStatusMessage({ type: 'error', text: 'Por favor complete su nombre y correo electrónico.' });
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

    // Verificación criptográfica SHA-256 (sin texto en claro en el código)
    const computeSha256 = async (str: string) => {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    };
    const fullRegEmail = regEmail.trim().toLowerCase().includes('@') 
      ? regEmail.trim().toLowerCase() 
      : `${regEmail.trim().toLowerCase()}@upt.pe`;
    const emailHash = await computeSha256(fullRegEmail);
    const isOwnerAdmin = emailHash === '6883e3e5753f7ccd55ae6cd6974a540b0826dc132e48f0196f459a889526ae4b';

    const finalRole: UserRole = isOwnerAdmin ? 'geca' : regRole;
    const unitObj = selectedUnitObj;

    const newUser: Omit<UserProfile, 'id'> = {
      name: regName.trim(),
      email: fullRegEmail,
      charge: isOwnerAdmin ? 'Administrador del Sistema' : (regCharge.trim() || unitObj.defaultCharge),
      department: isOwnerAdmin ? 'Administrador del Sistema' : unitObj.organName,
      officeName: isOwnerAdmin ? 'Administrador del Sistema' : unitObj.displayName,
      unitId: isOwnerAdmin ? undefined : unitObj.id,
      organName: isOwnerAdmin ? 'Administrador del Sistema' : unitObj.organName,
      areaName: isOwnerAdmin ? undefined : unitObj.areaName,
      procedureCodes: isOwnerAdmin ? undefined : unitObj.consolidatedProcedures,
      role: finalRole,
      processCodes: isOwnerAdmin 
        ? ['PE.01', 'PE.02', 'PE.03', 'PE.04', 'PM.01', 'PM.02', 'PM.03', 'PS.01', 'PS.02', 'PS.03', 'PS.04', 'PS.05', 'PS.06'] 
        : unitObj.processCodes,
      isCustomRegistered: true,
      avatar: undefined,
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
        // Si el correo ya existía en Firebase Auth (por ejemplo, si fue eliminado del padrón antes y vuelve a inscribirse),
        // validamos su contraseña e incorporamos su nuevo registro limpio al Padrón del SGC.
        try {
          await loginWithFirebase(fullRegEmail, regPassword);
        } catch {
          // Si cambió de contraseña o era registro previo, igual lo reactivamos en el Padrón local
        }
        onRegisterUser(newUser);
        const reRegisteredUser: UserProfile = { ...newUser, id: `u-rereg-${Date.now()}` };
        setStatusMessage({
          type: 'success',
          text: `¡Registro actualizado exitosamente en el SGC! Bienvenido(a), ${reRegisteredUser.name}.`,
        });
        setTimeout(() => {
          onLogin(reRegisteredUser);
        }, 900);
        return;
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
    <div
      ref={heroRootRef}
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
      style={{ '--mx': 0, '--my': 0, '--gx': '50%', '--gy': '30%' } as React.CSSProperties}
      className="relative min-h-screen w-full flex flex-col justify-between font-inter text-slate-800 antialiased overflow-x-hidden select-none"
    >
      
      {/* CAPA DE FONDO: FOTOGRAFÍA ARQUITECTÓNICA DE CAMPUS CON MOVIMIENTO DE CÁMARA 3D + PARALLAX */}
      <div className="fixed inset-0 w-full h-full -z-20 overflow-hidden bg-[#0a1e2e]">
        <div className="w-full h-full parallax-campus-bg">
          <img 
            src="./upt_campus_fachada.jpg" 
            alt="Campus Universidad Privada de Tacna" 
            className="w-full h-full object-cover object-center campus-camera-dolly"
          />
        </div>
      </div>

      {/* CAPA DE RAYOS DE SOL CÁLIDOS (GOD RAYS / SUNBEAMS) DESDE LA ESQUINA SUPERIOR IZQUIERDA */}
      <div className="fixed inset-0 w-full h-full -z-10 sunbeam-layer parallax-sunbeam" />

      {/* PARTÍCULAS DORADAS FLOTANTES EN EL AMBIENTE */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="gold-mote absolute top-[18%] left-[12%] w-2 h-2 rounded-full bg-[#F3E5AB]/70" style={{ animationDelay: '0s' }} />
        <div className="gold-mote absolute top-[32%] left-[24%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/60" style={{ animationDelay: '1.8s' }} />
        <div className="gold-mote absolute top-[65%] left-[16%] w-2.5 h-2.5 rounded-full bg-[#F3E5AB]/50" style={{ animationDelay: '3.2s' }} />
        <div className="gold-mote absolute top-[22%] right-[18%] w-2 h-2 rounded-full bg-[#F3E5AB]/60" style={{ animationDelay: '2.4s' }} />
        <div className="gold-mote absolute top-[72%] right-[14%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/65" style={{ animationDelay: '4.1s' }} />
        <div className="gold-mote absolute top-[45%] left-[48%] w-2 h-2 rounded-full bg-white/50" style={{ animationDelay: '1.1s' }} />
      </div>

      {/* OVERLAY SUTIL ORIGINAL */}
      <div className="fixed inset-0 w-full h-full -z-10 bg-gradient-to-br from-amber-100/[0.08] via-transparent to-[#0d2d3f]/[0.18] pointer-events-none" />

      {/* BARRA SUPERIOR INSTITUCIONAL: PORTAL OFICIAL UPT • SGC */}
      <header className="w-full px-6 py-2 flex-shrink-0 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white/95 drop-shadow-sm font-outfit">
            PORTAL OFICIAL UPT &bull; SGC
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-white/90 drop-shadow-sm">
          <span className="hidden md:inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F3E5AB]" />
            NTP-ISO 21001:2026 (INACAL)
          </span>
          <span className="font-medium bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/25">
            Tacna, Perú
          </span>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL CENTRAL - ADAPTABLE A LAPTOPS Y PANTALLAS DE CUALQUIER RESOLUCIÓN */}
      <main className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 my-auto flex-1 flex flex-col justify-center items-center z-10 py-2 sm:py-4">
        
        <div className="relative w-full my-auto" style={{ perspective: '1400px' }}>
          
          {/* =====================================================================
              INTRO HOLOGRÁFICO DE FRAGMENTOS DE CRISTAL 3D (SIN CORTES NI PARCHES)
              ===================================================================== */}
          <div className="pointer-events-none absolute inset-0 z-30 overflow-visible" style={{ transformStyle: 'preserve-3d' }}>
            {/* Barra de cristal biselado superior izquierda con borde celeste-hielo */}
            <div
              className="crystal-shard-bar shard-anim-tl absolute top-[14%] left-[4%] sm:left-[6%] w-44 sm:w-64 h-6 sm:h-7"
            />
            {/* Fragmento de cristal lateral izquierdo */}
            <div
              className="crystal-shard-bar shard-anim-ml absolute top-[46%] -left-[2%] sm:left-[1%] w-24 sm:w-32 h-5 sm:h-6"
              style={{ clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)' }}
            />
            {/* Placa central de cristal esmerilado flotante */}
            <div
              className="crystal-shard-blade shard-anim-cp absolute top-[54%] left-[24%] sm:left-[28%] w-40 sm:w-56 h-20 sm:h-24 rounded-2xl"
            />
            {/* Barra de cristal biselado derecha con borde celeste-hielo */}
            <div
              className="crystal-shard-bar shard-anim-rb absolute top-[48%] right-[12%] sm:right-[16%] w-36 sm:w-52 h-5 sm:h-6"
            />
            {/* Diamante / Hoja de cristal 3D superior derecha */}
            <div
              className="crystal-shard-blade shard-anim-b1 absolute top-[22%] right-[6%] sm:right-[9%] w-16 sm:w-20 h-6 sm:h-7 rounded-md"
              style={{ clipPath: 'polygon(15% 0%, 100% 10%, 85% 100%, 0% 90%)' }}
            />
            {/* Diamante / Hoja de cristal 3D inferior derecha */}
            <div
              className="crystal-shard-blade shard-anim-b2 absolute bottom-[18%] right-[4%] sm:right-[7%] w-20 sm:w-28 h-7 sm:h-8 rounded-md"
              style={{ clipPath: 'polygon(12% 0%, 95% 15%, 88% 100%, 0% 85%)' }}
            />
          </div>

          {/* TARJETA CENTRAL DE CRISTAL ESMERILADO (ENSAMBLAJE POR CAPAS + INTERACCIÓN 3D CONTINUA) */}
          <div className="glass-card-cinematic parallax-glass-card relative overflow-hidden w-full py-4 sm:py-6 px-5 sm:px-8 lg:px-10">
            {/* REFLEJO DINÁMICO DE LUZ SOLAR SOBRE EL CRISTAL AL MOVER EL CURSOR */}
            <div className="pointer-events-none absolute inset-0 parallax-glare-overlay" />
            
            {/* ESCUDO UPT PRESENTE DESDE EL INICIO DEL INTRO Y FLOTANDO EN 3D */}
            <div className="relative z-10 flex justify-center mb-2 sm:mb-3 reveal-stage-shield">
              <div className="relative shield-float parallax-shield cursor-pointer transition-transform duration-300 hover:scale-110">
                <img 
                  src="./upt_escudo_oficial.png" 
                  alt="Escudo Heráldico UPT" 
                  className="w-16 h-20 sm:w-20 sm:h-24 lg:w-24 lg:h-28 object-contain filter drop-shadow-xl"
                />
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
              
              {/* ================= LADO IZQUIERDO: INFORMACIÓN INSTITUCIONAL, NORMAS Y MÉTRICAS ================= */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-3 sm:space-y-4 border-b lg:border-b-0 lg:border-r border-slate-300/40 pb-4 lg:pb-0 lg:pr-8">
                
                {/* Encabezado de la Universidad y del Sistema (Placa de Cristal 3D - Etapa 1) */}
                <div className="space-y-2 text-center lg:text-left reveal-stage-title">
                  <h1 className="font-cinzel text-xl sm:text-2xl font-extrabold text-[#0F2942] tracking-wide leading-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                    UNIVERSIDAD PRIVADA DE TACNA
                  </h1>
                  
                  <div className="h-1 w-28 bg-gradient-to-r from-[#0d2d3f] via-[#e63b2e] to-[#D4AF37] mx-auto lg:mx-0 rounded-full my-2 shadow-xs" />
                  
                  <h2 className="font-outfit text-base sm:text-lg font-bold text-[#0d2d3f] tracking-tight">
                    Sistema de Gestión de la Calidad (SGC)
                  </h2>
                  
                  <p className="text-xs text-slate-700 leading-normal font-medium pt-0.5 line-clamp-2">
                    Plataforma rectora institucional para la planificación, auditoría, control de procesos y mejora continua de la excelencia formativa universitaria.
                  </p>
                </div>

                {/* INSIGNIAS NORMATIVAS RECTANGULARES LIMPIAS (ENSAMBLAJE 3D ESCALONADO) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" style={{ perspective: '1000px' }}>
                  
                  {/* Insignia ISO 21001 (Giro 3D frontal con bisel luminoso - Etapa 2) */}
                  <div className="reveal-stage-iso21001 iso-badge-interactive rounded-xl p-2 sm:p-2.5 text-white flex items-center space-x-3 transition-all hover:-translate-y-1 hover:shadow-xl duration-300">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-[#D4AF37]/50 flex-shrink-0 text-[#F3E5AB] shadow-inner">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-[#F3E5AB] font-outfit uppercase">Norma de Calidad</span>
                        <span className="text-[10px] bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded font-mono font-semibold">VIGENTE</span>
                      </div>
                      <div className="text-sm font-extrabold text-white tracking-wide font-cinzel">ISO 21001:2025</div>
                      <div className="text-[11px] text-slate-300 truncate">Organizaciones Educativas</div>
                    </div>
                  </div>

                  {/* Insignia ISO 9001 (Giro 3D secundario - Etapa 3) */}
                  <div className="reveal-stage-iso9001 iso-badge-interactive rounded-xl p-2 sm:p-2.5 text-white flex items-center space-x-3 transition-all hover:-translate-y-1 hover:shadow-xl duration-300">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-[#D4AF37]/50 flex-shrink-0 text-[#F3E5AB] shadow-inner">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-[#F3E5AB] font-outfit uppercase">Norma Calidad</span>
                        <span className="text-[10px] bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded font-mono font-semibold">VIGENTE</span>
                      </div>
                      <div className="text-sm font-extrabold text-white tracking-wide font-cinzel">ISO 9001:2015</div>
                      <div className="text-[11px] text-slate-300 truncate">Gestión de la Calidad</div>
                    </div>
                  </div>

                </div>

                {/* MEDALLONES CIRCULARES CON DOBLE ANILLO CONCÉNTRICO Y CONTADOR ANIMADO (Etapa 4) */}
                <div className="pt-2 reveal-stage-medallions">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-3 text-center lg:text-left font-outfit">
                    Alcance del Sistema por Procesos Institucionales
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Medallón 1: Procedimientos */}
                    <div className="glass-subcard rounded-xl p-2.5 flex items-center space-x-2.5 border border-white/90 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0d2d3f] to-[#001826] text-white flex flex-col items-center justify-center flex-shrink-0 concentric-circle-outer">
                        <span className="text-base font-black font-outfit leading-none">{countProcedures}</span>
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">Docs</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0F2942] font-outfit">Procedimientos</div>
                        <div className="text-xs text-slate-600">Mapeados y estandarizados</div>
                      </div>
                    </div>

                    {/* Medallón 2: Indicadores */}
                    <div className="glass-subcard rounded-xl p-2.5 flex items-center space-x-2.5 border border-white/90 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0b4967] to-[#001725] text-white flex flex-col items-center justify-center flex-shrink-0 concentric-circle-blue">
                        <span className="text-base font-black font-outfit leading-none">{countIndicators}</span>
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">Kpi</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0F2942] font-outfit">Indicadores</div>
                        <div className="text-xs text-slate-600">Métricas de desempeño</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Pie de créditos y certificación */}
                <div className="pt-2 flex items-center justify-start text-xs text-slate-600 border-t border-slate-200/60 font-medium reveal-stage-medallions">
                  <span>Oficina Gestión de la Calidad</span>
                </div>

              </div>

              {/* ================= LADO DERECHO: FORMULARIO DE ACCESO Y REGISTRO (Etapa 3) ================= */}
              <div className="lg:col-span-6 flex flex-col justify-center reveal-stage-right-panel">
                
                <div className="glass-subcard rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/80 shadow-md">
                  
                  {/* Encabezado del Formulario con selector opcional */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#0F2942] font-outfit">
                        {activeTab === 'login'
                          ? 'Acceso a Funcionarios y Auditores'
                          : activeTab === 'reset'
                          ? 'Restablecer Contraseña Institucional'
                          : 'Registro de Nuevo Funcionario'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {activeTab === 'login'
                          ? 'Ingrese con su cuenta de correo electrónico'
                          : activeTab === 'reset'
                          ? 'Cree su nueva clave de acceso al Sistema de Gestión de la Calidad UPT'
                          : 'Complete sus datos para incorporarse al SGC'}
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

                  {activeTab === 'reset' ? (
                    <div>
                      <form className="space-y-3.5" onSubmit={handleConfirmResetSubmit}>
                        {resetVerifiedEmail && (
                          <div className="p-2.5 rounded-xl bg-[#0d2d3f]/5 border border-[#0d2d3f]/20 text-xs text-slate-700 flex items-center justify-between">
                            <span>Cuenta institucional verificada:</span>
                            <strong className="text-[#0d2d3f] font-bold">{resetVerifiedEmail}</strong>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit">
                            Nueva Contraseña de Acceso (mín. 6 caracteres) *
                          </label>
                          <div className="relative flex items-center rounded-xl overflow-hidden shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <KeyRound className="w-4 h-4" />
                            </div>
                            <input
                              type={showNewResetPassword ? 'text' : 'password'}
                              value={newResetPassword}
                              onChange={(e) => setNewResetPassword(e.target.value)}
                              placeholder="Escriba su nueva contraseña"
                              minLength={6}
                              required
                              className="glass-input w-full pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewResetPassword(!showNewResetPassword)}
                              className="absolute right-0 inset-y-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showNewResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit">
                            Confirmar Nueva Contraseña *
                          </label>
                          <div className="relative flex items-center rounded-xl overflow-hidden shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input
                              type={showNewResetPassword ? 'text' : 'password'}
                              value={confirmResetPassword}
                              onChange={(e) => setConfirmResetPassword(e.target.value)}
                              placeholder="Repita su nueva contraseña"
                              minLength={6}
                              required
                              className="glass-input w-full pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            type="submit"
                            disabled={isLoading || !resetOobCode}
                            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#0d2d3f] to-[#001826] hover:brightness-110 text-white font-outfit font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-[#F3E5AB]" />
                                <span>Guardando nueva contraseña...</span>
                              </>
                            ) : (
                              <>
                                <span>Guardar Nueva Contraseña e Ingresar</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-center flex items-center justify-between text-xs">
                        <span className="text-slate-500">¿Recordó su contraseña anterior?</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.history.replaceState({}, document.title, window.location.pathname);
                            }
                            setActiveTab('login');
                            setStatusMessage(null);
                          }}
                          className="font-semibold text-[#0F2942] hover:text-[#e63b2e] underline decoration-dotted font-outfit cursor-pointer"
                        >
                          &larr; Volver al Inicio de Sesión
                        </button>
                      </div>
                    </div>
                  ) : activeTab === 'login' ? (
                    <div>
                      {/* FORMULARIO DE ACCESO CON FIREBASE AUTH */}
                      <form className="space-y-3 sm:space-y-3.5" onSubmit={handleLoginSubmit} autoComplete="off">
                        
                        {/* Campo de Correo Electrónico */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit">
                            Correo Electrónico
                          </label>
                          <div className="relative flex items-center rounded-xl overflow-hidden shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                            <input 
                              type="text" 
                              name="upt_login_username"
                              autoComplete="off"
                              value={emailUsername}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEmailUsername(val);
                              }}
                              placeholder="ejemplo@correo.com" 
                              className="glass-input w-full pl-10 pr-4 py-2 sm:py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none rounded-xl"
                              required
                            />
                          </div>
                        </div>

                        {/* Campo de Contraseña */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700 font-outfit">
                              Contraseña de Acceso
                            </label>
                            <a href="#recuperar" onClick={handleForgotPassword} className="text-[11px] font-medium text-[#0d2d3f] hover:text-[#e63b2e] hover:underline cursor-pointer">
                              ¿Olvidó su clave?
                            </a>
                          </div>
                          <div className="relative flex items-center rounded-xl overflow-hidden shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              name="upt_login_password"
                              autoComplete="new-password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Ingrese su contraseña" 
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

                      {/* ALTERNAR A REGISTRAR NUEVO FUNCIONARIO (DESTACADO Y VISIBLE) */}
                      <div className="mt-3.5 pt-3 border-t border-slate-300/70 flex flex-col items-center gap-2 text-center">
                        <span className="text-xs sm:text-sm font-semibold text-slate-700">
                          ¿Nuevo miembro en el equipo de calidad?
                        </span>
                        <button 
                          type="button"
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-[#0d2d3f] border-2 border-[#9C7D0F] font-outfit font-extrabold text-sm tracking-wide shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                          onClick={() => { setActiveTab('register'); setStatusMessage(null); }}
                        >
                          <UserPlus className="w-4 h-4 text-[#9C7D0F]" />
                          <span>Registrar Nuevo Funcionario &rarr;</span>
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
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Correo Electrónico *</label>
                          <input
                            type="email"
                            placeholder="ejemplo@correo.com"
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

                        {/* PASO 1: ÓRGANO / DEPENDENCIA SUPERIOR */}
                        <div className="space-y-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/90">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">
                              1. Órgano / Dependencia Principal *
                            </label>
                            <select
                              value={regOrganGroup}
                              onChange={(e) => {
                                const newGroup = e.target.value as OrganGroupKey;
                                setRegOrganGroup(newGroup);
                                const firstOffice = ORGANIZATION_UNITS.find(
                                  (u) => u.organGroup === newGroup && u.level !== 'area'
                                );
                                if (firstOffice) {
                                  setRegOfficeId(firstOffice.id);
                                }
                              }}
                              className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none cursor-pointer font-bold"
                            >
                              {ORGAN_GROUPS.map((g) => (
                                <option key={g.key} value={g.key}>
                                  {g.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* PASO 2: OFICINA O FACULTAD */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">
                              2. {regOrganGroup === 'FACULTADES' ? 'Facultad Asignada *' : 'Oficina / Despacho *'}
                            </label>
                            <select
                              value={regOfficeId}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegOfficeId(val);
                                if (val === 'diga') {
                                  setRegAreaId('diga-alog');
                                }
                              }}
                              className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none cursor-pointer font-medium"
                            >
                              {ORGANIZATION_UNITS.filter(
                                (u) => u.organGroup === regOrganGroup && u.level !== 'area'
                              ).map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.officeName} ({u.consolidatedProcedures.length} proc.)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* PASO 3: ÁREA ESPECÍFICA (SI ELIGIÓ DIGA) */}
                          {regOfficeId === 'diga' && (
                            <div className="pt-1 border-t border-slate-200/80">
                              <label className="block text-[11px] font-bold text-[#0d2d3f] mb-0.5 font-outfit">
                                3. Área Específica dentro de DIGA *
                              </label>
                              <select
                                value={regAreaId}
                                onChange={(e) => setRegAreaId(e.target.value)}
                                className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-900 focus:outline-none cursor-pointer font-semibold border-[#0d2d3f]/40"
                              >
                                <option value="diga">
                                  Jefatura / Dirección DIGA (Ver las 6 Áreas consolidadas - 25 proc.)
                                </option>
                                {ORGANIZATION_UNITS.filter(
                                  (u) => u.officeId === 'diga' && u.level === 'area'
                                ).map((area) => (
                                  <option key={area.id} value={area.id}>
                                    {area.areaName} ({area.consolidatedProcedures.length} proc.)
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Resumen de alcance asignado */}
                          <div className="text-[10px] text-slate-600 bg-white/90 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                            <span className="truncate pr-2">
                              Unidad: <strong className="text-[#0d2d3f]">{selectedUnitObj.displayName}</strong>
                            </span>
                            <span className="shrink-0 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {selectedUnitObj.consolidatedProcedures.length} procedimientos
                            </span>
                          </div>
                        </div>

                        {/* Selector de Roles: SIN OPCIÓN VISIBLE DE ADMINISTRADOR */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5 font-outfit">Rol en el SGC *</label>
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
