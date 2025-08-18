import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { PatientFormData } from "../schemas/patientSchema";

interface FinalStepProps {
  register: UseFormRegister<PatientFormData>;
}

export const FinalStep = ({ register }: FinalStepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          {...register("observations")}
          placeholder="Informações adicionais sobre o paciente..."
          rows={4}
        />
      </div>
      
      <div className="bg-accent p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Revisar Informações</h3>
        <p className="text-sm text-muted-foreground">
          Por favor, revise todas as informações antes de finalizar o cadastro.
        </p>
      </div>
    </div>
  );
};