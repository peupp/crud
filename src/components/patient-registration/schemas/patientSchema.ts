import * as z from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  social_name: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  mobile_phone: z.string().optional(),
  phone1: z.string().optional(),
  phone2: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  birth_date: z.string().optional(),
  sex: z.enum(["masculino", "feminino", "nao_informado"]).default("nao_informado"),
  marital_status: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel", "nao_informado"]).default("nao_informado"),
  profession: z.string().optional(),
  convenio: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  address_number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  mother_name: z.string().optional(),
  father_name: z.string().optional(),
  observations: z.string().optional(),
  vip: z.boolean().default(false),
});

export type PatientFormData = z.infer<typeof patientSchema>;