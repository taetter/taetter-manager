import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2, DollarSign, Tag, ArrowLeft, Star } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { toast } from "sonner";

export default function PriceTables() {
  const params = useParams();
  const tenantId = Number(params.id);
  const utils = trpc.useUtils();

  // Estado para controlar qual tabela está sendo visualizada
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  // Estados para Tabelas de Preços
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [tableForm, setTableForm] = useState({
    nome: "",
    descricao: "",
    padrao: false,
  });

  // Estados para Preços de Vacinas
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [priceForm, setPriceForm] = useState({
    vaccineId: "",
    preco: "",
    dataInicio: new Date().toISOString().split("T")[0],
    dataFim: "",
    ativo: true,
  });

  // Estados para Campanhas
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [campaignForm, setCampaignForm] = useState({
    nome: "",
    descricao: "",
    tipoDesconto: "percentual" as "percentual" | "valor_fixo",
    valorDesconto: "",
    vaccineIds: [] as number[],
    dataInicio: new Date().toISOString().split("T")[0],
    dataFim: "",
    ativo: true,
  });

  // Queries
  const { data: priceTables, isLoading: loadingTables } = trpc.priceTables.list.useQuery({ tenantId });
  const { data: prices, isLoading: loadingPrices } = trpc.vaccinePrices.list.useQuery(
    { tenantId },
    { enabled: selectedTableId !== null }
  );
  const { data: campaigns, isLoading: loadingCampaigns } = trpc.priceCampaigns.list.useQuery({ tenantId });
  const { data: vaccines } = trpc.vaccines.list.useQuery({ tenantId });

  // Filtrar preços pela tabela selecionada
  const filteredPrices = prices?.filter((p: any) => p.priceTableId === selectedTableId) || [];

  // Mutations - Tabelas de Preços
  const createTable = trpc.priceTables.create.useMutation({
    onSuccess: () => {
      utils.priceTables.list.invalidate();
      setTableDialogOpen(false);
      resetTableForm();
      toast.success("Tabela de preços criada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar tabela de preços");
    },
  });

  const updateTable = trpc.priceTables.update.useMutation({
    onSuccess: () => {
      utils.priceTables.list.invalidate();
      setTableDialogOpen(false);
      resetTableForm();
      toast.success("Tabela de preços atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar tabela de preços");
    },
  });

  const deleteTable = trpc.priceTables.delete.useMutation({
    onSuccess: () => {
      utils.priceTables.list.invalidate();
      setSelectedTableId(null);
      toast.success("Tabela de preços excluída com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir tabela de preços");
    },
  });

  const setAsDefaultTable = trpc.priceTables.setAsDefault.useMutation({
    onSuccess: () => {
      utils.priceTables.list.invalidate();
      toast.success("Tabela definida como padrão!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao definir tabela como padrão");
    },
  });

  // Mutations - Preços de Vacinas
  const createPrice = trpc.vaccinePrices.create.useMutation({
    onSuccess: () => {
      utils.vaccinePrices.list.invalidate();
      setPriceDialogOpen(false);
      resetPriceForm();
      toast.success("Preço cadastrado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar preço");
    },
  });

  const updatePrice = trpc.vaccinePrices.update.useMutation({
    onSuccess: () => {
      utils.vaccinePrices.list.invalidate();
      setPriceDialogOpen(false);
      resetPriceForm();
      toast.success("Preço atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar preço");
    },
  });

  const deletePrice = trpc.vaccinePrices.delete.useMutation({
    onSuccess: () => {
      utils.vaccinePrices.list.invalidate();
      toast.success("Preço excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir preço");
    },
  });

  // Mutations - Campanhas
  const createCampaign = trpc.priceCampaigns.create.useMutation({
    onSuccess: () => {
      utils.priceCampaigns.list.invalidate();
      setCampaignDialogOpen(false);
      resetCampaignForm();
      toast.success("Campanha criada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar campanha");
    },
  });

  const updateCampaign = trpc.priceCampaigns.update.useMutation({
    onSuccess: () => {
      utils.priceCampaigns.list.invalidate();
      setCampaignDialogOpen(false);
      resetCampaignForm();
      toast.success("Campanha atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar campanha");
    },
  });

  const deleteCampaign = trpc.priceCampaigns.delete.useMutation({
    onSuccess: () => {
      utils.priceCampaigns.list.invalidate();
      toast.success("Campanha excluída com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir campanha");
    },
  });

  // Handlers - Tabelas
  const resetTableForm = () => {
    setTableForm({ nome: "", descricao: "", padrao: false });
    setEditingTable(null);
  };

  const handleCreateTable = () => {
    if (!tableForm.nome.trim()) {
      toast.error("Nome da tabela é obrigatório");
      return;
    }

    createTable.mutate({
      tenantId,
      nome: tableForm.nome,
      descricao: tableForm.descricao || undefined,
      padrao: tableForm.padrao,
    });
  };

  const handleEditTable = (table: any) => {
    setEditingTable(table);
    setTableForm({
      nome: table.nome,
      descricao: table.descricao || "",
      padrao: table.padrao,
    });
    setTableDialogOpen(true);
  };

  const handleUpdateTable = () => {
    if (!editingTable) return;

    updateTable.mutate({
      id: editingTable.id,
      tenantId,
      nome: tableForm.nome,
      descricao: tableForm.descricao || undefined,
      padrao: tableForm.padrao,
    });
  };

  const handleDeleteTable = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta tabela de preços?")) {
      deleteTable.mutate({ id, tenantId });
    }
  };

  const handleSetAsDefault = (id: number) => {
    setAsDefaultTable.mutate({ id, tenantId });
  };

  // Handlers - Preços
  const resetPriceForm = () => {
    setPriceForm({
      vaccineId: "",
      preco: "",
      dataInicio: new Date().toISOString().split("T")[0],
      dataFim: "",
      ativo: true,
    });
    setEditingPrice(null);
  };

  const handleCreatePrice = () => {
    if (!selectedTableId) {
      toast.error("Selecione uma tabela de preços primeiro");
      return;
    }

    if (!priceForm.vaccineId || !priceForm.preco) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createPrice.mutate({
      tenantId,
      priceTableId: selectedTableId,
      vaccineId: Number(priceForm.vaccineId),
      preco: Math.round(parseFloat(priceForm.preco) * 100),
      dataInicio: priceForm.dataInicio,
      dataFim: priceForm.dataFim || undefined,
      ativo: priceForm.ativo,
    });
  };

  const handleEditPrice = (price: any) => {
    setEditingPrice(price);
    setPriceForm({
      vaccineId: price.vaccineId.toString(),
      preco: (price.preco / 100).toFixed(2),
      dataInicio: new Date(price.dataInicio).toISOString().split("T")[0],
      dataFim: price.dataFim ? new Date(price.dataFim).toISOString().split("T")[0] : "",
      ativo: price.ativo,
    });
    setPriceDialogOpen(true);
  };

  const handleUpdatePrice = () => {
    if (!editingPrice) return;

    updatePrice.mutate({
      id: editingPrice.id,
      tenantId,
      preco: Math.round(parseFloat(priceForm.preco) * 100),
      dataInicio: priceForm.dataInicio,
      dataFim: priceForm.dataFim || undefined,
      ativo: priceForm.ativo,
    });
  };

  const handleDeletePrice = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este preço?")) {
      deletePrice.mutate({ id, tenantId });
    }
  };

  // Handlers - Campanhas
  const resetCampaignForm = () => {
    setCampaignForm({
      nome: "",
      descricao: "",
      tipoDesconto: "percentual",
      valorDesconto: "",
      vaccineIds: [],
      dataInicio: new Date().toISOString().split("T")[0],
      dataFim: "",
      ativo: true,
    });
    setEditingCampaign(null);
  };

  const handleCreateCampaign = () => {
    if (!campaignForm.nome || !campaignForm.valorDesconto) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const valorDesconto =
      campaignForm.tipoDesconto === "percentual"
        ? parseInt(campaignForm.valorDesconto)
        : Math.round(parseFloat(campaignForm.valorDesconto) * 100);

    createCampaign.mutate({
      tenantId,
      nome: campaignForm.nome,
      descricao: campaignForm.descricao || undefined,
      tipoDesconto: campaignForm.tipoDesconto,
      valorDesconto,
      vaccineIds: campaignForm.vaccineIds.length > 0 ? campaignForm.vaccineIds : undefined,
      dataInicio: campaignForm.dataInicio,
      dataFim: campaignForm.dataFim || undefined,
      ativo: campaignForm.ativo,
    });
  };

  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      nome: campaign.nome,
      descricao: campaign.descricao || "",
      tipoDesconto: campaign.tipoDesconto,
      valorDesconto:
        campaign.tipoDesconto === "percentual"
          ? campaign.valorDesconto.toString()
          : (campaign.valorDesconto / 100).toFixed(2),
      vaccineIds: campaign.vaccineIds ? JSON.parse(campaign.vaccineIds) : [],
      dataInicio: new Date(campaign.dataInicio).toISOString().split("T")[0],
      dataFim: campaign.dataFim ? new Date(campaign.dataFim).toISOString().split("T")[0] : "",
      ativo: campaign.ativo,
    });
    setCampaignDialogOpen(true);
  };

  const handleUpdateCampaign = () => {
    if (!editingCampaign) return;

    const valorDesconto =
      campaignForm.tipoDesconto === "percentual"
        ? parseInt(campaignForm.valorDesconto)
        : Math.round(parseFloat(campaignForm.valorDesconto) * 100);

    updateCampaign.mutate({
      id: editingCampaign.id,
      tenantId,
      nome: campaignForm.nome,
      descricao: campaignForm.descricao || undefined,
      tipoDesconto: campaignForm.tipoDesconto,
      valorDesconto,
      vaccineIds: campaignForm.vaccineIds.length > 0 ? campaignForm.vaccineIds : undefined,
      dataInicio: campaignForm.dataInicio,
      dataFim: campaignForm.dataFim || undefined,
      ativo: campaignForm.ativo,
    });
  };

  const handleDeleteCampaign = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta campanha?")) {
      deleteCampaign.mutate({ id, tenantId });
    }
  };

  const handleToggleVaccine = (vaccineId: number) => {
    setCampaignForm((prev) => ({
      ...prev,
      vaccineIds: prev.vaccineIds.includes(vaccineId)
        ? prev.vaccineIds.filter((id) => id !== vaccineId)
        : [...prev.vaccineIds, vaccineId],
    }));
  };

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/tenant/${tenantId}`}>Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/tenant/${tenantId}/financial`}>Financeiro</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tabelas de Preços</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Tabelas de Preços</h1>
        <p className="text-slate-600 mt-2">Gerencie tabelas de preços e campanhas de desconto</p>
      </div>

      <Tabs defaultValue="tables" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tables">
            <DollarSign className="w-4 h-4 mr-2" />
            Tabelas de Preços
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Tag className="w-4 h-4 mr-2" />
            Campanhas de Desconto
          </TabsTrigger>
        </TabsList>

        {/* Aba de Tabelas de Preços */}
        <TabsContent value="tables" className="space-y-6">
          {selectedTableId === null ? (
            // Lista de Tabelas
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tabelas de Preços</CardTitle>
                    <CardDescription>
                      Crie tabelas de preços diferentes (Particular, Desconto, etc.)
                    </CardDescription>
                  </div>
                  <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetTableForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Tabela
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingTable ? "Editar Tabela de Preços" : "Nova Tabela de Preços"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingTable
                            ? "Atualize as informações da tabela de preços"
                            : "Crie uma nova tabela de preços (ex: Particular, 5% Desconto)"}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome da Tabela *</Label>
                          <Input
                            id="nome"
                            placeholder="Ex: Particular, 5% de Desconto, Familiares"
                            value={tableForm.nome}
                            onChange={(e) => setTableForm({ ...tableForm, nome: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="descricao">Descrição</Label>
                          <Textarea
                            id="descricao"
                            placeholder="Descrição opcional da tabela"
                            value={tableForm.descricao}
                            onChange={(e) => setTableForm({ ...tableForm, descricao: e.target.value })}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="padrao"
                            checked={tableForm.padrao}
                            onCheckedChange={(checked) =>
                              setTableForm({ ...tableForm, padrao: checked as boolean })
                            }
                          />
                          <Label htmlFor="padrao" className="cursor-pointer">
                            Definir como tabela padrão
                          </Label>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={editingTable ? handleUpdateTable : handleCreateTable}
                          disabled={createTable.isPending || updateTable.isPending}
                        >
                          {(createTable.isPending || updateTable.isPending) && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          {editingTable ? "Atualizar" : "Criar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTables ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : priceTables && priceTables.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {priceTables.map((table: any) => (
                      <Card
                        key={table.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedTableId(table.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {table.nome}
                                {table.padrao && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Padrão
                                  </Badge>
                                )}
                              </CardTitle>
                              {table.descricao && (
                                <CardDescription className="mt-2">{table.descricao}</CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge variant={table.ativo ? "default" : "secondary"}>
                              {table.ativo ? "Ativa" : "Inativa"}
                            </Badge>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              {!table.padrao && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSetAsDefault(table.id)}
                                  title="Definir como padrão"
                                >
                                  <Star className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditTable(table)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTable(table.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Nenhuma tabela de preços cadastrada</p>
                    <p className="text-sm mt-2">Clique em "Nova Tabela" para começar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Preços da Tabela Selecionada
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTableId(null)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <div>
                      <CardTitle>
                        {priceTables?.find((t: any) => t.id === selectedTableId)?.nome}
                      </CardTitle>
                      <CardDescription>Preços de vacinas nesta tabela</CardDescription>
                    </div>
                  </div>
                  <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetPriceForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Preço
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingPrice ? "Editar Preço" : "Adicionar Preço"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingPrice
                            ? "Atualize o preço da vacina"
                            : "Defina o preço de venda de uma vacina"}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="vaccineId">Vacina *</Label>
                          <Select
                            value={priceForm.vaccineId}
                            onValueChange={(value) =>
                              setPriceForm({ ...priceForm, vaccineId: value })
                            }
                            disabled={!!editingPrice}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a vacina" />
                            </SelectTrigger>
                            <SelectContent>
                              {vaccines?.map((vaccine: any) => (
                                <SelectItem key={vaccine.id} value={vaccine.id.toString()}>
                                  {vaccine.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="preco">Preço (R$) *</Label>
                          <Input
                            id="preco"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={priceForm.preco}
                            onChange={(e) => setPriceForm({ ...priceForm, preco: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dataInicio">Data Início *</Label>
                            <Input
                              id="dataInicio"
                              type="date"
                              value={priceForm.dataInicio}
                              onChange={(e) =>
                                setPriceForm({ ...priceForm, dataInicio: e.target.value })
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="dataFim">Data Fim</Label>
                            <Input
                              id="dataFim"
                              type="date"
                              value={priceForm.dataFim}
                              onChange={(e) =>
                                setPriceForm({ ...priceForm, dataFim: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ativo"
                            checked={priceForm.ativo}
                            onCheckedChange={(checked) =>
                              setPriceForm({ ...priceForm, ativo: checked as boolean })
                            }
                          />
                          <Label htmlFor="ativo" className="cursor-pointer">
                            Preço ativo
                          </Label>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPriceDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={editingPrice ? handleUpdatePrice : handleCreatePrice}
                          disabled={createPrice.isPending || updatePrice.isPending}
                        >
                          {(createPrice.isPending || updatePrice.isPending) && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          {editingPrice ? "Atualizar" : "Adicionar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPrices ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : filteredPrices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vacina</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Vigência</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrices.map((price: any) => (
                        <TableRow key={price.id}>
                          <TableCell className="font-medium">{price.vaccineName}</TableCell>
                          <TableCell>R$ {(price.preco / 100).toFixed(2)}</TableCell>
                          <TableCell>
                            {new Date(price.dataInicio).toLocaleDateString("pt-BR")}
                            {price.dataFim &&
                              ` - ${new Date(price.dataFim).toLocaleDateString("pt-BR")}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant={price.ativo ? "default" : "secondary"}>
                              {price.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditPrice(price)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeletePrice(price.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Nenhum preço cadastrado nesta tabela</p>
                    <p className="text-sm mt-2">Clique em "Adicionar Preço" para começar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba de Campanhas (mantida igual) */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campanhas de Desconto</CardTitle>
                  <CardDescription>
                    Crie campanhas de desconto temporárias para vacinas específicas
                  </CardDescription>
                </div>
                <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetCampaignForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Campanha
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCampaign ? "Editar Campanha" : "Nova Campanha de Desconto"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCampaign
                          ? "Atualize as informações da campanha"
                          : "Crie uma campanha de desconto temporária"}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="campanha-nome">Nome da Campanha *</Label>
                        <Input
                          id="campanha-nome"
                          placeholder="Ex: Black Friday 2024"
                          value={campaignForm.nome}
                          onChange={(e) =>
                            setCampaignForm({ ...campaignForm, nome: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="campanha-descricao">Descrição</Label>
                        <Textarea
                          id="campanha-descricao"
                          placeholder="Descrição opcional da campanha"
                          value={campaignForm.descricao}
                          onChange={(e) =>
                            setCampaignForm({ ...campaignForm, descricao: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tipoDesconto">Tipo de Desconto *</Label>
                          <Select
                            value={campaignForm.tipoDesconto}
                            onValueChange={(value: "percentual" | "valor_fixo") =>
                              setCampaignForm({ ...campaignForm, tipoDesconto: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentual">Percentual (%)</SelectItem>
                              <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="valorDesconto">
                            Valor do Desconto *{" "}
                            {campaignForm.tipoDesconto === "percentual" ? "(%)" : "(R$)"}
                          </Label>
                          <Input
                            id="valorDesconto"
                            type="number"
                            step={campaignForm.tipoDesconto === "percentual" ? "1" : "0.01"}
                            placeholder={campaignForm.tipoDesconto === "percentual" ? "10" : "50.00"}
                            value={campaignForm.valorDesconto}
                            onChange={(e) =>
                              setCampaignForm({ ...campaignForm, valorDesconto: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="campanha-dataInicio">Data Início *</Label>
                          <Input
                            id="campanha-dataInicio"
                            type="date"
                            value={campaignForm.dataInicio}
                            onChange={(e) =>
                              setCampaignForm({ ...campaignForm, dataInicio: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="campanha-dataFim">Data Fim</Label>
                          <Input
                            id="campanha-dataFim"
                            type="date"
                            value={campaignForm.dataFim}
                            onChange={(e) =>
                              setCampaignForm({ ...campaignForm, dataFim: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Vacinas Aplicáveis (deixe vazio para aplicar a todas)</Label>
                        <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-4 space-y-2">
                          {vaccines?.map((vaccine: any) => (
                            <div key={vaccine.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`vaccine-${vaccine.id}`}
                                checked={campaignForm.vaccineIds.includes(vaccine.id)}
                                onCheckedChange={() => handleToggleVaccine(vaccine.id)}
                              />
                              <Label
                                htmlFor={`vaccine-${vaccine.id}`}
                                className="cursor-pointer flex-1"
                              >
                                {vaccine.nome}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="campanha-ativo"
                          checked={campaignForm.ativo}
                          onCheckedChange={(checked) =>
                            setCampaignForm({ ...campaignForm, ativo: checked as boolean })
                          }
                        />
                        <Label htmlFor="campanha-ativo" className="cursor-pointer">
                          Campanha ativa
                        </Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
                        disabled={createCampaign.isPending || updateCampaign.isPending}
                      >
                        {(createCampaign.isPending || updateCampaign.isPending) && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {editingCampaign ? "Atualizar" : "Criar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCampaigns ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Vigência</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign: any) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.nome}</div>
                            {campaign.descricao && (
                              <div className="text-sm text-slate-500">{campaign.descricao}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {campaign.tipoDesconto === "percentual"
                            ? `${campaign.valorDesconto}%`
                            : `R$ ${(campaign.valorDesconto / 100).toFixed(2)}`}
                        </TableCell>
                        <TableCell>
                          {new Date(campaign.dataInicio).toLocaleDateString("pt-BR")}
                          {campaign.dataFim &&
                            ` - ${new Date(campaign.dataFim).toLocaleDateString("pt-BR")}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={campaign.ativo ? "default" : "secondary"}>
                            {campaign.ativo ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Nenhuma campanha cadastrada</p>
                  <p className="text-sm mt-2">Clique em "Nova Campanha" para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
