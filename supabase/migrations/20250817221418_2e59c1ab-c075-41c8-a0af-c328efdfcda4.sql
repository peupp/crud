-- Create clients table with same structure as patients
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,
  vip BOOLEAN NOT NULL DEFAULT false,
  photo_url TEXT,
  convenio TEXT,
  name TEXT NOT NULL,
  social_name TEXT,
  cpf TEXT,
  rg TEXT,
  document_type document_type,
  document_number TEXT,
  sex sex DEFAULT 'nao_informado'::sex,
  birth_date DATE,
  marital_status marital_status DEFAULT 'nao_informado'::marital_status,
  rn_guia_convenio BOOLEAN DEFAULT false,
  race TEXT,
  ethnicity TEXT,
  naturalidade TEXT,
  nacionalidade TEXT,
  profession TEXT,
  email TEXT,
  mobile_phone TEXT,
  phone1 TEXT,
  phone2 TEXT,
  cep TEXT,
  street TEXT,
  address_number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  reference TEXT,
  mother_name TEXT,
  mother_profession TEXT,
  father_name TEXT,
  father_profession TEXT,
  guardian_name TEXT,
  guardian_cpf TEXT,
  spouse_name TEXT,
  legacy_code TEXT,
  observations TEXT
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Allow all actions for authenticated on clients" 
ON public.clients 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for audit logging
CREATE TRIGGER clients_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.log_row_changes();