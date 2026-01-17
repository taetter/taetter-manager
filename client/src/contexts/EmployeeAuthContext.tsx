import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface EmployeeData {
  id: number;
  tenantId: number;
  nome: string;
  cpf: string;
  cargo: string;
  perfil: string;
}

interface EmployeeAuthContextType {
  employee: EmployeeData | null;
  sessionToken: string | null;
  isLoading: boolean;
  login: (tenantId: number, cpf: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const EmployeeAuthContext = createContext<EmployeeAuthContextType | undefined>(undefined);

const SESSION_TOKEN_KEY = "employee_session_token";

export function EmployeeAuthProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  });
  const [employee, setEmployee] = useState<EmployeeData | null>(null);

  // Query para buscar dados do colaborador
  const { data, isLoading, refetch } = trpc.employeeAuth.me.useQuery(
    { sessionToken: sessionToken || "" },
    { enabled: !!sessionToken, retry: false }
  );

  // Mutation para login
  const loginMutation = trpc.employeeAuth.login.useMutation();

  // Mutation para logout
  const logoutMutation = trpc.employeeAuth.logout.useMutation();

  // Atualizar dados do colaborador quando a query retornar
  useEffect(() => {
    if (data) {
      setEmployee(data as EmployeeData);
    }
  }, [data]);

  const login = async (tenantId: number, cpf: string, senha: string) => {
    const result = await loginMutation.mutateAsync({ tenantId, cpf, senha });
    setSessionToken(result.sessionToken);
    localStorage.setItem(SESSION_TOKEN_KEY, result.sessionToken);
    setEmployee(result.employee as EmployeeData);
    await refetch();
  };

  const logout = async () => {
    if (sessionToken) {
      try {
        await logoutMutation.mutateAsync({ sessionToken });
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
    setSessionToken(null);
    setEmployee(null);
    localStorage.removeItem(SESSION_TOKEN_KEY);
  };

  return (
    <EmployeeAuthContext.Provider
      value={{
        employee,
        sessionToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </EmployeeAuthContext.Provider>
  );
}

export function useEmployeeAuth() {
  const context = useContext(EmployeeAuthContext);
  if (context === undefined) {
    throw new Error("useEmployeeAuth must be used within an EmployeeAuthProvider");
  }
  return context;
}

// Helper para obter URL de login
export function getEmployeeLoginUrl(tenantId: number) {
  return `/employee/${tenantId}/login`;
}
