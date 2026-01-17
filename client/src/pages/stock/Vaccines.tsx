import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Syringe, Plus, Search, Edit, Trash2, AlertTriangle, Package, Calendar, Barcode, ArrowRightLeft } from 'lucide-react';
import { VaccineFormDialog } from '@/components/VaccineFormDialog';
import { StockTransferDialog } from '@/components/StockTransferDialog';
import { toast } from 'sonner';
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Vaccines() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRefrigerator, setSelectedRefrigerator] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVaccineId, setEditingVaccineId] = useState<number | undefined>();
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // Buscar geladeiras para o filtro
  const { data: refrigerators } = trpc.refrigerators.list.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );

  // Buscar vacinas (usando o endpoint de vaccines que já existe)
  const { data: vaccines, isLoading, refetch } = trpc.vaccines.list.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );

  // Deletar vacina
  const deleteMutation = trpc.vaccines.delete.useMutation({
    onSuccess: () => {
      toast.success('Vacina excluída com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir vacina: ${error.message}`);
    },
  });

  const handleDelete = (vaccineId: number, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a vacina "${nome}"?`)) {
      deleteMutation.mutate({ id: vaccineId, tenantId });
    }
  };

  // Função para calcular dias até vencimento
  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Função para determinar status da vacina
  const getVaccineStatus = (vaccine: any): string => {
    const daysUntilExpiry = getDaysUntilExpiry(vaccine.dataValidade);
    
    if (daysUntilExpiry !== null && daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry !== null && daysUntilExpiry <= 30) return 'expiring';
    if (vaccine.quantidadeEstoque <= 0) return 'out_of_stock';
    if (vaccine.quantidadeEstoque <= 10) return 'low_stock';
    return 'ok';
  };

  // Filtrar vacinas
  const filteredVaccines = vaccines?.filter((vaccine) => {
    const matchesSearch = 
      vaccine.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccine.lote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccine.codigoBarras?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccine.fabricante?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRefrigerator = selectedRefrigerator === 'all' || 
      vaccine.refrigeratorId === parseInt(selectedRefrigerator);
    
    const status = getVaccineStatus(vaccine);
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'alert' && (status === 'expiring' || status === 'low_stock' || status === 'expired' || status === 'out_of_stock')) ||
      (statusFilter === 'ok' && status === 'ok');
    
    return matchesSearch && matchesRefrigerator && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Syringe className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando vacinas...</p>
        </div>
      </div>
    );
  }

  return (
    <TenantLayout>
      <div className="p-8">
        <Breadcrumbs 
          items={[
            { label: 'Início', href: `/tenant/${tenantId}/dashboard` },
            { label: 'Vacinas' }
          ]}
          tenantId={tenantId}
        />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vacinas</h1>
              <p className="text-gray-600 mt-1">
                Controle de estoque e gerenciamento de vacinas
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/tenant/${tenantId}/stock`}>
                <Button variant="outline">Voltar</Button>
              </Link>
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setTransferDialogOpen(true)}
              >
                <ArrowRightLeft className="h-4 w-4" />
                Transferir Estoque
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setEditingVaccineId(undefined);
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nova Vacina
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar e Filtrar</CardTitle>
            <CardDescription>
              Pesquise por nome, código de barras, lote ou fabricante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedRefrigerator} onValueChange={setSelectedRefrigerator}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as geladeiras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as geladeiras</SelectItem>
                  {refrigerators?.map((refrig) => (
                    <SelectItem key={refrig.id} value={refrig.id.toString()}>
                      {refrig.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ok">Estoque OK</SelectItem>
                  <SelectItem value="alert">Com Alertas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Vacinas */}
        {filteredVaccines && filteredVaccines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVaccines.map((vaccine: any) => {
              const status = getVaccineStatus(vaccine);
              const daysUntilExpiry = getDaysUntilExpiry(vaccine.dataValidade);
              const refrigerator = refrigerators?.find(r => r.id === vaccine.refrigeratorId);

              return (
                <Card key={vaccine.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          status === 'ok' ? 'bg-green-100' :
                          status === 'low_stock' ? 'bg-yellow-100' :
                          status === 'expiring' ? 'bg-orange-100' :
                          'bg-red-100'
                        }`}>
                          <Syringe className={`h-6 w-6 ${
                            status === 'ok' ? 'text-green-600' :
                            status === 'low_stock' ? 'text-yellow-600' :
                            status === 'expiring' ? 'text-orange-600' :
                            'text-red-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{vaccine.nome}</CardTitle>
                          {vaccine.fabricante && (
                            <p className="text-sm text-gray-600 truncate">{vaccine.fabricante}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Alertas */}
                      <div className="flex flex-wrap gap-2">
                        {status === 'expired' && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Vencida
                          </Badge>
                        )}
                        {status === 'expiring' && (
                          <Badge className="bg-orange-500 hover:bg-orange-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Vence em {daysUntilExpiry} dias
                          </Badge>
                        )}
                        {status === 'out_of_stock' && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Sem estoque
                          </Badge>
                        )}
                        {status === 'low_stock' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Estoque baixo
                          </Badge>
                        )}
                      </div>

                      {/* Estoque */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-semibold">Estoque</span>
                        </div>
                        <span className={`text-lg font-bold ${
                          vaccine.quantidadeEstoque <= 0 ? 'text-red-600' :
                          vaccine.quantidadeEstoque <= 10 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {vaccine.quantidadeEstoque} doses
                        </span>
                      </div>

                      {/* Informações */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {vaccine.lote && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Lote:</span>
                            <span>{vaccine.lote}</span>
                          </div>
                        )}
                        
                        {vaccine.dataValidade && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Validade: {new Date(vaccine.dataValidade).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}

                        {vaccine.codigoBarras && (
                          <div className="flex items-center gap-2">
                            <Barcode className="h-4 w-4" />
                            <span className="truncate">{vaccine.codigoBarras}</span>
                          </div>
                        )}

                        {refrigerator && (
                          <div className="text-xs text-gray-500">
                            📦 {refrigerator.nome}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setEditingVaccineId(vaccine.id);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(vaccine.id, vaccine.nome)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Syringe className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma vacina encontrada
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {searchTerm || selectedRefrigerator !== 'all' || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece cadastrando sua primeira vacina'}
              </p>
              <Button onClick={() => {
                setEditingVaccineId(undefined);
                setDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Vacina
              </Button>
            </CardContent>
          </Card>        )}
      </div>

      {/* Modal de CRUD */}
      <VaccineFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenantId={tenantId}
        vaccineId={editingVaccineId}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Modal de Transferência */}
      <StockTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        tenantId={tenantId}
        onSuccess={() => {
          refetch();
        }}
      />
      </div>
    </TenantLayout>
  );
}
