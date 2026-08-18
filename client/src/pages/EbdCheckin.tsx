import { MemberPage } from "@/components/MemberPage";
import { Button } from "@/components/ui/button";
import { useActiveChurch } from "@/hooks/useActiveChurch";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, QrCode } from "lucide-react";
import { toast } from "sonner";

export default function EbdCheckin() {
  const { church } = useActiveChurch(); const token = new URLSearchParams(window.location.search).get("token") ?? ""; const utils = trpc.useUtils();
  const checkin = trpc.ebd.checkIn.useMutation({ onSuccess: data => { toast.success(`Presença registada: ${data.lessonTitle}`); utils.member.home.invalidate(); }, onError: error => toast.error(error.message) });
  return <MemberPage><section className="mx-auto max-w-lg"><p className="eyebrow">EBD</p><h1 className="heading-display">Registar presença</h1><p className="mt-2 text-stone-600">Confirme a presença na aula atual através do QR Code disponibilizado pelo professor.</p><article className="mt-8 rounded-3xl bg-[#123d36] p-7 text-center text-[#f8f1df]"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10"><QrCode className="size-7 text-[#e8bd68]" /></span><h2 className="mt-5 font-serif text-2xl font-semibold">Check-in EBD</h2><p className="mt-2 text-sm leading-6 text-white/65">A presença só será registada uma vez para esta aula.</p><Button disabled={!church || !token || checkin.isPending || checkin.isSuccess} onClick={() => church && checkin.mutate({ churchId: church.id, token })} className="mt-6 w-full bg-[#e8bd68] text-[#153a33] hover:bg-[#f2ce84]">{checkin.isSuccess ? <><CheckCircle2 className="mr-2 size-4" />Presença registada</> : "Confirmar presença"}</Button>{!token && <p className="mt-4 text-xs text-[#ffd3d3]">QR Code inválido ou incompleto.</p>}</article></section></MemberPage>;
}
