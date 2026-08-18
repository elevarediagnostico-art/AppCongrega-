import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ExperienceFeedback({ churchId }: { churchId: number }) {
  const [score, setScore] = useState(0); const [comment, setComment] = useState(""); const [shared, setShared] = useState(false); const send = trpc.experience.submitFeedback.useMutation({ onSuccess: () => { setScore(0); setComment(""); setShared(false); toast.success("Obrigado por partilhar a sua experiência."); }, onError: error => toast.error(error.message) });
  return <section className="mt-8 rounded-3xl border border-[#cfe0d7] bg-[#edf5f0] p-6"><Heart className="size-5 text-[#aa6161]" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c8b7e]">A sua experiência</p><h2 className="mt-1 font-serif text-2xl font-semibold text-[#16483f]">Como está a Jornada na sua igreja?</h2><p className="mt-2 text-sm leading-6 text-[#417468]">Este feedback é voluntário e ajuda a melhorar a experiência. Não é uma campanha de indicação.</p><div className="mt-5 flex gap-2">{[1, 2, 3, 4, 5].map(value => <button key={value} onClick={() => setScore(value)} aria-label={`${value} de 5`} className={`grid size-9 place-items-center rounded-full text-sm font-semibold transition ${score === value ? "bg-[#123d36] text-white" : "bg-white text-[#417468]"}`}>{value}</button>)}</div><Textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="Partilhe, se desejar, uma sugestão ou aprendizado." className="mt-4 min-h-24 bg-white" /><label className="mt-3 flex items-start gap-2 text-sm text-[#417468]"><input type="checkbox" checked={shared} onChange={event => setShared(event.target.checked)} className="mt-1" />Partilhei espontaneamente esta experiência com outra congregação.</label><Button disabled={!score || send.isPending} onClick={() => send.mutate({ churchId, score, comment: comment || undefined, sharedExperience: shared })} className="mt-5 bg-[#123d36] hover:bg-[#185047]">Enviar feedback</Button></section>;
}
