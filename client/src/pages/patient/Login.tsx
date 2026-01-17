import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { usePatientAuth } from "@/contexts/PatientAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function PatientLogin() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const tenantId = parseInt(params.tenantId || "0");
  
  const { login, isLoading } = usePatientAuth();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return value;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cpf || !senha) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (!tenantId) {
      toast.error("Tenant não identificado");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(tenantId, cpf, senha);
      toast.success("Login realizado com sucesso!");
      setLocation(`/patient/${tenantId}/dashboard`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Área do Paciente</CardTitle>
          <CardDescription>
            Entre com seu CPF e senha para acessar suas informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                maxLength={14}
                disabled={isSubmitting || isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={isSubmitting || isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Primeiro acesso?</strong> Use seu primeiro nome como senha.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Após o login, você será solicitado a criar uma senha pessoal.
              </p>
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Esqueceu sua senha?</p>
              <p className="mt-1">Entre em contato com a clínica</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
