import { useState } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

export default function TenantSettings() {
  const { user } = useAuth();
  const params = useParams();
  const tenantId = parseInt(params.id || "0");
  
  const [copied, setCopied] = useState(false);
  const [copiedEmployee, setCopiedEmployee] = useState(false);

  // Gerar URL da área do paciente
  const patientPortalUrl = `${window.location.origin}/patient/${tenantId}/login`;
  
  // Gerar URL da área do colaborador
  const employeePortalUrl = `${window.location.origin}/employee/${tenantId}/login`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(patientPortalUrl);
    setCopied(true);
    toast.success("URL copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUrl = () => {
    window.open(patientPortalUrl, "_blank");
  };
  
  const handleCopyEmployeeUrl = () => {
    navigator.clipboard.writeText(employeePortalUrl);
    setCopiedEmployee(true);
    toast.success("URL copiada para a área de transferência!");
    setTimeout(() => setCopiedEmployee(false), 2000);
  };

  const handleOpenEmployeeUrl = () => {
    window.open(employeePortalUrl, "_blank");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <Link href={`/tenant/${tenantId}/dashboard`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a365d]">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações do seu tenant
            </p>
          </div>
        </div>

        {/* Área do Paciente */}
        <Card>
          <CardHeader>
            <CardTitle>Área do Paciente</CardTitle>
            <CardDescription>
              URL para acesso dos pacientes ao portal. Compartilhe este link no site da sua clínica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientPortalUrl">URL de Acesso</Label>
              <div className="flex gap-2">
                <Input
                  id="patientPortalUrl"
                  value={patientPortalUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                  title="Copiar URL"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenUrl}
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Como usar</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Copie a URL acima e adicione ao site da sua clínica</li>
                <li>Os pacientes usarão CPF e senha para fazer login</li>
                <li>Defina a senha inicial dos pacientes na página de detalhes</li>
                <li>Os pacientes poderão visualizar seus dados e histórico</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante</h4>
              <p className="text-sm text-yellow-800">
                Certifique-se de definir senhas para os pacientes antes de compartilhar este link.
                Você pode definir a senha na página de detalhes de cada paciente.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Área do Colaborador */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Área do Colaborador (ADC)</CardTitle>
            <CardDescription>
              URL para acesso dos colaboradores ao portal. Compartilhe este link com sua equipe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeePortalUrl">URL de Acesso</Label>
              <div className="flex gap-2">
                <Input
                  id="employeePortalUrl"
                  value={employeePortalUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyEmployeeUrl}
                  title="Copiar URL"
                >
                  {copiedEmployee ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenEmployeeUrl}
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Como usar</h4>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Copie a URL acima e compartilhe com seus colaboradores</li>
                <li>Os colaboradores usarão CPF e senha para fazer login</li>
                <li>Cadastre colaboradores no módulo de RH</li>
                <li>Defina a senha inicial na página de gestão de colaboradores</li>
                <li>Colaboradores podem consultar holerites, registrar ponto, solicitar horas extras, etc</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante</h4>
              <p className="text-sm text-yellow-800">
                Certifique-se de cadastrar os colaboradores no módulo de RH e definir senhas antes de compartilhar este link.
                Acesse o módulo de RH para gerenciar colaboradores.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/tenant/${tenantId}/hr`}>Gerenciar Colaboradores</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
