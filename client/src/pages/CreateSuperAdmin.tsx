import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Temporary page to create super admin user
 * Access: /create-super-admin
 * DELETE THIS FILE AFTER USE
 */
export default function CreateSuperAdmin() {
  const createMutation = trpc.customAuth.createSuperAdmin.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      console.log("User ID:", data.userId);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">
          Create Super Admin
        </h1>
        <p className="text-slate-400 mb-6">
          This will create or update the super admin user:
        </p>
        <ul className="text-slate-300 mb-6 space-y-2">
          <li>• Username: gfranceschi</li>
          <li>• Password: gabriel</li>
          <li>• Role: super_admin</li>
        </ul>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="w-full bg-[#d4af37] hover:bg-[#c4a030] text-slate-950"
        >
          {createMutation.isPending ? "Creating..." : "Create Super Admin"}
        </Button>
        {createMutation.isSuccess && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-500/50 rounded text-green-400 text-sm">
            ✅ User created successfully! You can now delete this page and route.
          </div>
        )}
      </div>
    </div>
  );
}
