import { useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useEmployeeAuth } from "@/contexts/EmployeeAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download } from "lucide-react";

export default function Payslips() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { employee, isLoading } = useEmployeeAuth();
  
  const tenantId = parseInt(params.tenantId!);

  useEffect(() => {
    if (!isLoading && !employee) {
      setLocation(`/employee/${tenantId}/login`);
    }
  }, [employee, isLoading, tenantId, setLocation]);

  if (isLoading || !employee) {
    return null;
  }

  // Mock data - será substituído por dados reais do backend
  const mockPayslips = [
    { mes: "Janeiro 2026", valor: "R$ 3.500,00", status: "Pago" },
    { mes: "Dezembro 2025", valor: "R$ 3.500,00", status: "Pago" },
    { mes: "Novembro 2025", valor: "R$ 3.500,00", status: "Pago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/employee/${tenantId}/dashboard`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Holerites</h1>
              <p className="text-sm text-muted-foreground">
                Consulte seus holerites e informes de pagamento
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {mockPayslips.map((payslip, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{payslip.mes}</CardTitle>
                      <CardDescription>Salário: {payslip.valor}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
                      {payslip.status}
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {mockPayslips.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum holerite disponível</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
