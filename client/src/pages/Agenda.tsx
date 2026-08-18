import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActiveChurch } from "@/hooks/useActiveChurch";
import { MemberPage } from "@/components/MemberPage";
import { trpc } from "@/lib/trpc";
import { BookOpenText, CalendarDays, Check, Clock3, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Recurrence = "none" | "daily" | "weekly" | "monthly";

type FormState = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  recurrence: Recurrence;
};

const emptyForm: FormState = { title: "", description: "", startsAt: "", endsAt: "", recurrence: "none" };
const recurrenceLabels: Record<Recurrence, string> = { none: "Não repetir", daily: "Todos os dias", weekly: "Toda semana", monthly: "Todo mês" };

function toInputDate(value?: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function toDate(value: string) {
  return value ? new Date(value) : undefined;
}

export default function Agenda() {
  const { church, isLoading } = useActiveChurch();
  const utils = trpc.useUtils();
  const events = trpc.community.calendar.useQuery({ churchId: church?.id ?? 0 }, { enabled: !!church });
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const confirm = trpc.community.confirmEvent.useMutation({ onSuccess: () => toast.success("A sua participação foi confirmada."), onError: error => toast.error(error.message) });
  const create = trpc.community.createPersonalCommitment.useMutation({ onSuccess: () => { toast.success("Compromisso criado."); closeForm(); utils.community.calendar.invalidate(); }, onError: error => toast.error(error.message) });
  const update = trpc.community.updatePersonalCommitment.useMutation({ onSuccess: () => { toast.success("Compromisso atualizado."); closeForm(); utils.community.calendar.invalidate(); }, onError: error => toast.error(error.message) });
  const remove = trpc.community.deletePersonalCommitment.useMutation({ onSuccess: () => { toast.success("Compromisso excluído."); utils.community.calendar.invalidate(); }, onError: error => toast.error(error.message) });

  const todayLabel = useMemo(() => new Intl.DateTimeFormat("pt-PT", { weekday: "long", day: "numeric", month: "long" }).format(new Date()), []);
  function closeForm() { setFormOpen(false); setEditingId(null); setForm(emptyForm); }
  function openCreate() { setEditingId(null); setForm({ ...emptyForm, startsAt: toInputDate(new Date(Date.now() + 60 * 60 * 1000)) }); setFormOpen(true); }
  function openEdit(item: { id: number; title: string; description?: string | null; startsAt: Date | string; recurrence?: Recurrence }) { setEditingId(item.id); setForm({ title: item.title, description: item.description ?? "", startsAt: toInputDate(item.startsAt), endsAt: "", recurrence: item.recurrence ?? "none" }); setFormOpen(true); }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!church || !form.title.trim() || !form.startsAt) return;
    const payload = { churchId: church.id, title: form.title.trim(), description: form.description.trim() || undefined, startsAt: toDate(form.startsAt)!, endsAt: toDate(form.endsAt), recurrence: form.recurrence };
    if (editingId) update.mutate({ ...payload, id: editingId }); else create.mutate(payload);
  }

  return <MemberPage>
    <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="eyebrow">A sua agenda</p><h1 className="heading-display">O que vem a seguir</h1><p className="mt-2 text-sm capitalize text-stone-600">Hoje é {todayLabel}.</p></div>
      <Button onClick={openCreate} className="w-full bg-[#123d36] text-[#f8f1df] hover:bg-[#1d594d] sm:w-auto"><Plus className="mr-2 size-4" />Novo compromisso</Button>
    </section>

    {formOpen && <form onSubmit={submit} className="mb-7 rounded-3xl border border-[#cfe0d7] bg-[#f1f7f3] p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">{editingId ? "Editar" : "Novo"}</p><h2 className="font-serif text-2xl font-semibold">{editingId ? "Compromisso" : "O que precisa de lembrar?"}</h2></div><button type="button" onClick={closeForm} aria-label="Fechar" className="rounded-full p-2 text-stone-500 hover:bg-white"><X className="size-5" /></button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label htmlFor="title">Título</Label><Input id="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Reunião, consulta ou estudo" required className="mt-1.5 bg-white" /></div>
        <div><Label htmlFor="startsAt">Começa</Label><Input id="startsAt" type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} required className="mt-1.5 bg-white" /></div>
        <div><Label htmlFor="endsAt">Termina <span className="font-normal text-stone-400">(opcional)</span></Label><Input id="endsAt" type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} className="mt-1.5 bg-white" /></div>
        <div><Label htmlFor="recurrence">Repetir compromisso</Label><select id="recurrence" value={form.recurrence} onChange={e => setForm({ ...form, recurrence: e.target.value as Recurrence })} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="none">{recurrenceLabels.none}</option><option value="daily">{recurrenceLabels.daily}</option><option value="weekly">{recurrenceLabels.weekly}</option><option value="monthly">{recurrenceLabels.monthly}</option></select></div>
        <div><Label htmlFor="description">Nota <span className="font-normal text-stone-400">(opcional)</span></Label><Textarea id="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Algum detalhe importante" className="mt-1.5 min-h-10 bg-white" /></div>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button><Button type="submit" disabled={create.isPending || update.isPending} className="bg-[#123d36] text-white hover:bg-[#1d594d]"><Check className="mr-2 size-4" />Guardar</Button></div>
    </form>}

    {isLoading || events.isLoading ? <p className="text-sm text-stone-500">A preparar o calendário...</p> : events.data?.length ? <div className="grid gap-3 md:grid-cols-2">{events.data.map(item => { const startsAt = item.startsAt ?? new Date(); const isPersonal = item.kind === "personal"; return <article key={`${item.kind}-${item.id}`} className={`rounded-2xl border bg-white p-5 shadow-[0_8px_30px_rgb(68,58,42,0.06)] ${isPersonal ? "border-[#cfe0d7]" : "border-stone-200"}`}>
      <div className="mb-4 flex items-start justify-between gap-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPersonal ? "bg-[#e4f0e9] text-[#216154]" : "bg-[#f8efda] text-[#9b702d]"}`}>{new Date(startsAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</span>{isPersonal ? <Clock3 className="size-5 text-[#216154]" /> : item.kind === "event" ? <CalendarDays className="size-5 text-[#b78535]" /> : <BookOpenText className="size-5 text-[#387266]" />}</div>
      <div className="mb-1 flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-stone-400">{isPersonal ? "Meu compromisso" : item.kind === "event" ? "Evento da igreja" : "Conteúdo da igreja"}</p><h2 className="mt-1 font-serif text-xl font-semibold">{item.title}</h2></div>{isPersonal && <div className="flex shrink-0 gap-1"><button onClick={() => openEdit(item)} aria-label="Editar compromisso" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><Pencil className="size-4" /></button><button onClick={() => remove.mutate({ churchId: church!.id, id: item.id })} aria-label="Excluir compromisso" className="rounded-lg p-2 text-stone-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="size-4" /></button></div>}</div>
      <p className="mt-2 text-sm leading-6 text-stone-600">{item.description ?? (isPersonal ? "Um compromisso só seu." : "Detalhes em breve.")}</p><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-500"><span>{new Date(startsAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>{item.location && <span className="flex items-center gap-1"><MapPin className="size-3.5" />{item.location}</span>}{isPersonal && item.recurrence !== "none" && <span>{recurrenceLabels[item.recurrence]}</span>}</div>{item.kind === "event" && item.requiresRegistration && <Button disabled={confirm.isPending || !church} onClick={() => church && confirm.mutate({ churchId: church.id, eventId: item.id })} variant="outline" className="mt-5">Confirmar participação</Button>}</article>; })}</div> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-8 text-center"><p className="font-serif text-xl font-semibold">A sua agenda está livre por enquanto.</p><p className="mt-2 text-sm text-stone-500">Adicione um compromisso ou acompanhe os próximos encontros da igreja.</p><Button onClick={openCreate} variant="outline" className="mt-5"><Plus className="mr-2 size-4" />Novo compromisso</Button></div>}
  </MemberPage>;
}
