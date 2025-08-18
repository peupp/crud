import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PatientForm } from "@/components/patient-registration";

const PatientRegistration = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Helmet>
        <title>Cadastro de Paciente | Sistema Médico</title>
        <meta name="description" content="Cadastre novos pacientes no sistema médico" />
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Link>
          </div>
        </div>

        {/* Registration Form */}
        <PatientForm />
      </div>
    </div>
  );
};

export default PatientRegistration;