-- Enums necessários
DO $$ BEGIN
  CREATE TYPE public.sex AS ENUM ('masculino','feminino','outro','nao_informado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.marital_status AS ENUM ('solteiro','casado','divorciado','viuvo','uniao_estavel','outro','nao_informado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.document_type AS ENUM ('RG','CNH','PASSAPORTE','RNE','OUTRO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.appointment_status AS ENUM ('agendado','realizado','cancelado','nao_compareceu');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela de pacientes
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true,
  vip boolean NOT NULL DEFAULT false,
  photo_url text,
  convenio text,
  name text NOT NULL,
  social_name text,
  cpf text UNIQUE,
  rg text,
  document_type public.document_type,
  document_number text,
  sex public.sex DEFAULT 'nao_informado',
  birth_date date,
  race text,
  ethnicity text,
  naturalidade text,
  nacionalidade text,
  profession text,
  marital_status public.marital_status DEFAULT 'nao_informado',
  mother_name text,
  mother_profession text,
  father_name text,
  father_profession text,
  guardian_name text,
  guardian_cpf text,
  spouse_name text,
  rn_guia_convenio boolean DEFAULT false,
  legacy_code text,
  observations text,
  email text,
  mobile_phone text,
  phone1 text,
  phone2 text,
  cep text,
  street text,
  address_number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  reference text
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_patients_lower_name ON public.patients (lower(name));
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients (cpf);
CREATE INDEX IF NOT EXISTS idx_patients_city_state ON public.patients (city, state);
CREATE INDEX IF NOT EXISTS idx_patients_birth_date ON public.patients (birth_date);
CREATE INDEX IF NOT EXISTS idx_patients_vip ON public.patients (vip);
CREATE INDEX IF NOT EXISTS idx_patients_convenio ON public.patients (convenio);

-- Tabela de atendimentos (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  notes text,
  status public.appointment_status NOT NULL DEFAULT 'agendado'
);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON public.appointments(starts_at);

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  changed_by uuid,
  old_data jsonb,
  new_data jsonb
);

-- Triggers de updated_at
DO $$ BEGIN
  CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Função de auditoria
CREATE OR REPLACE FUNCTION public.log_row_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs(entity_type, entity_id, action, changed_by, old_data, new_data)
  VALUES (TG_TABLE_NAME::text, COALESCE(NEW.id, OLD.id), TG_OP::text, auth.uid(), row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers de auditoria
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_patients_audit ON public.patients;
  CREATE TRIGGER trg_patients_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.log_row_changes();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_appointments_audit ON public.appointments;
  CREATE TRIGGER trg_appointments_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.log_row_changes();
EXCEPTION WHEN others THEN NULL; END $$;

-- Habilitar RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas simples (restritas a usuários autenticados)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all actions for authenticated on patients" ON public.patients;
  CREATE POLICY "Allow all actions for authenticated on patients"
  ON public.patients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all actions for authenticated on appointments" ON public.appointments;
  CREATE POLICY "Allow all actions for authenticated on appointments"
  ON public.appointments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow select for authenticated on audit_logs" ON public.audit_logs;
  CREATE POLICY "Allow select for authenticated on audit_logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (true);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow insert for authenticated on audit_logs" ON public.audit_logs;
  CREATE POLICY "Allow insert for authenticated on audit_logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
EXCEPTION WHEN others THEN NULL; END $$;

-- Bucket de storage para anexos do paciente (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-attachments', 'patient-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
DO $$ BEGIN
  CREATE POLICY "Authenticated can read patient attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'patient-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated can insert patient attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'patient-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated can update patient attachments"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'patient-attachments')
  WITH CHECK (bucket_id = 'patient-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated can delete patient attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'patient-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
