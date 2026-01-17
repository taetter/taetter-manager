import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";

interface PatientSearchComboboxProps {
  tenantId: number;
  value: string;
  onChange: (value: string, patientId?: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PatientSearchCombobox({
  tenantId,
  value,
  onChange,
  placeholder = "Digite para buscar paciente...",
  disabled = false,
}: PatientSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar pacientes com debounce
  const { data: patients, isLoading } = trpc.patients.list.useQuery(
    { tenantId },
    {
      enabled: open && !!tenantId,
    }
  );

  // Filtrar pacientes baseado no termo de busca
  const filteredPatients = patients?.filter((patient) => {
    const search = searchTerm.toLowerCase();
    return (
      patient.nome.toLowerCase().includes(search) ||
      patient.cpf?.includes(search)
    );
  });

  const handleSelect = (patient: any) => {
    onChange(patient.nome, patient.id);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Carregando..." : "Nenhum paciente encontrado."}
            </CommandEmpty>
            <CommandGroup>
              {filteredPatients?.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.nome}
                  onSelect={() => handleSelect(patient)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === patient.nome ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{patient.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      CPF: {patient.cpf || "Não informado"}
                      {patient.dataNascimento && (
                        <> • Nasc: {new Date(patient.dataNascimento).toLocaleDateString('pt-BR')}</>
                      )}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        
        {/* Opção para digitar manualmente */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => {
              handleInputChange(searchTerm);
              setOpen(false);
            }}
          >
            Ou digite manualmente: <span className="font-medium ml-1">{searchTerm}</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
