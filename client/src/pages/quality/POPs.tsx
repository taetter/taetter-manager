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
import { FileText, Plus, Upload, Download, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast as showToast } from 'sonner';

export default function POPs() {
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
    codigo: '',
    titulo: '',
    versao: '',
    objetivo: '',
    aplicacao: '',
    responsavel: '',
    procedimento: '',
    dataElaboracao: new Date().toISOString().split('T')[0],
    dataRevisao: '',
    proximaRevisao: '',
    status: 'ativo' as 'ativo' | 'revisao' | 'obsoleto',
  });

  // Buscar POPs
  const { data: pops, isLoading, refetch } = trpc.quality.pops.list.useQuery({
    tenantId,
  });

  // Mutation para criar POP
  const createPOP = trpc.quality.pops.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'POP criado com sucesso',
        description: 'O procedimento foi registrado no sistema',
      });
      setIsDialogOpen(false);
      refetch();
      // Reset form
      setFormData({
        codigo: '',
        titulo: '',
        versao: '',
        objetivo: '',
        aplicacao: '',
        responsavel: '',
        procedimento: '',
        dataElaboracao: new Date().toISOString().split('T')[0],
        dataRevisao: '',
        proximaRevisao: '',
        status: 'ativo',
      });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar POP',
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

    // TODO: Upload file to S3 first
    let arquivoUrl = '';
    if (selectedFile) {
      // Placeholder - implementar upload real
      arquivoUrl = `/uploads/pops/${formData.codigo}-v${formData.versao}.pdf`;
    }

    createPOP.mutate({
      tenantId,
      ...formData,
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ativo: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Ativo' },
      revisao: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Em Revisão' },
      obsoleto: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Obsoleto' },
    };
    const badge = badges[status as keyof typeof badges] || badges.ativo;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">POPs</h1>
              <p className="text-gray-600 mt-1">
                Procedimentos Operacionais Padrão
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
                    Novo POP
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo POP</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do Procedimento Operacional Padrão
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="codigo">Código *</Label>
                        <Input
                          id="codigo"
                          value={formData.codigo}
                          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                          placeholder="POP-001"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="versao">Versão *</Label>
                        <Input
                          id="versao"
                          value={formData.versao}
                          onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
                          placeholder="1.0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        placeholder="Ex: Procedimento de Aplicação de Vacinas"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="objetivo">Objetivo *</Label>
                      <Textarea
                        id="objetivo"
                        value={formData.objetivo}
                        onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                        placeholder="Descreva o objetivo do procedimento"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="aplicacao">Aplicação</Label>
                      <Textarea
                        id="aplicacao"
                        value={formData.aplicacao}
                        onChange={(e) => setFormData({ ...formData, aplicacao: e.target.value })}
                        placeholder="Onde e quando este procedimento se aplica"
                      />
                    </div>

                    <div>
                      <Label htmlFor="responsavel">Responsável</Label>
                      <Input
                        id="responsavel"
                        value={formData.responsavel}
                        onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                        placeholder="Nome do responsável pelo POP"
                      />
                    </div>

                    <div>
                      <Label htmlFor="procedimento">Procedimento *</Label>
                      <Textarea
                        id="procedimento"
                        value={formData.procedimento}
                        onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                        placeholder="Descreva passo a passo o procedimento"
                        rows={6}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="dataElaboracao">Data de Elaboração *</Label>
                        <Input
                          id="dataElaboracao"
                          type="date"
                          value={formData.dataElaboracao}
                          onChange={(e) => setFormData({ ...formData, dataElaboracao: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataRevisao">Data de Revisão</Label>
                        <Input
                          id="dataRevisao"
                          type="date"
                          value={formData.dataRevisao}
                          onChange={(e) => setFormData({ ...formData, dataRevisao: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="proximaRevisao">Próxima Revisão</Label>
                        <Input
                          id="proximaRevisao"
                          type="date"
                          value={formData.proximaRevisao}
                          onChange={(e) => setFormData({ ...formData, proximaRevisao: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'ativo' | 'revisao' | 'obsoleto') =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="revisao">Em Revisão</SelectItem>
                          <SelectItem value="obsoleto">Obsoleto</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Button type="submit" disabled={createPOP.isPending}>
                        {createPOP.isPending ? 'Salvando...' : 'Salvar POP'}
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
        {/* Lista de POPs */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando POPs...</p>
          </div>
        ) : pops && pops.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pops.map((pop) => (
              <Card key={pop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {pop.codigo}
                        </span>
                        <span className="text-sm text-gray-600">v{pop.versao}</span>
                        {getStatusBadge(pop.status)}
                      </div>
                      <CardTitle className="text-xl">{pop.titulo}</CardTitle>
                      <CardDescription className="mt-2">{pop.objetivo}</CardDescription>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Elaboração</p>
                      <p className="font-medium">
                        {pop.dataElaboracao ? new Date(pop.dataElaboracao).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Última Revisão</p>
                      <p className="font-medium">
                        {pop.dataRevisao ? new Date(pop.dataRevisao).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Próxima Revisão</p>
                      <p className="font-medium">
                        {pop.proximaRevisao ? new Date(pop.proximaRevisao).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Responsável</p>
                      <p className="font-medium">{pop.responsavel || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    {pop.arquivoUrl && (
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
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum POP cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando seu primeiro Procedimento Operacional Padrão
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro POP
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
