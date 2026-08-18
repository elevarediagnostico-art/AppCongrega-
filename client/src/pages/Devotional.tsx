import { MemberPage } from "@/components/MemberPage";
import { useActiveChurch } from "@/hooks/useActiveChurch";
import { trpc } from "@/lib/trpc";
import { BookOpen, CalendarDays, Heart, Lightbulb, MessageCircleQuestion, Quote } from "lucide-react";

export default function Devotional() {
  const { church } = useActiveChurch();
  const devotional = trpc.member.dailyDevotional.useQuery({ churchId: church?.id ?? 0 }, { enabled: !!church });
  const item = devotional.data;
  const prayer = item && "prayer" in item && typeof item.prayer === "string" ? item.prayer : null;
  const question = item && "question" in item && typeof item.question === "string" ? item.question : null;
  const today = new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(new Date());

  return <MemberPage>
    <section className="mb-8">
      <p className="eyebrow">Devocional Diário</p>
      <h1 className="heading-display">Uma pausa para permanecer</h1>
      <p className="mt-2 max-w-2xl text-stone-600">Reflexões originais para acompanhar a sua caminhada com Deus, um dia de cada vez.</p>
    </section>

    {devotional.isLoading ? <div className="rounded-3xl border border-stone-200 bg-white p-8 text-sm text-stone-500">A preparar o devocional de hoje...</div> : item ? <article className="overflow-hidden rounded-[2rem] border border-[#dbe7df] bg-white shadow-[0_12px_40px_rgba(68,58,42,0.07)]">
      <header className="bg-[#123d36] p-6 text-[#f8f1df] md:p-9">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8bd68]"><CalendarDays className="size-4" />{today}</div>
        <h2 className="mt-5 max-w-3xl font-serif text-3xl font-semibold leading-tight md:text-5xl">{item.title}</h2>
        <div className="mt-5 flex items-start gap-3 border-l-2 border-[#e8bd68] pl-4 text-white/80"><Quote className="mt-1 size-4 shrink-0 text-[#e8bd68]" /><p className="font-serif text-lg italic">{item.bibleReference}</p></div>
      </header>
      <div className="grid gap-8 p-6 md:p-9 lg:grid-cols-[1fr_280px]">
        <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#387266]"><BookOpen className="size-4" />Reflexão</div><div className="mt-5 whitespace-pre-wrap text-[1.05rem] leading-8 text-stone-700">{item.reflection}</div></div>
        <aside className="space-y-4">
          {item.application && <section className="rounded-2xl bg-[#edf5f0] p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#216154]"><Lightbulb className="size-4" />Aplicação</div><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#315e53]">{item.application}</p></section>}
          {prayer && <section className="rounded-2xl bg-[#fffaf0] p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a4762e]"><Heart className="size-4" />Oração</div><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">{prayer}</p></section>}
          {question && <section className="rounded-2xl border border-stone-200 p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500"><MessageCircleQuestion className="size-4" />Para meditar</div><p className="mt-3 text-sm font-medium leading-7 text-stone-700">{question}</p></section>}
        </aside>
      </div>
    </article> : <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 p-8 text-center"><BookOpen className="mx-auto size-8 text-stone-400" /><h2 className="mt-4 font-serif text-2xl font-semibold">O próximo devocional está a ser preparado</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">A sua igreja ainda não publicou uma reflexão para esta data. Volte em breve para continuar a jornada.</p></div>}
  </MemberPage>;
}
