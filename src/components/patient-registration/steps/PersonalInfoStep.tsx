import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload, Shield } from "lucide-react";
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { PatientFormData } from "../schemas/patientSchema";

interface PersonalInfoStepProps {
  register: UseFormRegister<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
  setValue: UseFormSetValue<PatientFormData>;
  watch: UseFormWatch<PatientFormData>;
  uploadedImage: string | null;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  vipValue: boolean;
}

export const PersonalInfoStep = ({ 
  register, 
  errors, 
  setValue, 
  uploadedImage, 
  handleImageUpload,
  vipValue 
}: PersonalInfoStepProps) => {
  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={uploadedImage || ""} />
          <AvatarFallback className="text-2xl">
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center space-x-2">
          <Label htmlFor="photo" className="cursor-pointer">
            <div className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Carregar Foto</span>
            </div>
          </Label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Nome completo do paciente"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="social_name">Nome Social</Label>
          <Input
            id="social_name"
            {...register("social_name")}
            placeholder="Nome social (opcional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            {...register("cpf")}
            placeholder="000.000.000-00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input
            id="rg"
            {...register("rg")}
            placeholder="00.000.000-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_date">Data de Nascimento</Label>
          <Input
            id="birth_date"
            type="date"
            {...register("birth_date")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sexo</Label>
          <Select onValueChange={(value) => setValue("sex", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="nao_informado">Não informado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marital_status">Estado Civil</Label>
          <Select onValueChange={(value) => setValue("marital_status", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado civil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
              <SelectItem value="casado">Casado(a)</SelectItem>
              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
              <SelectItem value="uniao_estavel">União Estável</SelectItem>
              <SelectItem value="nao_informado">Não informado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profession">Profissão</Label>
          <Input
            id="profession"
            {...register("profession")}
            placeholder="Profissão do paciente"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 p-4 bg-accent rounded-lg">
        <Checkbox
          id="vip"
          checked={vipValue}
          onCheckedChange={(checked) => setValue("vip", checked as boolean)}
        />
        <Label htmlFor="vip" className="flex items-center space-x-2 cursor-pointer">
          <Shield className="w-4 h-4 text-yellow-500" />
          <span>Paciente VIP</span>
        </Label>
        {vipValue && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">VIP</Badge>}
      </div>
    </div>
  );
};