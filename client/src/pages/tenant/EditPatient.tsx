import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, User, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditPatient() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const tenantId = parseInt(params.id || "0");
  const patientId = parseInt(params.patientId || "0");

  const { data: patient, isLoading: loadingPatient } = trpc.patients.getById.useQuery({
    id: patientId,
    tenantId,
  });

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

  // Preencher formulário quando paciente carregar
  useEffect(() => {
    if (patient) {
      setFormData({
        nome: patient.nome || "",
        cpf: patient.cpf || "",
        rg: patient.rg || "",
        dataNascimento: patient.dataNascimento
          ? new Date(patient.dataNascimento).toISOString().split("T")[0]
          : "",
        sexo: (patient.sexo as "M" | "F" | "Outro") || "",
        nomeMae: patient.nomeMae || "",
        nomePai: patient.nomePai || "",
        email: patient.email || "",
        telefone: patient.telefone || "",
        celular: patient.celular || "",
        endereco: patient.endereco || "",
        numero: patient.numero || "",
        complemento: patient.complemento || "",
        bairro: patient.bairro || "",
        cidade: patient.cidade || "",
        estado: patient.estado || "",
        cep: patient.cep || "",
        cartaoSus: patient.cartaoSus || "",
        observacoes: patient.observacoes || "",
      });

      if (patient.fotoUrl) {
        setPhotoPreview(patient.fotoUrl);
        setUploadedPhoto({ url: patient.fotoUrl, key: patient.fotoKey || "" });
      }
    }
  }, [patient]);

  const updateMutation = trpc.patients.update.useMutation({
    onSuccess: () => {
      toast.success("Paciente atualizado com sucesso!");
      setLocation(`/tenant/${tenantId}/patients/${patientId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar paciente");
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

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Tamanho máximo: 5MB");
      return;
    }

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!photoFile || !photoPreview) return;

    const base64 = photoPreview.split(",")[1];
    uploadMutation.mutate({
      fileName: photoFile.name,
      fileData: base64,
      mimeType: photoFile.type,
      tenantId,
      patientId,
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
      toast.error("Erro ao buscar CEP");
    }
  };

  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatCEP = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.cpf) {
      toast.error("Nome e CPF são obrigatórios");
      return;
    }

    if (!validateCPF(formData.cpf)) {
      toast.error("CPF inválido");
      return;
    }

    const updateData: any = {
      nome: formData.nome,
      cpf: formData.cpf,
    };

    if (formData.rg) updateData.rg = formData.rg;
    if (formData.dataNascimento) updateData.dataNascimento = new Date(formData.dataNascimento);
    if (formData.sexo) updateData.sexo = formData.sexo;
    if (formData.nomeMae) updateData.nomeMae = formData.nomeMae;
    if (formData.nomePai) updateData.nomePai = formData.nomePai;
    if (formData.email) updateData.email = formData.email;
    if (formData.telefone) updateData.telefone = formData.telefone;
    if (formData.celular) updateData.celular = formData.celular;
    if (formData.endereco) updateData.endereco = formData.endereco;
    if (formData.numero) updateData.numero = formData.numero;
    if (formData.complemento) updateData.complemento = formData.complemento;
    if (formData.bairro) updateData.bairro = formData.bairro;
    if (formData.cidade) updateData.cidade = formData.cidade;
    if (formData.estado) updateData.estado = formData.estado;
    if (formData.cep) updateData.cep = formData.cep;
    if (formData.cartaoSus) updateData.cartaoSus = formData.cartaoSus;
    if (formData.observacoes) updateData.observacoes = formData.observacoes;

    if (uploadedPhoto) {
      updateData.fotoUrl = uploadedPhoto.url;
      updateData.fotoKey = uploadedPhoto.key;
    }

    updateMutation.mutate({
      id: patientId,
      tenantId,
      data: updateData,
    });
  };

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Paciente não encontrado</p>
          <Button onClick={() => setLocation(`/tenant/${tenantId}/patients`)} className="mt-4">
            Voltar para Pacientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation(`/tenant/${tenantId}/patients/${patientId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a365d]">Editar Paciente</h1>
            <p className="text-muted-foreground">Atualize as informações do paciente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto */}
          <Card>
            <CardHeader>
              <CardTitle>Foto do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="photo">Selecionar Foto</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Tamanho máximo: 5MB. Formatos: JPG, PNG, GIF
                    </p>
                  </div>

                  {photoFile && !uploadedPhoto && (
                    <Button
                      type="button"
                      onClick={handleUploadPhoto}
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar Foto
                        </>
                      )}
                    </Button>
                  )}

                  {uploadedPhoto && (
                    <p className="text-sm text-green-600">✓ Foto enviada com sucesso</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) =>
                      setFormData({ ...formData, dataNascimento: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select
                    value={formData.sexo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sexo: value as "M" | "F" | "Outro" })
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

                <div>
                  <Label htmlFor="nomeMae">Nome da Mãe</Label>
                  <Input
                    id="nomeMae"
                    value={formData.nomeMae}
                    onChange={(e) => setFormData({ ...formData, nomeMae: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="nomePai">Nome do Pai</Label>
                  <Input
                    id="nomePai"
                    value={formData.nomePai}
                    onChange={(e) => setFormData({ ...formData, nomePai: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="cartaoSus">Cartão SUS</Label>
                  <Input
                    id="cartaoSus"
                    value={formData.cartaoSus}
                    onChange={(e) => setFormData({ ...formData, cartaoSus: e.target.value })}
                    maxLength={15}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 0000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: formatCEP(e.target.value) })}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="endereco">Logradouro</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value.toUpperCase() })
                    }
                    maxLength={2}
                    placeholder="UF"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={4}
                placeholder="Informações adicionais sobre o paciente..."
              />
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(`/tenant/${tenantId}/patients/${patientId}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
