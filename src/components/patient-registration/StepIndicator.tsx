import { User, Phone, MapPin, Heart, UserCheck } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = [
    { number: 1, title: "Dados Pessoais", icon: User },
    { number: 2, title: "Contato", icon: Phone },
    { number: 3, title: "Endereço", icon: MapPin },
    { number: 4, title: "Família", icon: Heart },
    { number: 5, title: "Finalização", icon: UserCheck }
  ];

  return (
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
};