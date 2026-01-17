import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface PatientData {
  id: number;
  tenantId: number;
  nome: string;
  cpf: string;
  rg: string | null;
  dataNascimento: Date;
  sexo: string | null;
  nomeMae: string | null;
  nomePai: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  cartaoSus: string | null;
  fotoUrl: string | null;
  primeiroAcesso: boolean | null;
}

interface PatientAuthContextType {
  patient: PatientData | null;
  token: string | null;
  isLoading: boolean;
  login: (tenantId: number, cpf: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

const TOKEN_KEY = "patient_token";

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [patient, setPatient] = useState<PatientData | null>(null);

  // Query para buscar dados do paciente
  const { data, isLoading, refetch } = trpc.patientAuth.me.useQuery(
    { token: token || "" },
    { enabled: !!token, retry: false }
  );

  // Mutation para login
  const loginMutation = trpc.patientAuth.login.useMutation();

  // Mutation para logout
  const logoutMutation = trpc.patientAuth.logout.useMutation();

  // Atualizar dados do paciente quando a query retornar
  useEffect(() => {
    if (data) {
      setPatient(data);
    }
  }, [data]);

  const login = async (tenantId: number, cpf: string, senha: string) => {
    const result = await loginMutation.mutateAsync({ tenantId, cpf, senha });
    setToken(result.token);
    localStorage.setItem(TOKEN_KEY, result.token);
    setPatient(result.patient as PatientData);
    await refetch();
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutMutation.mutateAsync({ token });
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
    setToken(null);
    setPatient(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <PatientAuthContext.Provider
      value={{
        patient,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const context = useContext(PatientAuthContext);
  if (context === undefined) {
    throw new Error("usePatientAuth must be used within a PatientAuthProvider");
  }
  return context;
}
