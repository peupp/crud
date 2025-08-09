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
import { MoreVertical, Plus, Search, Eye, Pencil, Trash2, Stethoscope } from "lucide-react";

// Minimal patient type used in UI
export type Patient = {
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

type Appointment = {
  id: string;
  patient_id: string;
  starts_at: string; // ISO
  status: "agendado" | "realizado" | "cancelado" | "nao_compareceu";
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

export default function Patients() {
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
  const [patients, setPatients] = useState<Patient[]>([]);
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
    setPatients([]);
    setHasMore(true);
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, convenio, vipOnly, city, stateUf, birthdayMonth]);

  async function fetchPage(nextPage: number, replace = false) {
    if (loading || (!replace && !hasMore)) return;
    setLoading(true);
    try {
      let query = supabase
        .from("patients")
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

      let result = (data as Patient[]) || [];

      // Client-side filter for birthday month if provided
      if (birthdayMonth) {
        const month = parseInt(birthdayMonth, 10);
        result = result.filter((p) => {
          if (!p.birth_date) return false;
          const m = new Date(p.birth_date).getMonth() + 1;
          return m === month;
        });
      }

      // Fetch appointments for last/next columns
      const ids = result.map((r) => r.id);
      const apptMap: Record<string, { last?: Appointment; next?: Appointment }> = {};
      if (ids.length) {
        const { data: appts } = await supabase
          .from("appointments")
          .select("id,patient_id,starts_at,status")
          .in("patient_id", ids);
        const now = new Date();
        (appts as Appointment[] | null)?.forEach((a) => {
          const t = new Date(a.starts_at);
          const s = apptMap[a.patient_id] || {};
          if (t <= now) {
            if (!s.last || new Date(s.last.starts_at) < t) s.last = a;
          } else {
            if (a.status === "agendado") {
              if (!s.next || new Date(s.next.starts_at) > t) s.next = a;
            }
          }
          apptMap[a.patient_id] = s;
        });
      }

      // Attach computed fields (kept in memory only)
      const enriched = result.map((r) => ({
        ...r,
        // @ts-ignore
        __last: apptMap[r.id]?.last,
        // @ts-ignore
        __next: apptMap[r.id]?.next,
      }));

      setPatients((prev) => (replace ? enriched : [...prev, ...enriched]));
      setPage(nextPage);
      const total = count ?? 0;
      const loaded = (nextPage + 1) * PAGE_SIZE;
      setHasMore(loaded < total);
      loadedOnce.current = true;
    } catch (e: any) {
      toast({ title: "Erro ao carregar pacientes", description: e.message, variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  }

  const headerTitle = "Pacientes - Lista e Cadastro";
  const metaDescription = "Pacientes: buscar, filtrar, adicionar e gerenciar prontuários.";

  return (
    <div className="px-4 md:px-8 py-6">
      <Helmet>
        <title>Pacientes | Gestão de Pacientes</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`${window.location.origin}/patients`} />
      </Helmet>

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{headerTitle}</h1>
          <p className="text-sm text-muted-foreground">Pesquise por nome ou documento e use filtros para refinar.</p>
        </div>
        <PatientFormDialog
          onSaved={() => {
            setPage(0);
            setPatients([]);
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
                <TableHead>Localidade</TableHead>
                <TableHead>Último atendimento</TableHead>
                <TableHead>Próximo atendimento</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && patients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              )}

              {patients.map((p) => (
                <TableRow key={p.id} className={!p.active ? "opacity-60" : undefined}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium cursor-pointer underline-offset-2 hover:underline">
                        <PatientDetailsDialog patient={p} />
                      </span>
                      {p.vip && <Badge variant="secondary">VIP</Badge>}
                      {p.convenio && <Badge variant="outline">{p.convenio}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{formatPhoneBr(p.mobile_phone || p.phone1 || p.phone2)}</TableCell>
                  <TableCell>
                    {p.city || "—"}
                    {p.state ? `/${p.state}` : ""}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // @ts-ignore
                      const last = p.__last as Appointment | undefined;
                      return last ? new Date(last.starts_at).toLocaleString() : "—";
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // @ts-ignore
                      const next = p.__next as Appointment | undefined;
                      return next ? new Date(next.starts_at).toLocaleString() : "Nenhum atendimento agendado";
                    })()}
                  </TableCell>
                  <TableCell>
                    <RowActions
                      patient={p}
                      onChanged={() => {
                        // refresh list
                        setPage(0);
                        setPatients([]);
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

function PatientDetailsDialog({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      getSignedUrl(patient.photo_url).then(setPhotoUrl);
    }
  }, [open, patient.photo_url]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-left">{patient.name}</button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prontuário</DialogTitle>
          <DialogDescription>Detalhes do paciente (somente leitura)</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {photoUrl ? (
              <img src={photoUrl} alt={`Foto de ${patient.name}`} className="h-32 w-32 rounded-md object-cover" />
            ) : (
              <div className="h-32 w-32 rounded-md bg-muted" />
            )}
            <div>
              <div className="font-medium">{patient.name}</div>
              {patient.social_name && <div className="text-sm text-muted-foreground">{patient.social_name}</div>}
              {patient.vip && <Badge className="mt-2">VIP</Badge>}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">CPF:</span> {patient.cpf || "—"}</div>
            <div><span className="text-muted-foreground">Email:</span> {patient.email || "—"}</div>
            <div><span className="text-muted-foreground">Telefone:</span> {formatPhoneBr(patient.mobile_phone || patient.phone1 || patient.phone2)}</div>
            <div><span className="text-muted-foreground">Endereço:</span> {patient.street || ""} {patient.address_number || ""} {patient.city || ""} {patient.state || ""}</div>
            <div><span className="text-muted-foreground">Observações:</span> {patient.observations || "—"}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RowActions({ patient, onChanged }: { patient: Patient; onChanged: () => void }) {
  const { toast } = useToast();
  const [openEdit, setOpenEdit] = useState(false);
  const [openAppt, setOpenAppt] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", patient.id);

      if ((count || 0) > 0) {
        // arquivar
        const { error } = await supabase.from("patients").update({ active: false }).eq("id", patient.id);
        if (error) throw error;
        toast({ title: "Paciente arquivado", description: "Existem atendimentos vinculados. Registro desativado." });
      } else {
        // remover anexos (melhor esforço)
        try {
          const { data: files } = await supabase.storage.from("patient-attachments").list(patient.id + "/", { limit: 100 });
          if (files?.length) {
            await supabase.storage
              .from("patient-attachments")
              .remove(files.map((f) => `${patient.id}/${f.name}`));
          }
        } catch {}
        const { error } = await supabase.from("patients").delete().eq("id", patient.id);
        if (error) throw error;
        toast({ title: "Paciente excluído" });
      }
      onChanged();
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" as any });
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
          <DropdownMenuItem onClick={() => setOpenAppt(true)}>
            <Stethoscope className="h-4 w-4 mr-2" /> Marcar consulta
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se houver atendimentos vinculados, o paciente será apenas arquivado (desativado).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Processando..." : "Confirmar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <PatientFormDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        patient={patient}
        onSaved={() => {
          setOpenEdit(false);
          onChanged();
        }}
      />

      <AppointmentDialog
        open={openAppt}
        onOpenChange={setOpenAppt}
        patientId={patient.id}
        onSaved={() => {
          setOpenAppt(false);
          onChanged();
        }}
      />
    </div>
  );
}

function PatientFormDialog({
  trigger,
  open,
  onOpenChange,
  patient,
  onSaved,
}: {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  patient?: Patient;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(patient?.name || "");
  const [socialName, setSocialName] = useState(patient?.social_name || "");
  const [cpf, setCpf] = useState(patient?.cpf || "");
  const [email, setEmail] = useState(patient?.email || "");
  const [mobile, setMobile] = useState(patient?.mobile_phone || "");
  const [convenio, setConvenio] = useState(patient?.convenio || "");
  const [vip, setVip] = useState<boolean>(patient?.vip || false);
  const [city, setCity] = useState(patient?.city || "");
  const [stateUf, setStateUf] = useState(patient?.state || "");
  const [birth, setBirth] = useState(patient?.birth_date || "");
  const [obs, setObs] = useState(patient?.observations || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setName(patient.name || "");
      setSocialName(patient.social_name || "");
      setCpf(patient.cpf || "");
      setEmail(patient.email || "");
      setMobile(patient.mobile_phone || "");
      setConvenio(patient.convenio || "");
      setVip(!!patient.vip);
      setCity(patient.city || "");
      setStateUf(patient.state || "");
      setBirth(patient.birth_date || "");
      setObs(patient.observations || "");
    }
  }, [patient]);

  async function onSubmit() {
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
      let patientId = patient?.id;
      if (patientId) {
        const { error } = await supabase
          .from("patients")
          .update({
            name,
            social_name: socialName || null,
            cpf: cpf || null,
            email: email || null,
            mobile_phone: mobile || null,
            convenio: convenio || null,
            vip,
            city: city || null,
            state: stateUf || null,
            birth_date: birth || null,
            observations: obs || null,
          })
          .eq("id", patientId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("patients")
          .insert({
            name,
            social_name: socialName || null,
            cpf: cpf || null,
            email: email || null,
            mobile_phone: mobile || null,
            convenio: convenio || null,
            vip,
            city: city || null,
            state: stateUf || null,
            birth_date: birth || null,
            observations: obs || null,
          })
          .select("id")
          .single();
        if (error) throw error;
        patientId = (data as any)?.id as string;
      }

      if (photoFile && patientId) {
        const ext = photoFile.name.split(".").pop();
        const path = `${patientId}/photo-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("patient-attachments")
          .upload(path, photoFile, { upsert: true });
        if (upErr) throw upErr;
        const { error: upError2 } = await supabase
          .from("patients")
          .update({ photo_url: path })
          .eq("id", patientId);
        if (upError2) throw upError2;
      }

      toast({ title: patient ? "Paciente atualizado" : "Paciente criado" });
      onSaved();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  }

  const content = (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{patient ? "Editar paciente" : "Novo paciente"}</DialogTitle>
        <DialogDescription>Preencha os dados principais do paciente.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Foto</Label>
          <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
        </div>
        <div className="space-y-2">
          <Label>Nome *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
        </div>
        <div className="space-y-2">
          <Label>Nome social</Label>
          <Input value={socialName} onChange={(e) => setSocialName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Celular</Label>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="(11) 9 9999-9999" />
        </div>
        <div className="space-y-2">
          <Label>Convênio</Label>
          <Input value={convenio} onChange={(e) => setConvenio(e.target.value)} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch id="vip" checked={vip} onCheckedChange={setVip} />
          <Label htmlFor="vip">VIP</Label>
        </div>
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Input value={stateUf} onChange={(e) => setStateUf(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data de nascimento</Label>
          <Input type="date" value={birth || ""} onChange={(e) => setBirth(e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Observações</Label>
          <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={4} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange?.(false)}>Cancelar</Button>
        <Button onClick={onSubmit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </DialogFooter>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
}

function AppointmentDialog({
  open,
  onOpenChange,
  patientId,
  onSaved,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  patientId: string;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [when, setWhen] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!when) {
      toast({ title: "Informe data e hora", variant: "destructive" as any });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        patient_id: patientId,
        starts_at: new Date(when).toISOString(),
        status: "agendado",
        notes: notes || null,
      });
      if (error) throw error;
      toast({ title: "Consulta marcada" });
      onSaved();
    } catch (e: any) {
      toast({ title: "Erro ao marcar consulta", description: e.message, variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar consulta</DialogTitle>
          <DialogDescription>Defina data e hora para o atendimento.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Data e hora</Label>
            <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Salvando..." : "Confirmar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
