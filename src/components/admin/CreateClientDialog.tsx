import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreateClientDialogProps {
  onCreated: () => void;
}

const CreateClientDialog = ({ onCreated }: CreateClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "" });

  const resetForm = () => setForm({ fullName: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = form.fullName.trim();
    const phone = form.phone.trim();

    if (!fullName) {
      toast.error("O nome é obrigatório.");
      return;
    }

    if (fullName.length > 100) {
      toast.error("Nome muito longo (máx. 100 caracteres).");
      return;
    }

    if (phone && phone.length > 20) {
      toast.error("Telefone inválido.");
      return;
    }

    setLoading(true);

    const guestUserId = crypto.randomUUID();

    const { error } = await supabase.from("profiles").insert({
      user_id: guestUserId,
      full_name: fullName,
      phone: phone || null,
    });

    if (error) {
      toast.error("Erro ao cadastrar cliente.");
    } else {
      toast.success(`Cliente "${fullName}" cadastrado com sucesso!`);
      resetForm();
      setOpen(false);
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus size={14} />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Cadastrar Cliente</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-xs">
          Cadastre clientes que não possuem conta. Eles poderão ter ordens de serviço vinculadas.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Nome completo *</Label>
            <Input
              placeholder="Ex: João da Silva"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              placeholder="Ex: (11) 99999-9999"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              maxLength={20}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Cadastrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDialog;
