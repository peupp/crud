import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <Helmet>
        <title>Sistema de Gestão</title>
        <meta name="description" content="Sistema completo de gestão com funcionalidades avançadas" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sistema de Gestão
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-300">
            Solução completa para gerenciar seu negócio
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="text-white">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-400" />
                  <CardTitle className="text-2xl">Pacientes</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Gerenciar pacientes, prontuários e agendamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/patients">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Acessar Pacientes
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="text-white">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-green-400" />
                  <CardTitle className="text-2xl">Clientes</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Cadastro e gestão de clientes do serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/clients">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Acessar Clientes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
