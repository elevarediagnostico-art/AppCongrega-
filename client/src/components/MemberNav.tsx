import { useActiveChurch } from "@/hooks/useActiveChurch";
import { Bell, BookHeart, CalendarDays, House, Sparkles, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";

const items = [
  { label: "Início", path: "/", icon: House },
  { label: "Agenda", path: "/agenda", icon: CalendarDays },
  { label: "Palavra", path: "/palavra", icon: BookHeart },
  { label: "Igreja", path: "/igreja", icon: Bell },
  { label: "Perfil", path: "/perfil", icon: UsersRound },
];

export function MemberNav() {
  const [location] = useLocation();
  const { church } = useActiveChurch();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#fbfaf7]/92 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-stone-900">
            <span style={{ backgroundColor: church && "primaryColor" in church ? church.primaryColor : "#123d36", color: church && "secondaryColor" in church ? church.secondaryColor : "#e8bd68" }} className="grid size-9 place-items-center overflow-hidden rounded-xl shadow-sm">{church && "logoUrl" in church && church.logoUrl ? <img src={church.logoUrl} alt="" className="size-full object-cover" /> : <Sparkles className="size-4" />}</span>
            <span className="font-serif text-lg font-semibold tracking-tight">{church?.name ?? "Jornada"}</span>
          </Link>
          <span className="text-xs font-medium text-stone-400">Comunidade</span>
        </div>
      </header>
      <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/80 bg-[#fbfaf7]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-end justify-around">
          {items.map(item => {
            const active = item.path === "/igreja" ? location === "/igreja" || ["/avisos", "/oracao", "/conexoes", "/galeria", "/ebd"].includes(location) : location === item.path;
            const Icon = item.icon;
            const primaryColor = church && "primaryColor" in church ? church.primaryColor : "#0e6157";
            const secondaryColor = church && "secondaryColor" in church ? church.secondaryColor : "#e0eee8";
            return <Link key={item.path} href={item.path} aria-current={active ? "page" : undefined} style={{ color: active ? primaryColor : undefined }} className={`flex min-w-13 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors ${active ? "" : "text-stone-500"}`}>
              <span style={active ? { backgroundColor: secondaryColor } : undefined} className="grid size-8 place-items-center rounded-xl"><Icon className="size-[18px]" /></span>{item.label}
            </Link>;
          })}
        </div>
      </nav>
    </>
  );
}
