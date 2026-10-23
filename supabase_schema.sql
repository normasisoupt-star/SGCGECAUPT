-- ====================================================================
-- ESQUEMA DE BASE DE DATOS PARA SIGE 21001 (ISO 21001:2018)
-- Compatible con PostgreSQL y Supabase
-- ====================================================================

-- 1. Tabla de Usuarios y Perfiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'approver', 'collaborator', 'auditor', 'viewer')),
    department TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Documentos de Calidad (DMS)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('politica', 'manual', 'procedimiento', 'instructivo', 'formato', 'silabo', 'rubrica', 'acta')),
    process TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    status TEXT NOT NULL CHECK (status IN ('borrador', 'revision', 'aprobado', 'obsoleto')),
    file_name TEXT NOT NULL,
    file_size TEXT NOT NULL,
    file_url TEXT,
    uploaded_by TEXT NOT NULL,
    approved_by TEXT,
    iso_clause TEXT NOT NULL,
    description TEXT,
    change_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de No Conformidades y Acciones Correctivas (CAPA)
CREATE TABLE IF NOT EXISTS public.non_conformities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('auditoria_interna', 'auditoria_externa', 'queja_reclamo', 'evaluacion_desempeno', 'desviacion_proceso')),
    severity TEXT NOT NULL CHECK (severity IN ('mayor', 'menor', 'observacion')),
    iso_clause TEXT NOT NULL,
    department TEXT NOT NULL,
    detected_date DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('abierta', 'analisis_causa', 'plan_aprobado', 'en_implementacion', 'cerrada')),
    assigned_to TEXT NOT NULL,
    created_by TEXT NOT NULL,
    why_analysis JSONB DEFAULT '{}'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    verification_date DATE,
    verified_by TEXT,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Auditorías y Listas de Chequeo
CREATE TABLE IF NOT EXISTS public.audit_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clause TEXT NOT NULL,
    clause_title TEXT NOT NULL,
    requirement TEXT NOT NULL,
    evidence_question TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('conforme', 'no_conforme', 'observacion', 'no_evaluado')),
    notes TEXT,
    finding_reference TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Registro de Auditoría del Sistema (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Tiempo Real en Supabase para las tablas principales
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.non_conformities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_checklist;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
