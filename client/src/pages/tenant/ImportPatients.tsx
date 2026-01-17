import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileSpreadsheet, Download, Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ImportPatients() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const tenantId = parseInt(params.id || "0");

  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const downloadTemplateMutation = trpc.patients.downloadTemplate.useQuery(undefined, {
    enabled: false,
  });

  const importMutation = trpc.patients.importExcel.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      if (result.imported > 0) {
        toast.success(`${result.imported} paciente(s) importado(s) com sucesso!`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} paciente(s) com erro`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao importar pacientes");
    },
  });

  const handleDownloadTemplate = async () => {
    try {
      const result = await downloadTemplateMutation.refetch();
      if (result.data) {
        // Converter base64 para blob
        const byteCharacters = atob(result.data.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Template baixado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao baixar template");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Por favor, selecione um arquivo Excel (.xlsx ou .xls)");
      return;
    }

    // Validar tamanho (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }

    try {
      // Ler arquivo como base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(",")[1];

        importMutation.mutate({
          tenantId,
          fileData: base64Data,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao processar arquivo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container max-w-5xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation(`/tenant/${tenantId}/patients`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a365d]">Importar Pacientes</h1>
            <p className="text-muted-foreground">
              Importe múltiplos pacientes através de uma planilha Excel
            </p>
          </div>
        </div>

        {/* Instruções */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Como importar</CardTitle>
            <CardDescription>Siga os passos abaixo para importar seus pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Baixe o template Excel clicando no botão abaixo</li>
              <li>Preencha a planilha com os dados dos pacientes</li>
              <li>
                Certifique-se de que o CPF está no formato correto (000.000.000-00)
              </li>
              <li>Certifique-se de que o CEP está no formato correto (00000-000)</li>
              <li>A data de nascimento deve estar no formato AAAA-MM-DD ou DD/MM/AAAA</li>
              <li>O campo "sexo" deve ser "M", "F" ou "Outro"</li>
              <li>Faça upload do arquivo preenchido</li>
            </ol>

            <div className="mt-6">
              <Button onClick={handleDownloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Template Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload do Arquivo</CardTitle>
            <CardDescription>Selecione o arquivo Excel com os dados dos pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Arquivo Excel</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="mt-2"
                />
                {file && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <Button
                onClick={handleImport}
                disabled={!file || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Pacientes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Importação</CardTitle>
              <CardDescription>
                {importResult.total} registro(s) processado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-700">
                    {importResult.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {importResult.imported}
                  </div>
                  <div className="text-sm text-muted-foreground">Importados</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">
                    {importResult.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Com Erro</div>
                </div>
              </div>

              {/* Sucessos */}
              {importResult.successDetails && importResult.successDetails.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Pacientes Importados ({importResult.successDetails.length})
                  </h3>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Linha</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>CPF</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.successDetails.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{item.row}</TableCell>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell>{item.cpf}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Erros */}
              {importResult.errorDetails && importResult.errorDetails.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Erros na Importação ({importResult.errorDetails.length})
                  </h3>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Linha</TableHead>
                          <TableHead>Erro</TableHead>
                          <TableHead>Dados</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.errorDetails.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{item.row}</TableCell>
                            <TableCell className="text-red-600">{item.error}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {item.data?.nome || "-"} | {item.data?.cpf || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <Button onClick={() => setLocation(`/tenant/${tenantId}/patients`)}>
                  Voltar para Pacientes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setImportResult(null);
                  }}
                >
                  Importar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
