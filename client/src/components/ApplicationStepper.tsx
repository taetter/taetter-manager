import { DollarSign, User, Syringe, FileText, CreditCard, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Step {
  number: number;
  label: string;
  icon: React.ReactNode;
}

interface ApplicationStepperProps {
  currentStep: number;
  totalSteps?: number;
}

export function ApplicationStepper({ currentStep, totalSteps = 6 }: ApplicationStepperProps) {
  const steps: Step[] = [
    { number: 0, label: "Orçamento", icon: <DollarSign className="w-5 h-5" /> },
    { number: 1, label: "Paciente", icon: <User className="w-5 h-5" /> },
    { number: 2, label: "Vacinas", icon: <Syringe className="w-5 h-5" /> },
    { number: 3, label: "Valores", icon: <FileText className="w-5 h-5" /> },
    { number: 4, label: "Pagamento", icon: <CreditCard className="w-5 h-5" /> },
    { number: 5, label: "Finalizar", icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white border-b-2 border-blue-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Texto de Progresso */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              Passo {currentStep} de {totalSteps}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {currentStep === 0 && "Criando o orçamento"}
              {currentStep === 1 && "Identificando o paciente"}
              {currentStep === 2 && "Selecionando as vacinas"}
              {currentStep === 3 && "Confirmando os valores"}
              {currentStep === 4 && "Registrando o pagamento"}
              {currentStep === 5 && "Finalizando a aplicação"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{Math.round(progressPercentage)}%</p>
            <p className="text-xs text-gray-500">concluído</p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <Progress value={progressPercentage} className="h-3 mb-4" />

        {/* Stepper Visual */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isPending = step.number > currentStep;

            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Círculo do Step */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all
                      ${isCompleted ? "bg-green-500 text-white" : ""}
                      ${isCurrent ? "bg-blue-500 text-white ring-4 ring-blue-200 scale-110" : ""}
                      ${isPending ? "bg-gray-200 text-gray-500" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <div className="flex items-center justify-center">{step.icon}</div>
                    )}
                  </div>
                  <p
                    className={`
                      text-xs mt-2 font-medium text-center
                      ${isCompleted ? "text-green-600" : ""}
                      ${isCurrent ? "text-blue-600 font-bold" : ""}
                      ${isPending ? "text-gray-500" : ""}
                    `}
                  >
                    {step.label}
                  </p>
                </div>

                {/* Linha Conectora */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 mb-6">
                    <div
                      className={`h-full rounded transition-all ${
                        step.number < currentStep ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mensagem Motivacional */}
        <div className="mt-4 text-center">
          {currentStep < totalSteps && (
            <p className="text-sm text-gray-600">
              {currentStep === 0 && "💰 Vamos começar! Primeiro, crie o orçamento"}
              {currentStep === 1 && "🎯 Ótimo! Agora identifique o paciente"}
              {currentStep === 2 && "💉 Perfeito! Escolha as vacinas"}
              {currentStep === 3 && "📋 Quase lá! Confirme os valores"}
              {currentStep === 4 && "💳 Falta pouco! Registre o pagamento"}
              {currentStep === 5 && "🎉 Última etapa! Vamos finalizar"}
            </p>
          )}
          {currentStep === totalSteps && (
            <p className="text-sm font-semibold text-green-600">
              ✅ Atendimento concluído com sucesso!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
