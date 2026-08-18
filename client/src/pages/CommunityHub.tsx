import { MemberPage } from "@/components/MemberPage";
import { Bell, BookOpenText, Camera, HeartHandshake, UsersRound } from "lucide-react";
import { Link } from "wouter";

const links = [
  { href: "/avisos", label: "Avisos", description: "Comunicações oficiais e próximos acontecimentos.", icon: Bell },
  { href: "/oracao", label: "Oração", description: "Partilhe pedidos e acompanhe o cuidado da comunidade.", icon: HeartHandshake },
  { href: "/conexoes", label: "Conexões", description: "Descubra profissionais e negócios da comunidade.", icon: UsersRound },
  { href: "/ebd", label: "EBD", description: "Aulas, turmas e participação nos encontros.", icon: BookOpenText },
  { href: "/galeria", label: "Galeria", description: "Memórias e momentos vividos pela igreja.", icon: Camera },
];

export default function CommunityHub() {
  return <MemberPage><section><p className="eyebrow">A sua igreja</p><h1 className="heading-display mt-2">Caminhe com a comunidade.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">Tudo o que acontece entre as pessoas da igreja, organizado num único lugar.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{links.map(({ href, label, description, icon: Icon }) => <Link key={href} href={href} className="group rounded-3xl border border-stone-200 bg-white p-5 transition-transform hover:-translate-y-0.5"><span className="grid size-10 place-items-center rounded-2xl bg-[#e4f0e9] text-[#216154]"><Icon className="size-5" /></span><h2 className="mt-5 font-serif text-xl font-semibold">{label}</h2><p className="mt-2 text-sm leading-6 text-stone-600">{description}</p><span className="mt-5 inline-block text-sm font-semibold text-[#387266]">Abrir área →</span></Link>)}</div></section></MemberPage>;
}
