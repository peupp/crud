import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { PatientFormData } from "../schemas/patientSchema";

interface FamilyStepProps {
  register: UseFormRegister<PatientFormData>;
}

export const FamilyStep = ({ register }: FamilyStepProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mother_name">Nome da Mãe</Label>
          <Input
            id="mother_name"
            {...register("mother_name")}
            placeholder="Nome completo da mãe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="father_name">Nome do Pai</Label>
          <Input
            id="father_name"
            {...register("father_name")}
            placeholder="Nome completo do pai"
          />
        </div>
      </div>
    </div>
  );
};