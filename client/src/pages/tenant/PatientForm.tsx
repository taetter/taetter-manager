import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientSearchCombobox } from "@/components/PatientSearchCombobox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Upload, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PatientForm() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const tenantId = parseInt(params.id || "1");

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    sexo: "" as "M" | "F" | "Outro" | "",
    nomeMae: "",
    nomePai: "",
    email: "",
    telefone: "",
    celular: "",
    telefoneResponsavel: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    cartaoSus: "",
    observacoes: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploadedPhoto, setUploadedPhoto] = useState<{ url: string; key: string } | null>(null);
  const [cpfToCheck, setCpfToCheck] = useState<string>("");

  // Verificar CPF duplicado com debounce
  const { data: cpfCheck } = trpc.patients.checkCpf.useQuery(
    {
      tenantId,
      cpf: cpfToCheck,
    },
    {
      enabled: cpfToCheck.length === 14, // Só verifica quando CPF está completo
    }
  );

  const createMutation = trpc.patients.create.useMutation({
    onSuccess: () => {
      toast.success("Paciente cadastrado com sucesso!");
      setLocation(`/tenant/${tenantId}/patients`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar paciente");
    },
  });

  const uploadMutation = trpc.upload.uploadPatientPhoto.useMutation({
    onSuccess: (data) => {
      setUploadedPhoto({ url: data.url, key: data.key });
      toast.success("Foto enviada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar foto");
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Tamanho máximo: 5MB");
      return;
    }

    setPhotoFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!photoFile || !photoPreview) return;

    uploadMutation.mutate({
      fileName: photoFile.name,
      fileData: photoPreview,
      mimeType: photoFile.type,
      tenantId,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.nome || !formData.cpf || !formData.dataNascimento) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    // Verificar CPF duplicado
    if (cpfCheck?.exists) {
      toast.error("Este CPF já está cadastrado. Visualize o paciente existente ou use outro CPF.");
      return;
    }

    createMutation.mutate({
      ...formData,
      dataNascimento: new Date(formData.dataNascimento),
      sexo: formData.sexo || undefined,
      fotoUrl: uploadedPhoto?.url,
      fotoKey: uploadedPhoto?.key,
    });
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        endereco: data.logradouro || prev.endereco,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));

      toast.success("Endereço preenchido automaticamente");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatCep = (value: string) => {
    return value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/tenant/${tenantId}/patients`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cadastrar Paciente</CardTitle>
            <CardDescription>Preencha os dados do paciente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Foto */}
              <div className="space-y-2">
                <Label>Foto do Paciente</Label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="max-w-xs"
                    />
                    {photoFile && !uploadedPhoto && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleUploadPhoto}
                        disabled={uploadMutation.isPending}
                      >
                        {uploadMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Enviar Foto
                          </>
                        )}
                      </Button>
                    )}
                    {uploadedPhoto && (
                      <p className="text-sm text-green-600">Foto enviada com sucesso!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => {
                        const formatted = formatCpf(e.target.value);
                        setFormData({ ...formData, cpf: formatted });
                        setCpfToCheck(formatted);
                      }}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className={cpfCheck?.exists ? "border-red-500" : ""}
                      required
                    />
                    {cpfCheck?.exists && cpfCheck.patient && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">
                              CPF já cadastrado!
                            </p>
                            <p className="text-sm text-red-700 mt-1">
                              Paciente: <strong>{cpfCheck.patient.nome}</strong>
                            </p>
                            {cpfCheck.patient.dataNascimento && (
                              <p className="text-xs text-red-600 mt-0.5">
                                Nasc: {new Date(cpfCheck.patient.dataNascimento).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLocation(`/tenant/${tenantId}/patients/${cpfCheck.patient.id}`);
                            }}
                            className="shrink-0"
                          >
                            Visualizar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) =>
                        setFormData({ ...formData, dataNascimento: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select
                      value={formData.sexo}
                      onValueChange={(value: "M" | "F" | "Outro") =>
                        setFormData({ ...formData, sexo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeMae">Nome da Mãe</Label>
                    <PatientSearchCombobox
                      tenantId={tenantId}
                      value={formData.nomeMae}
                      onChange={(value) => setFormData({ ...formData, nomeMae: value })}
                      placeholder="Buscar ou digitar nome da mãe"
                    />
                    <p className="text-xs text-muted-foreground">
                      Busque um paciente existente ou digite manualmente
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomePai">Nome do Pai</Label>
                    <PatientSearchCombobox
                      tenantId={tenantId}
                      value={formData.nomePai}
                      onChange={(value) => setFormData({ ...formData, nomePai: value })}
                      placeholder="Buscar ou digitar nome do pai"
                    />
                    <p className="text-xs text-muted-foreground">
                      Busque um paciente existente ou digite manualmente
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cartaoSus">Cartão SUS</Label>
                    <Input
                      id="cartaoSus"
                      value={formData.cartaoSus}
                      onChange={(e) => setFormData({ ...formData, cartaoSus: e.target.value })}
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: formatPhone(e.target.value) })
                      }
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={formData.celular}
                      onChange={(e) =>
                        setFormData({ ...formData, celular: formatPhone(e.target.value) })
                      }
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefoneResponsavel">Telefone do Responsável</Label>
                    <Input
                      id="telefoneResponsavel"
                      value={formData.telefoneResponsavel}
                      onChange={(e) =>
                        setFormData({ ...formData, telefoneResponsavel: formatPhone(e.target.value) })
                      }
                      placeholder="(00) 00000-0000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Para pacientes menores de idade
                    </p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => setFormData({ ...formData, cep: formatCep(e.target.value) })}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCepBlur}
                        disabled={formData.cep.replace(/\D/g, "").length !== 8}
                      >
                        Buscar CEP
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) =>
                        setFormData({ ...formData, estado: e.target.value.toUpperCase() })
                      }
                      maxLength={2}
                      placeholder="SP"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/tenant/${tenantId}/patients`)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Cadastrar Paciente"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
