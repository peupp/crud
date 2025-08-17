import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Plus, Search, Eye, Pencil, Trash2, User } from "lucide-react";

// Minimal client type used in UI
export type Client = {
  id: string;
  created_at: string;
  updated_at: string;
  active: boolean;
  vip: boolean;
  photo_url: string | null;
  convenio: string | null;
  name: string;
  social_name: string | null;
  cpf: string | null;
  mobile_phone: string | null;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  birth_date: string | null; // ISO date
  observations: string | null;
  cep: string | null;
  street: string | null;
  address_number: string | null;
  complement: string | null;
};

function formatPhoneBr(v?: string | null) {
  if (!v) return "—";
  const digits = v.replace(/\D/g, "");
  if (digits.length === 11) {
    return `+55 (${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+55 (${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  }
  return v;
}

function cpfIsValid(cpf?: string | null) {
  if (!cpf) return true; // optional in this form
  const str = cpf.replace(/\D/g, "");
  if (str.length !== 11 || /^(\d)\1+$/.test(str)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(str.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(str.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(str.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(str.charAt(10));
}

async function getSignedUrl(path?: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("patient-attachments")
    .createSignedUrl(path, 60 * 10);
  if (error) return null;
  return data.signedUrl;
}

const PAGE_SIZE = 20;

export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [convenio, setConvenio] = useState("");
  const [vipOnly, setVipOnly] = useState(false);
  const [birthdayMonth, setBirthdayMonth] = useState<string>("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  // Pagination
  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadedOnce = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset and fetch when filters change
  useEffect(() => {
    setPage(0);
    setClients([]);
    setHasMore(true);
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, convenio, vipOnly, city, stateUf, birthdayMonth]);

  async function fetchPage(nextPage: number, replace = false) {
    if (loading || (!replace && !hasMore)) return;
    setLoading(true);
    try {
      let query = supabase
        .from("clients")
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(nextPage * PAGE_SIZE, nextPage * PAGE_SIZE + (PAGE_SIZE - 1));

      if (debounced) {
        query = query.ilike("name", `%${debounced}%`);
      }
      if (convenio) {
        query = query.ilike("convenio", `%${convenio}%`);
      }
      if (vipOnly) {
        query = query.eq("vip", true);
      }
      if (city) {
        query = query.ilike("city", `%${city}%`);
      }
      if (stateUf) {
        query = query.ilike("state", `%${stateUf}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      let result = (data as Client[]) || [];

      // Client-side filter for birthday month if provided
      if (birthdayMonth) {
        const month = parseInt(birthdayMonth, 10);
        result = result.filter((c) => {
          if (!c.birth_date) return false;
          const m = new Date(c.birth_date).getMonth() + 1;
          return m === month;
        });
      }

      setClients((prev) => (replace ? result : [...prev, ...result]));
      setPage(nextPage);
      const total = count ?? 0;
      const loaded = (nextPage + 1) * PAGE_SIZE;
      setHasMore(loaded < total);
      loadedOnce.current = true;
    } catch (e: any) {
      toast({ title: "Erro ao carregar clientes", description: e.message, variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  }

  const headerTitle = "Clientes - Lista e Cadastro";
  const metaDescription = "Clientes: buscar, filtrar, adicionar e gerenciar registros.";

  return (
    <div className="px-4 md:px-8 py-6">
      <Helmet>
        <title>Clientes | Gestão de Clientes</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`${window.location.origin}/clients`} />
      </Helmet>

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{headerTitle}</h1>
          <p className="text-sm text-muted-foreground">Pesquise por nome ou documento e use filtros para refinar.</p>
        </div>
        <ClientFormDialog
          onSaved={() => {
            setPage(0);
            setClients([]);
            setHasMore(true);
            fetchPage(0, true);
          }}
          trigger={
            <Button size="sm" className="min-w-28">
              <Plus className="h-4 w-4 mr-2" /> Adicionar
            </Button>
          }
        />
      </header>

      <section className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Input placeholder="Convênio" value={convenio} onChange={(e) => setConvenio(e.target.value)} />
        <div className="flex items-center gap-3">
          <Switch id="vipOnly" checked={vipOnly} onCheckedChange={setVipOnly} />
          <Label htmlFor="vipOnly">Apenas VIP</Label>
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={birthdayMonth}
          onChange={(e) => setBirthdayMonth(e.target.value)}
        >
          <option value="">Aniversariantes (mês)</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {String(i + 1).padStart(2, "0")}
            </option>
          ))}
        </select>
        <Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
        <Input placeholder="Estado" value={stateUf} onChange={(e) => setStateUf(e.target.value)} />
      </section>

      <section>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Localidade</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}

              {clients.map((c) => (
                <TableRow key={c.id} className={!c.active ? "opacity-60" : undefined}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium cursor-pointer underline-offset-2 hover:underline">
                        <ClientDetailsDialog client={c} />
                      </span>
                      {c.vip && <Badge variant="secondary">VIP</Badge>}
                      {c.convenio && <Badge variant="outline">{c.convenio}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{formatPhoneBr(c.mobile_phone || c.phone1 || c.phone2)}</TableCell>
                  <TableCell>{c.email || "—"}</TableCell>
                  <TableCell>
                    {c.city || "—"}
                    {c.state ? `/${c.state}` : ""}
                  </TableCell>
                  <TableCell>
                    <RowActions
                      client={c}
                      onChanged={() => {
                        // refresh list
                        setPage(0);
                        setClients([]);
                        setHasMore(true);
                        fetchPage(0, true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center py-4">
          {hasMore ? (
            <Button variant="outline" onClick={() => fetchPage(page + 1)} disabled={loading}>
              {loading ? "Carregando..." : "Carregar mais"}
            </Button>
          ) : loadedOnce.current ? (
            <span className="text-sm text-muted-foreground">Fim da lista</span>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ClientDetailsDialog({ client }: { client: Client }) {
  const [open, setOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      getSignedUrl(client.photo_url).then(setPhotoUrl);
    }
  }, [open, client.photo_url]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-left">{client.name}</button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
          <DialogDescription>Informações do cliente (somente leitura)</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {photoUrl ? (
              <img src={photoUrl} alt={`Foto de ${client.name}`} className="h-32 w-32 rounded-md object-cover" />
            ) : (
              <div className="h-32 w-32 rounded-md bg-muted" />
            )}
            <div>
              <div className="font-medium">{client.name}</div>
              {client.social_name && <div className="text-sm text-muted-foreground">{client.social_name}</div>}
              {client.vip && <Badge className="mt-2">VIP</Badge>}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">CPF:</span> {client.cpf || "—"}</div>
            <div><span className="text-muted-foreground">Email:</span> {client.email || "—"}</div>
            <div><span className="text-muted-foreground">Telefone:</span> {formatPhoneBr(client.mobile_phone || client.phone1 || client.phone2)}</div>
            <div><span className="text-muted-foreground">Endereço:</span> {client.street || ""} {client.address_number || ""} {client.city || ""} {client.state || ""}</div>
            <div><span className="text-muted-foreground">Observações:</span> {client.observations || "—"}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RowActions({ client, onChanged }: { client: Client; onChanged: () => void }) {
  const { toast } = useToast();
  const [openEdit, setOpenEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      // arquivar ao invés de excluir
      const { error } = await supabase.from("clients").update({ active: false }).eq("id", client.id);
      if (error) throw error;
      toast({ title: "Cliente arquivado", description: "Cliente foi desativado com sucesso." });
      onChanged();
    } catch (e: any) {
      toast({ title: "Erro ao arquivar", description: e.message, variant: "destructive" as any });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Pencil className="h-4 w-4 mr-2" /> Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash2 className="h-4 w-4 mr-2" /> Arquivar
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Arquivar cliente</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza de que deseja arquivar este cliente? Esta ação pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Arquivando..." : "Arquivar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {openEdit && (
        <ClientFormDialog
          client={client}
          onSaved={() => {
            setOpenEdit(false);
            onChanged();
          }}
          open={openEdit}
          onOpenChange={setOpenEdit}
        />
      )}
    </div>
  );
}

type ClientFormProps = {
  client?: Client;
  onSaved: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function ClientFormDialog({ client, onSaved, trigger, open, onOpenChange }: ClientFormProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : isOpen;
  const setDialogOpen = isControlled ? (onOpenChange ?? (() => {})) : setIsOpen;

  // Form state
  const [name, setName] = useState("");
  const [socialName, setSocialName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [phone1, setPhone1] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [vip, setVip] = useState(false);
  const [convenio, setConvenio] = useState("");
  const [observations, setObservations] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (client) {
      setName(client.name || "");
      setSocialName(client.social_name || "");
      setCpf(client.cpf || "");
      setEmail(client.email || "");
      setMobilePhone(client.mobile_phone || "");
      setPhone1(client.phone1 || "");
      setCep(client.cep || "");
      setStreet(client.street || "");
      setAddressNumber(client.address_number || "");
      setCity(client.city || "");
      setState(client.state || "");
      setBirthDate(client.birth_date || "");
      setVip(client.vip);
      setConvenio(client.convenio || "");
      setObservations(client.observations || "");
    } else {
      // Reset for new client
      setName("");
      setSocialName("");
      setCpf("");
      setEmail("");
      setMobilePhone("");
      setPhone1("");
      setCep("");
      setStreet("");
      setAddressNumber("");
      setCity("");
      setState("");
      setBirthDate("");
      setVip(false);
      setConvenio("");
      setObservations("");
      setPhoto(null);
    }
  }, [client, dialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" as any });
      return;
    }
    if (cpf && !cpfIsValid(cpf)) {
      toast({ title: "CPF inválido", variant: "destructive" as any });
      return;
    }

    setSaving(true);
    try {
      let photoUrl = client?.photo_url || null;

      // Upload photo if provided
      if (photo) {
        const clientId = client?.id || crypto.randomUUID();
        const ext = photo.name.split(".").pop() || "jpg";
        const photoPath = `${clientId}/photo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("patient-attachments")
          .upload(photoPath, photo, { upsert: true });
        if (uploadError) throw uploadError;
        photoUrl = photoPath;
      }

      const payload = {
        name: name.trim(),
        social_name: socialName.trim() || null,
        cpf: cpf.trim() || null,
        email: email.trim() || null,
        mobile_phone: mobilePhone.trim() || null,
        phone1: phone1.trim() || null,
        cep: cep.trim() || null,
        street: street.trim() || null,
        address_number: addressNumber.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        birth_date: birthDate || null,
        vip,
        convenio: convenio.trim() || null,
        observations: observations.trim() || null,
        photo_url: photoUrl,
      };

      if (client) {
        const { error } = await supabase.from("clients").update(payload).eq("id", client.id);
        if (error) throw error;
        toast({ title: "Cliente atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from("clients").insert([payload]);
        if (error) throw error;
        toast({ title: "Cliente cadastrado com sucesso!" });
      }

      setDialogOpen(false);
      onSaved();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            {client ? "Atualize as informações do cliente." : "Preencha os dados do novo cliente."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialName">Nome Social</Label>
              <Input id="socialName" value={socialName} onChange={(e) => setSocialName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobilePhone">Celular</Label>
              <Input
                id="mobilePhone"
                value={mobilePhone}
                onChange={(e) => setMobilePhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone1">Telefone Fixo</Label>
              <Input
                id="phone1"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                placeholder="(11) 3333-3333"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="convenio">Convênio</Label>
              <Input id="convenio" value={convenio} onChange={(e) => setConvenio(e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Rua</Label>
              <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressNumber">Número</Label>
              <Input id="addressNumber" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Foto</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="vip" checked={vip} onCheckedChange={setVip} />
            <Label htmlFor="vip">Cliente VIP</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : client ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}