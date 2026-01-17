import { trpc } from "@/lib/trpc";

export function useTenants(params?: {
  search?: string;
  status?: "ativo" | "inativo" | "suspenso";
  limit?: number;
  offset?: number;
}) {
  return trpc.tenants.list.useQuery(
    {
      search: params?.search || "",
      status: params?.status,
      limit: params?.limit || 50,
      offset: params?.offset || 0,
    },
    {
      enabled: true,
    }
  );
}

export function useTenantById(id: number) {
  return trpc.tenants.getById.useQuery(
    { id },
    {
      enabled: !!id,
    }
  );
}

export function useCreateTenant() {
  const utils = trpc.useUtils();
  
  return trpc.tenants.create.useMutation({
    onSuccess: () => {
      // Invalidar cache para recarregar lista
      utils.tenants.list.invalidate();
      utils.tenants.stats.invalidate();
    },
  });
}

export function useUpdateTenant() {
  const utils = trpc.useUtils();
  
  return trpc.tenants.update.useMutation({
    onSuccess: () => {
      utils.tenants.list.invalidate();
      utils.tenants.stats.invalidate();
    },
  });
}

export function useDeleteTenant() {
  const utils = trpc.useUtils();
  
  return trpc.tenants.delete.useMutation({
    onSuccess: () => {
      utils.tenants.list.invalidate();
      utils.tenants.stats.invalidate();
    },
  });
}

export function useTenantStats() {
  return trpc.tenants.stats.useQuery();
}
