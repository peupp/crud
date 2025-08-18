import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone } from "lucide-react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { PatientFormData } from "../schemas/patientSchema";

interface ContactStepProps {
  register: UseFormRegister<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
}

export const ContactStep = ({ register, errors }: ContactStepProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@exemplo.com"
              className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
            />
          </div>
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile_phone">Celular</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="mobile_phone"
              {...register("mobile_phone")}
              placeholder="(00) 00000-0000"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone1">Telefone 1</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone1"
              {...register("phone1")}
              placeholder="(00) 0000-0000"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone2">Telefone 2</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone2"
              {...register("phone2")}
              placeholder="(00) 0000-0000"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="convenio">Convênio</Label>
          <Input
            id="convenio"
            {...register("convenio")}
            placeholder="Nome do convênio médico"
          />
        </div>
      </div>
    </div>
  );
};