export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          notes: string | null
          patient_id: string
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          new_data: Json | null
          old_data: Json | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          active: boolean
          address_number: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          complement: string | null
          convenio: string | null
          cpf: string | null
          created_at: string
          document_number: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          email: string | null
          ethnicity: string | null
          father_name: string | null
          father_profession: string | null
          guardian_cpf: string | null
          guardian_name: string | null
          id: string
          legacy_code: string | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          mobile_phone: string | null
          mother_name: string | null
          mother_profession: string | null
          nacionalidade: string | null
          name: string
          naturalidade: string | null
          neighborhood: string | null
          observations: string | null
          phone1: string | null
          phone2: string | null
          photo_url: string | null
          profession: string | null
          race: string | null
          reference: string | null
          rg: string | null
          rn_guia_convenio: boolean | null
          sex: Database["public"]["Enums"]["sex"] | null
          social_name: string | null
          spouse_name: string | null
          state: string | null
          street: string | null
          updated_at: string
          vip: boolean
        }
        Insert: {
          active?: boolean
          address_number?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          email?: string | null
          ethnicity?: string | null
          father_name?: string | null
          father_profession?: string | null
          guardian_cpf?: string | null
          guardian_name?: string | null
          id?: string
          legacy_code?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          mobile_phone?: string | null
          mother_name?: string | null
          mother_profession?: string | null
          nacionalidade?: string | null
          name: string
          naturalidade?: string | null
          neighborhood?: string | null
          observations?: string | null
          phone1?: string | null
          phone2?: string | null
          photo_url?: string | null
          profession?: string | null
          race?: string | null
          reference?: string | null
          rg?: string | null
          rn_guia_convenio?: boolean | null
          sex?: Database["public"]["Enums"]["sex"] | null
          social_name?: string | null
          spouse_name?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          vip?: boolean
        }
        Update: {
          active?: boolean
          address_number?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          email?: string | null
          ethnicity?: string | null
          father_name?: string | null
          father_profession?: string | null
          guardian_cpf?: string | null
          guardian_name?: string | null
          id?: string
          legacy_code?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          mobile_phone?: string | null
          mother_name?: string | null
          mother_profession?: string | null
          nacionalidade?: string | null
          name?: string
          naturalidade?: string | null
          neighborhood?: string | null
          observations?: string | null
          phone1?: string | null
          phone2?: string | null
          photo_url?: string | null
          profession?: string | null
          race?: string | null
          reference?: string | null
          rg?: string | null
          rn_guia_convenio?: boolean | null
          sex?: Database["public"]["Enums"]["sex"] | null
          social_name?: string | null
          spouse_name?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          vip?: boolean
        }
        Relationships: []
      }
      crud: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      patients: {
        Row: {
          active: boolean
          address_number: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          complement: string | null
          convenio: string | null
          cpf: string | null
          created_at: string
          document_number: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          email: string | null
          ethnicity: string | null
          father_name: string | null
          father_profession: string | null
          guardian_cpf: string | null
          guardian_name: string | null
          id: string
          legacy_code: string | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          mobile_phone: string | null
          mother_name: string | null
          mother_profession: string | null
          nacionalidade: string | null
          name: string
          naturalidade: string | null
          neighborhood: string | null
          observations: string | null
          phone1: string | null
          phone2: string | null
          photo_url: string | null
          profession: string | null
          race: string | null
          reference: string | null
          rg: string | null
          rn_guia_convenio: boolean | null
          sex: Database["public"]["Enums"]["sex"] | null
          social_name: string | null
          spouse_name: string | null
          state: string | null
          street: string | null
          updated_at: string
          vip: boolean
        }
        Insert: {
          active?: boolean
          address_number?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          email?: string | null
          ethnicity?: string | null
          father_name?: string | null
          father_profession?: string | null
          guardian_cpf?: string | null
          guardian_name?: string | null
          id?: string
          legacy_code?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          mobile_phone?: string | null
          mother_name?: string | null
          mother_profession?: string | null
          nacionalidade?: string | null
          name: string
          naturalidade?: string | null
          neighborhood?: string | null
          observations?: string | null
          phone1?: string | null
          phone2?: string | null
          photo_url?: string | null
          profession?: string | null
          race?: string | null
          reference?: string | null
          rg?: string | null
          rn_guia_convenio?: boolean | null
          sex?: Database["public"]["Enums"]["sex"] | null
          social_name?: string | null
          spouse_name?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          vip?: boolean
        }
        Update: {
          active?: boolean
          address_number?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          email?: string | null
          ethnicity?: string | null
          father_name?: string | null
          father_profession?: string | null
          guardian_cpf?: string | null
          guardian_name?: string | null
          id?: string
          legacy_code?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          mobile_phone?: string | null
          mother_name?: string | null
          mother_profession?: string | null
          nacionalidade?: string | null
          name?: string
          naturalidade?: string | null
          neighborhood?: string | null
          observations?: string | null
          phone1?: string | null
          phone2?: string | null
          photo_url?: string | null
          profession?: string | null
          race?: string | null
          reference?: string | null
          rg?: string | null
          rn_guia_convenio?: boolean | null
          sex?: Database["public"]["Enums"]["sex"] | null
          social_name?: string | null
          spouse_name?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          vip?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status:
        | "agendado"
        | "realizado"
        | "cancelado"
        | "nao_compareceu"
      document_type: "RG" | "CNH" | "PASSAPORTE" | "RNE" | "OUTRO"
      marital_status:
        | "solteiro"
        | "casado"
        | "divorciado"
        | "viuvo"
        | "uniao_estavel"
        | "outro"
        | "nao_informado"
      sex: "masculino" | "feminino" | "outro" | "nao_informado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "agendado",
        "realizado",
        "cancelado",
        "nao_compareceu",
      ],
      document_type: ["RG", "CNH", "PASSAPORTE", "RNE", "OUTRO"],
      marital_status: [
        "solteiro",
        "casado",
        "divorciado",
        "viuvo",
        "uniao_estavel",
        "outro",
        "nao_informado",
      ],
      sex: ["masculino", "feminino", "outro", "nao_informado"],
    },
  },
} as const
