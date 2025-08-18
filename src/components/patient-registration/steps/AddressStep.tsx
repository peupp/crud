import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { PatientFormData } from "../schemas/patientSchema";

interface AddressStepProps {
  register: UseFormRegister<PatientFormData>;
}

export const AddressStep = ({ register }: AddressStepProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            {...register("cep")}
            placeholder="00000-000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">Logradouro</Label>
          <Input
            id="street"
            {...register("street")}
            placeholder="Rua, Avenida, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_number">Número</Label>
          <Input
            id="address_number"
            {...register("address_number")}
            placeholder="123"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            {...register("complement")}
            placeholder="Apto, Bloco, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            {...register("neighborhood")}
            placeholder="Nome do bairro"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            {...register("city")}
            placeholder="Nome da cidade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            {...register("state")}
            placeholder="UF"
          />
        </div>
      </div>
    </div>
  );
};