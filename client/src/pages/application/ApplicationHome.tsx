import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Syringe, ArrowRight, User, FileText, CreditCard, CheckCircle, DollarSign } from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

export default function ApplicationHome() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const deviceType = useDeviceDetection();

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white ${deviceType === "mobile" ? "p-4" : "p-8"}`}>
      <div className={`${deviceType === "mobile" ? "max-w-full" : "max-w-4xl"} mx-auto`}>
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/tenant/${tenantId}`}>Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Atendimento</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Principal */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-4">
            <Syringe className="w-10 h-10 text-white" />
          </div>
          <h1 className={`${deviceType === "mobile" ? "text-3xl" : "text-5xl"} font-bold text-gray-900 mb-3`}>
            Iniciar Atendimento
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Vamos criar um orçamento e registrar a aplicação passo a passo
          </p>
        </div>

        {/* Card Principal - Botão Único */}
        <Card className="border-2 border-blue-300 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white pb-8">
            <CardTitle className="text-center text-2xl font-bold">
              O sistema vai te guiar em cada etapa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            {/* Etapas do Fluxo */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    1
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Criar Orçamento</p>
                    <p className="text-sm text-gray-600">Paciente + vacinas + preços</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
                    2
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-700 text-lg">Confirmar Aplicação</p>
                    <p className="text-sm text-gray-500">Dados e tipo de etiqueta</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
                    3
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <CreditCard className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-700 text-lg">Registrar Pagamento</p>
                    <p className="text-sm text-gray-500">Formas de pagamento</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
                    4
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <Syringe className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-700 text-lg">Aplicar Vacinas</p>
                    <p className="text-sm text-gray-500">Registrar aplicação</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
                    5
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <CheckCircle className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-700 text-lg">Finalizar Aplicação</p>
                    <p className="text-sm text-gray-500">Registrar e gerar comprovante</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão Único e Grande */}
            <Button 
              asChild 
              size="lg" 
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
            >
              <Link href={`/tenant/${tenantId}/application/budget`}>
                <span>Começar Atendimento</span>
                <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              ⏱️ Tempo estimado: 3 a 5 minutos
            </p>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
