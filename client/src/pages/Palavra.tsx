import { MemberPage } from "@/components/MemberPage";
import { useActiveChurch } from "@/hooks/useActiveChurch";
import { trpc } from "@/lib/trpc";
import { BookOpenText } from "lucide-react";

export default function Palavra() {
  const { church } = useActiveChurch();
  const content = trpc.content.list.useQuery({ churchId: church?.id ?? 0 }, { enabled: !!church });
  return <MemberPage><section className="mb-8"><p className="eyebrow">Palavra da Igreja</p><h1 className="heading-display">Para a sua semana</h1><p className="mt-2 max-w-xl text-stone-600">Reflexões, estudos e mensagens produzidos pela sua liderança.</p></section>
    <div className="grid gap-4">{content.data?.map(item => <article key={item.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_8px_30px_rgb(68,58,42,0.06)]"><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a4762e]"><BookOpenText className="size-4" />{item.contentType.replace("_", " ")}</div><h2 className="font-serif text-2xl font-semibold tracking-tight">{item.title}</h2>{item.excerpt && <p className="mt-3 text-base leading-7 text-stone-600">{item.excerpt}</p>}<p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-stone-700">{item.content}</p></article>) ?? <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-8 text-center text-sm text-stone-500">Não há conteúdos publicados neste momento.</div>}</div></MemberPage>;
}
