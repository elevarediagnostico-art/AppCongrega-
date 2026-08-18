import { MemberPage } from "@/components/MemberPage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActiveChurch } from "@/hooks/useActiveChurch";
import { trpc } from "@/lib/trpc";
import { HeartHandshake, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Prayer() {
  const { church } = useActiveChurch(); const [content, setContent] = useState(""); const [visibility, setVisibility] = useState<"leadership" | "authorized_leadership" | "community">("leadership"); const utils = trpc.useUtils();
  const submit = trpc.care.createPrayer.useMutation({ onSuccess: () => { setContent(""); toast.success("Pedido enviado com cuidado."); utils.care.myPrayers.invalidate(); }, onError: error => toast.error(error.message) });
  const requests = trpc.care.myPrayers.useQuery({ churchId: church?.id ?? 0 }, { enabled: !!church });
  return <MemberPage><section className="mb-8"><p className="eyebrow">Cuidado</p><h1 className="heading-display">Como podemos orar?</h1><p className="mt-2 max-w-xl text-stone-600">O seu pedido será tratado de acordo com o nível de privacidade que escolher.</p></section>
  <section className="rounded-3xl bg-[#123d36] p-5 text-[#f8f1df] shadow-xl md:p-7"><div className="mb-4 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-white/10"><HeartHandshake className="size-5 text-[#e8bd68]" /></span><div><h2 className="font-serif text-xl font-semibold">Pedido de oração</h2><p className="text-xs text-white/60">Um espaço de cuidado, não de exposição.</p></div></div><Textarea value={content} onChange={event => setContent(event.target.value)} placeholder="Partilhe apenas o que se sentir confortável em dizer..." className="min-h-32 border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-[#e8bd68]" />
  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="flex items-center gap-2 text-xs text-white/70"><LockKeyhole className="size-3.5" /><select value={visibility} onChange={event => setVisibility(event.target.value as typeof visibility)} className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white"><option className="text-stone-900" value="leadership">Somente liderança</option><option className="text-stone-900" value="authorized_leadership">Liderança autorizada</option><option className="text-stone-900" value="community">Comunidade</option></select></label><Button disabled={!church || content.trim().length < 5 || submit.isPending} onClick={() => church && submit.mutate({ churchId: church.id, content, visibility })} className="bg-[#e8bd68] text-[#153a33] hover:bg-[#f2ce84]">Enviar pedido</Button></div></section>
  <section className="mt-9"><h2 className="mb-4 font-serif text-xl font-semibold">Os seus pedidos</h2><div className="grid gap-3">{requests.data?.map(item => <article key={item.id} className="rounded-2xl border border-stone-200 bg-white p-4"><div className="flex items-center justify-between gap-4"><span className="text-xs font-semibold text-[#387266]">{item.status === "new" ? "Novo" : item.status === "in_follow_up" ? "Em acompanhamento" : "Concluído"}</span><time className="text-xs text-stone-400">{new Date(item.createdAt).toLocaleDateString("pt-PT")}</time></div><p className="mt-2 text-sm leading-6 text-stone-700">{item.content}</p></article>)}</div></section></MemberPage>;
}
