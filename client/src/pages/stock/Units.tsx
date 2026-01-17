import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Plus, Search, Edit, Trash2, MapPin, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Units() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar unidades
  const { data: units, isLoading, refetch } = trpc.units.list.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );

  // Deletar unidade
  const deleteMutation = trpc.units.delete.useMutation({
    onSuccess: () => {
      toast.success('Unidade excluída com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir unidade: ${error.message}`);
    },
  });

  const handleDelete = (unitId: number, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a unidade "${nome}"?`)) {
      deleteMutation.mutate({ id: unitId, tenantId });
    }
  };

  // Filtrar unidades
  const filteredUnits = units?.filter((unit) =>
    unit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando unidades...</p>
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
            { label: 'Unidades' }
          ]}
          tenantId={tenantId}
        />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Unidades</h1>
              <p className="text-gray-600 mt-1">
                Gerenciar unidades de atendimento
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/tenant/${tenantId}/stock`}>
                <Button variant="outline">Voltar</Button>
              </Link>
              <Link href={`/tenant/${tenantId}/stock/units/new`}>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Unidade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Busca */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Unidades</CardTitle>
            <CardDescription>
              Pesquise por nome ou cidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite o nome da unidade ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Unidades */}
        {filteredUnits && filteredUnits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map((unit) => (
              <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {unit.imagemUrl ? (
                        <img
                          src={unit.imagemUrl}
                          alt={unit.nome}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{unit.nome}</CardTitle>
                        {!unit.ativo && (
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
                    {unit.endereco && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{unit.endereco}</p>
                          {unit.cidade && unit.estado && (
                            <p>{unit.cidade} - {unit.estado}</p>
                          )}
                          {unit.cep && <p>CEP: {unit.cep}</p>}
                        </div>
                      </div>
                    )}

                    {unit.telefone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{unit.telefone}</span>
                      </div>
                    )}

                    {unit.responsavelTecnico && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <div>
                          <p>{unit.responsavelTecnico}</p>
                          {unit.crmResponsavel && (
                            <p className="text-xs">CRM: {unit.crmResponsavel}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Link href={`/tenant/${tenantId}/stock/units/${unit.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(unit.id, unit.nome)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma unidade encontrada
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {searchTerm
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece cadastrando sua primeira unidade'}
              </p>
              <Link href={`/tenant/${tenantId}/stock/units/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Unidade
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </TenantLayout>
  );
}
