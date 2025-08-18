import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { ContactStep } from "./steps/ContactStep";
import { AddressStep } from "./steps/AddressStep";
import { FamilyStep } from "./steps/FamilyStep";
import { FinalStep } from "./steps/FinalStep";
import { patientSchema, type PatientFormData } from "./schemas/patientSchema";

const PatientForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<PatientFormData>({
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
      setCurrentStep(1);
      setUploadedImage(null);
      reset();
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error("Erro ao cadastrar paciente");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    const stepProps = {
      register,
      errors,
      setValue,
      watch,
      uploadedImage,
      handleImageUpload,
      vipValue
    };

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} />;
      case 2:
        return <ContactStep {...stepProps} />;
      case 3:
        return <AddressStep {...stepProps} />;
      case 4:
        return <FamilyStep {...stepProps} />;
      case 5:
        return <FinalStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Cadastro de Paciente</CardTitle>
        <StepIndicator currentStep={currentStep} />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderStepContent()}
          
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>
            
            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2"
              >
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <span>{isLoading ? "Cadastrando..." : "Finalizar Cadastro"}</span>
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;