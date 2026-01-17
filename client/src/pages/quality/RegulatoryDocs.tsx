import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { Shield, Plus, Download, Eye, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { toast as showToast } from 'sonner';

export default function RegulatoryDocs() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const toast = (props: { title: string; description?: string; variant?: 'destructive' }) => {
    if (props.variant === 'destructive') {
      showToast.error(props.title, { description: props.description });
    } else {
      showToast.success(props.title, { description: props.description });
    }
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tipo: 'alvara' as 'alvara' | 'licenca' | 'certificado' | 'laudo' | 'protocolo' | 'outro',
    numero: '',
    orgaoEmissor: '',
    titulo: '',
    descricao: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataValidade: '',
  });

  // Buscar documentos
  const { data: docs, isLoading, refetch } = trpc.quality.regulatoryDocs.list.useQuery({
    tenantId,
  });

  // Mutation para criar documento
  const createDoc = trpc.quality.regulatoryDocs.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Documento criado com sucesso',
        description: 'O documento regulatório foi registrado no sistema',
      });
      setIsDialogOpen(false);
      refetch();
      // Reset form
      setFormData({
        tipo: 'alvara',
        numero: '',
        orgaoEmissor: '',
        titulo: '',
        descricao: '',
        dataEmissao: new Date().toISOString().split('T')[0],
        dataValidade: '',
      });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Formato inválido',
          description: 'Apenas arquivos PDF são permitidos',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 10MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createDoc.mutate({
      tenantId,
      ...formData,
    });
  };

  const getStatusBadge = (doc: any) => {
    const hoje = new Date();
    const validade = doc.dataValidade ? new Date(doc.dataValidade) : null;
    
    if (!validade) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
          <Clock className="h-3 w-3" />
          Sem validade
        </span>
      );
    }

    const diasRestantes = Math.floor((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50">
          <XCircle className="h-3 w-3" />
          Vencido
        </span>
      );
    } else if (diasRestantes <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-50">
          <AlertCircle className="h-3 w-3" />
          Vence em {diasRestantes} dias
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
          <CheckCircle className="h-3 w-3" />
          Válido
        </span>
      );
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      alvara: 'Alvará',
      licenca: 'Licença',
      certificado: 'Certificado',
      laudo: 'Laudo',
      protocolo: 'Protocolo',
      outro: 'Outro',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentação Regulatória</h1>
              <p className="text-gray-600 mt-1">
                Alvarás, Licenças e Certificados
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/tenant/${tenantId}/quality`}>
                <Button variant="outline">Voltar</Button>
              </Link>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Documento Regulatório</DialogTitle>
                    <DialogDescription>
                      Registre alvarás, licenças, certificados e outros documentos
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipo">Tipo de Documento *</Label>
                        <Select
                          value={formData.tipo}
                          onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alvara">Alvará</SelectItem>
                            <SelectItem value="licenca">Licença</SelectItem>
                            <SelectItem value="certificado">Certificado</SelectItem>
                            <SelectItem value="laudo">Laudo</SelectItem>
                            <SelectItem value="protocolo">Protocolo</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="numero">Número do Documento *</Label>
                        <Input
                          id="numero"
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          placeholder="Ex: 12345/2024"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="orgaoEmissor">Órgão Emissor *</Label>
                      <Input
                        id="orgaoEmissor"
                        value={formData.orgaoEmissor}
                        onChange={(e) => setFormData({ ...formData, orgaoEmissor: e.target.value })}
                        placeholder="Ex: ANVISA, Vigilância Sanitária Municipal"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        placeholder="Ex: Licença Sanitária para Funcionamento"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Detalhes adicionais sobre o documento"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataEmissao">Data de Emissão *</Label>
                        <Input
                          id="dataEmissao"
                          type="date"
                          value={formData.dataEmissao}
                          onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataValidade">Data de Validade</Label>
                        <Input
                          id="dataValidade"
                          type="date"
                          value={formData.dataValidade}
                          onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="arquivo">Arquivo PDF (Opcional)</Label>
                      <div className="mt-2">
                        <Input
                          id="arquivo"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                        {selectedFile && (
                          <p className="text-sm text-gray-600 mt-2">
                            Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Apenas arquivos PDF. Tamanho máximo: 10MB
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createDoc.isPending}>
                        {createDoc.isPending ? 'Salvando...' : 'Salvar Documento'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Lista de Documentos */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando documentos...</p>
          </div>
        ) : docs && docs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {docs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {getTipoLabel(doc.tipo)}
                        </span>
                        <span className="text-sm font-mono text-gray-600">{doc.numero}</span>
                        {getStatusBadge(doc)}
                      </div>
                      <CardTitle className="text-xl">{doc.titulo}</CardTitle>
                      <CardDescription className="mt-2">
                        Emitido por: {doc.orgaoEmissor}
                      </CardDescription>
                      {doc.descricao && (
                        <p className="text-sm text-gray-600 mt-2">{doc.descricao}</p>
                      )}
                    </div>
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Data de Emissão</p>
                      <p className="font-medium">
                        {doc.dataEmissao ? new Date(doc.dataEmissao).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Data de Validade</p>
                      <p className="font-medium">
                        {doc.dataValidade ? new Date(doc.dataValidade).toLocaleDateString('pt-BR') : 'Indeterminada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium">{doc.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    {doc.arquivoUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum documento cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece registrando seus alvarás, licenças e certificados
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Documento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
