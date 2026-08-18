import { MemberNav } from "@/components/MemberNav";
import { useActiveChurch } from "@/hooks/useActiveChurch";
import type { CSSProperties } from "react";

export function MemberPage({ children }: { children: React.ReactNode }) {
  const { church } = useActiveChurch(); const branded = church && "primaryColor" in church; const style = branded ? ({ "--church-primary": church.primaryColor, "--church-secondary": church.secondaryColor } as CSSProperties) : undefined;
  return <div style={style} className="min-h-screen bg-[#f7f5f0] pb-24 text-stone-800"><MemberNav />{branded && (church.coverImageUrl || church.welcomeMessage) && <section className="relative overflow-hidden border-b border-stone-200" style={{ backgroundColor: church.primaryColor }}>{church.coverImageUrl && <img src={church.coverImageUrl} alt="" className="absolute inset-0 size-full object-cover opacity-30" />}<div className="container relative max-w-5xl py-6 text-white"><p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{church.name}</p>{church.welcomeMessage && <p className="mt-1 font-serif text-xl font-semibold">{church.welcomeMessage}</p>}</div></section>}<main className="container max-w-5xl py-6 md:py-10">{children}</main></div>;
}
