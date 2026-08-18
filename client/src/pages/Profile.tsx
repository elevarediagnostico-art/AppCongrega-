import { MemberPage } from "@/components/MemberPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { LogOut, UserRound } from "lucide-react";

export default function Profile() {
  const { user, loading, logout } = useAuth();
  if (loading) return <MemberPage><div className="rounded-3xl border border-stone-200 bg-white p-8 text-sm text-stone-500">A carregar o seu perfil...</div></MemberPage>;
  if (!user) return <MemberPage><section className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center"><UserRound className="mx-auto size-8 text-[#387266]" /><h1 className="mt-4 font-serif text-2xl font-semibold">Entre para ver o seu perfil</h1><Button onClick={() => startLogin()} className="mt-6 bg-[#123d36] hover:bg-[#185047]">Entrar</Button></section></MemberPage>;
  return <MemberPage><section className="mx-auto max-w-2xl"><p className="eyebrow">A sua conta</p><h1 className="heading-display mt-2">Perfil</h1><div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6"><div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-2xl bg-[#e4f0e9] text-[#216154]"><UserRound className="size-6" /></span><div><h2 className="font-serif text-xl font-semibold">{user.name || "Membro"}</h2><p className="text-sm text-stone-500">{user.email || "Conta autenticada"}</p></div></div><div className="mt-8 border-t border-stone-100 pt-5"><p className="text-sm leading-6 text-stone-600">As suas preferências e o seu caminho permanecem associados à sua conta e à sua igreja.</p><Button variant="outline" onClick={logout} className="mt-5"><LogOut className="mr-2 size-4" />Sair da conta</Button></div></div></section></MemberPage>;
}
