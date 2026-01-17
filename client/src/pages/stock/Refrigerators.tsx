import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { RefrigeratorFormDialog } from '@/components/RefrigeratorFormDialog';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Refrigerator, Plus, Search, Edit, Trash2, Thermometer, AlertTriangle, CheckCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Refrigerators() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRefrigeratorId, setSelectedRefrigeratorId] = useState<number | undefined>(undefined);

  // Buscar unidades para o filtro
  const { data: units } = trpc.units.list.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );

  // Buscar geladeiras
  const { data: refrigerators, isLoading, refetch } = trpc.refrigerators.list.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );

  // Deletar geladeira
  const deleteMutation = trpc.refrigerators.delete.useMutation({
    onSuccess: () => {
      toast.success('Geladeira excluída com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir geladeira: ${error.message}`);
    },
  });

  const handleDelete = (refrigeratorId: number, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a geladeira "${nome}"?`)) {
      deleteMutation.mutate({ id: refrigeratorId, tenantId });
    }
  };

  // Filtrar geladeiras
  const filteredRefrigerators = refrigerators?.filter((refrig) => {
    const matchesSearch = refrig.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refrig.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refrig.marca?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnit = selectedUnit === 'all' || refrig.unitId === parseInt(selectedUnit);
    
    return matchesSearch && matchesUnit;
  });

  // Função para determinar status da temperatura
  const getTemperatureStatus = (temp: string | null, min: string | null, max: string | null) => {
    if (!temp || !min || !max) return 'unknown';
    
    const tempNum = parseFloat(temp);
    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);
    
    if (tempNum < minNum || tempNum > maxNum) return 'danger';
    if (tempNum <= minNum + 1 || tempNum >= maxNum - 1) return 'warning';
    return 'ok';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Refrigerator className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando geladeiras...</p>
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
            { label: 'Geladeiras' }
          ]}
          tenantId={tenantId}
        />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Geladeiras</h1>
              <p className="text-gray-600 mt-1">
                Controle de geladeiras e monitoramento de temperatura
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/tenant/${tenantId}/stock`}>
                <Button variant="outline">Voltar</Button>
              </Link>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedRefrigeratorId(undefined);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nova Geladeira
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
              Pesquise por nome, modelo ou marca, e filtre por unidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite o nome, modelo ou marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Geladeiras */}
        {filteredRefrigerators && filteredRefrigerators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRefrigerators.map((refrig) => {
              const tempStatus = getTemperatureStatus(
                refrig.temperaturaAtual,
                refrig.temperaturaMin,
                refrig.temperaturaMax
              );
              
              const unit = units?.find(u => u.id === refrig.unitId);

              return (
                <Card key={refrig.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          tempStatus === 'ok' ? 'bg-green-100' :
                          tempStatus === 'warning' ? 'bg-yellow-100' :
                          tempStatus === 'danger' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          <Refrigerator className={`h-6 w-6 ${
                            tempStatus === 'ok' ? 'text-green-600' :
                            tempStatus === 'warning' ? 'text-yellow-600' :
                            tempStatus === 'danger' ? 'text-red-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{refrig.nome}</CardTitle>
                          {!refrig.ativo && (
                            <span className="text-xs text-red-600 font-semibold">
                              Inativa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Unidade */}
                      {unit && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="h-4 w-4" />
                          <span>{unit.nome}</span>
                        </div>
                      )}

                      {/* Modelo e Marca */}
                      {(refrig.modelo || refrig.marca) && (
                        <div className="text-sm text-gray-600">
                          {refrig.marca && <p className="font-semibold">{refrig.marca}</p>}
                          {refrig.modelo && <p>Modelo: {refrig.modelo}</p>}
                          {refrig.numeroSerie && (
                            <p className="text-xs">Série: {refrig.numeroSerie}</p>
                          )}
                        </div>
                      )}

                      {/* Temperatura */}
                      <div className={`p-3 rounded-lg ${
                        tempStatus === 'ok' ? 'bg-green-50 border border-green-200' :
                        tempStatus === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                        tempStatus === 'danger' ? 'bg-red-50 border border-red-200' :
                        'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Thermometer className={`h-4 w-4 ${
                              tempStatus === 'ok' ? 'text-green-600' :
                              tempStatus === 'warning' ? 'text-yellow-600' :
                              tempStatus === 'danger' ? 'text-red-600' :
                              'text-gray-600'
                            }`} />
                            <span className="text-sm font-semibold">Temperatura</span>
                          </div>
                          {tempStatus === 'ok' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {(tempStatus === 'warning' || tempStatus === 'danger') && (
                            <AlertTriangle className={`h-4 w-4 ${
                              tempStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          )}
                        </div>
                        
                        <div className="text-sm">
                          {refrig.temperaturaAtual ? (
                            <>
                              <p className="text-2xl font-bold">
                                {refrig.temperaturaAtual}°C
                              </p>
                              {refrig.temperaturaMin && refrig.temperaturaMax && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Faixa: {refrig.temperaturaMin}°C a {refrig.temperaturaMax}°C
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-500">Sem leitura</p>
                          )}
                        </div>
                      </div>

                      {/* Capacidade */}
                      {refrig.capacidadeLitros && (
                        <div className="text-sm text-gray-600">
                          <p>Capacidade: {refrig.capacidadeLitros}L</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedRefrigeratorId(refrig.id);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(refrig.id, refrig.nome)}
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
              <Refrigerator className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma geladeira encontrada
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {searchTerm || selectedUnit !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece cadastrando sua primeira geladeira'}
              </p>
              <Button
                onClick={() => {
                  setSelectedRefrigeratorId(undefined);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Geladeira
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <RefrigeratorFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tenantId={tenantId}
        refrigeratorId={selectedRefrigeratorId}
        onSuccess={() => {
          refetch();
        }}
      />
      </div>
    </TenantLayout>
  );
}
