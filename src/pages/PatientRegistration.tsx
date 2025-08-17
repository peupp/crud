import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Upload,
  Heart,
  Shield,
  UserCheck,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

const patientSchema = z.object({
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

type PatientFormData = z.infer<typeof patientSchema>;

const PatientRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      sex: "nao_informado",
      marital_status: "nao_informado",
      vip: false,
    }
  });

  const vipValue = watch("vip");

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `patient-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('patient-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('patient-attachments')
        .getPublicUrl(filePath);

      setUploadedImage(publicUrl);
      toast.success("Foto carregada com sucesso!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erro ao carregar a foto");
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      const patientData = {
        name: data.name,
        social_name: data.social_name || null,
        email: data.email || null,
        mobile_phone: data.mobile_phone || null,
        phone1: data.phone1 || null,
        phone2: data.phone2 || null,
        cpf: data.cpf || null,
        rg: data.rg || null,
        sex: data.sex,
        birth_date: data.birth_date ? new Date(data.birth_date).toISOString().split('T')[0] : null,
        marital_status: data.marital_status,
        profession: data.profession || null,
        convenio: data.convenio || null,
        cep: data.cep || null,
        street: data.street || null,
        address_number: data.address_number || null,
        complement: data.complement || null,
        neighborhood: data.neighborhood || null,
        city: data.city || null,
        state: data.state || null,
        mother_name: data.mother_name || null,
        father_name: data.father_name || null,
        observations: data.observations || null,
        vip: data.vip || false,
        photo_url: uploadedImage,
      };

      const { error } = await supabase
        .from('patients')
        .insert(patientData);

      if (error) throw error;

      toast.success("Paciente cadastrado com sucesso!");
      // Reset form or redirect
      setCurrentStep(1);
      setUploadedImage(null);
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error("Erro ao cadastrar paciente");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Dados Pessoais", icon: User },
    { number: 2, title: "Contato", icon: Phone },
    { number: 3, title: "Endereço", icon: MapPin },
    { number: 4, title: "Família", icon: Heart },
    { number: 5, title: "Finalização", icon: UserCheck }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
            currentStep >= step.number 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-background text-muted-foreground border-border'
          }`}>
            <step.icon className="w-5 h-5" />
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 ${
              currentStep > step.number ? 'bg-primary' : 'bg-border'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
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

      case 2:
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

      case 3:
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

      case 4:
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

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                {...register("observations")}
                placeholder="Observações adicionais sobre o paciente..."
                className="min-h-[120px]"
              />
            </div>

            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Resumo do Cadastro</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Nome:</strong> {watch("name") || "Não informado"}</p>
                  <p><strong>Email:</strong> {watch("email") || "Não informado"}</p>
                  <p><strong>Telefone:</strong> {watch("mobile_phone") || "Não informado"}</p>
                </div>
                <div>
                  <p><strong>Cidade:</strong> {watch("city") || "Não informado"}</p>
                  <p><strong>Estado:</strong> {watch("state") || "Não informado"}</p>
                  <p><strong>Status:</strong> {watch("vip") ? "VIP" : "Regular"}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <Helmet>
        <title>Cadastro de Paciente - Sistema de Gestão</title>
        <meta name="description" content="Cadastre um novo paciente no sistema com interface moderna e intuitiva" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Cadastro de Paciente</h1>
          <p className="text-muted-foreground">Preencha os dados do novo paciente</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {steps[currentStep - 1]?.title}
              </CardTitle>
              {renderStepIndicator()}
            </CardHeader>
            
            <CardContent className="p-8">
              {renderStepContent()}

              <Separator className="my-8" />

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Anterior
                </Button>
                
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                    {isLoading ? "Cadastrando..." : "Finalizar Cadastro"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;