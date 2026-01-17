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
import { ClipboardCheck, Plus, Eye, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { toast as showToast } from 'sonner';
import { getChecklistByType } from '@/data/auditChecklists';

export default function Audits() {
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
  const [selectedTipo, setSelectedTipo] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    tipo: 'vigilancia_sanitaria' as 'vigilancia_sanitaria' | 'acreditacao' | 'interna' | 'fornecedor' | 'outro',
    titulo: '',
    descricao: '',
    dataPrevista: '',
  });

  // Buscar auditorias
  const { data: audits, isLoading, refetch } = trpc.quality.audits.list.useQuery({
    tenantId,
  });

  // Mutation para criar auditoria
  const createAudit = trpc.quality.audits.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Auditoria criada com sucesso',
        description: 'O checklist foi gerado automaticamente',
      });
      setIsDialogOpen(false);
      refetch();
      // Reset form
      setFormData({
        tipo: 'vigilancia_sanitaria',
        titulo: '',
        descricao: '',
        dataPrevista: '',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar auditoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createAudit.mutate({
      tenantId,
      ...formData,
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pendente: { icon: Clock, color: 'text-gray-600 bg-gray-50', label: 'Pendente' },
      em_andamento: { icon: AlertCircle, color: 'text-blue-600 bg-blue-50', label: 'Em Andamento' },
      concluida: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Concluída' },
      aprovada: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Aprovada' },
      reprovada: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Reprovada' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pendente;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      vigilancia_sanitaria: 'Vigilância Sanitária',
      acreditacao: 'Acreditação (ISO/ONA)',
      interna: 'Auditoria Interna',
      fornecedor: 'Auditoria de Fornecedor',
      outro: 'Outro',
    };
    return labels[tipo] || tipo;
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo === 'vigilancia_sanitaria') return '🏥';
    if (tipo === 'acreditacao') return '🏆';
    if (tipo === 'interna') return '📋';
    if (tipo === 'fornecedor') return '🤝';
    return '📝';
  };

  const handleTipoChange = (value: string) => {
    setFormData({ ...formData, tipo: value as any });
    
    // Sugerir título baseado no tipo
    if (value === 'vigilancia_sanitaria') {
      setFormData(prev => ({ ...prev, tipo: value as any, titulo: 'Inspeção Sanitária - Sala de Vacinação' }));
    } else if (value === 'acreditacao') {
      setFormData(prev => ({ ...prev, tipo: value as any, titulo: 'Auditoria de Certificação ISO 9001:2015' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Auditorias</h1>
              <p className="text-gray-600 mt-1">
                Checklists e Avaliações de Conformidade
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
                    Nova Auditoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Agendar Auditoria</DialogTitle>
                    <DialogDescription>
                      O checklist será gerado automaticamente baseado no tipo de auditoria
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="tipo">Tipo de Auditoria *</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={handleTipoChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vigilancia_sanitaria">
                            🏥 Vigilância Sanitária
                          </SelectItem>
                          <SelectItem value="acreditacao">
                            🏆 Acreditação (ISO/ONA)
                          </SelectItem>
                          <SelectItem value="interna">
                            📋 Auditoria Interna
                          </SelectItem>
                          <SelectItem value="fornecedor">
                            🤝 Auditoria de Fornecedor
                          </SelectItem>
                          <SelectItem value="outro">
                            📝 Outro
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.tipo === 'vigilancia_sanitaria' && (
                        <p className="text-xs text-blue-600 mt-2">
                          ✓ Checklist completo de Vigilância Sanitária será gerado (RDC 50/2002)
                        </p>
                      )}
                      {formData.tipo === 'acreditacao' && (
                        <p className="text-xs text-blue-600 mt-2">
                          ✓ Checklists de ISO 9001:2015 e ONA disponíveis
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        placeholder="Ex: Inspeção Sanitária - Sala de Vacinação"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Detalhes sobre a auditoria"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dataPrevista">Data Prevista</Label>
                      <Input
                        id="dataPrevista"
                        type="date"
                        value={formData.dataPrevista}
                        onChange={(e) => setFormData({ ...formData, dataPrevista: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createAudit.isPending}>
                        {createAudit.isPending ? 'Criando...' : 'Criar Auditoria'}
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
        {/* Tipos de Checklist Disponíveis */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Checklists Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🏥 Vigilância Sanitária
                </CardTitle>
                <CardDescription>
                  Checklist completo baseado em RDC 50/2002 e normas da ANVISA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  <strong>6 categorias</strong> incluindo estrutura física, equipamentos, RH, documentação, processos e segurança do paciente
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🏆 ISO 9001:2015
                </CardTitle>
                <CardDescription>
                  Checklist completo para certificação ISO 9001:2015
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  <strong>7 cláusulas</strong> cobrindo contexto, liderança, planejamento, apoio, operação, avaliação e melhoria
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🏆 ONA
                </CardTitle>
                <CardDescription>
                  Checklist para Acreditação ONA (3 níveis)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  <strong>3 níveis</strong> - Segurança (Estrutura), Gestão Integrada (Processo) e Excelência (Resultado)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de Auditorias */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando auditorias...</p>
          </div>
        ) : audits && audits.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {audits.map((audit) => (
              <Card key={audit.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTipoIcon(audit.tipo)}</span>
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {getTipoLabel(audit.tipo)}
                        </span>
                        {getStatusBadge(audit.status)}
                      </div>
                      <CardTitle className="text-xl">{audit.titulo}</CardTitle>
                      {audit.descricao && (
                        <CardDescription className="mt-2">{audit.descricao}</CardDescription>
                      )}
                    </div>
                    <ClipboardCheck className="h-8 w-8 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Data Prevista</p>
                      <p className="font-medium">
                        {audit.dataPrevista ? new Date(audit.dataPrevista).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Data Realização</p>
                      <p className="font-medium">
                        {audit.dataRealizacao ? new Date(audit.dataRealizacao).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Auditor</p>
                      <p className="font-medium">{audit.auditor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pontuação</p>
                      <p className="font-medium">
                        {audit.pontuacao !== null && audit.pontuacaoMaxima !== null
                          ? `${audit.pontuacao}/${audit.pontuacaoMaxima}`
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Checklist
                    </Button>
                    {audit.relatorioUrl && (
                      <Button variant="outline" size="sm">
                        Download Relatório
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
              <ClipboardCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma auditoria agendada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando sua primeira auditoria com checklist automático
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Auditoria
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
