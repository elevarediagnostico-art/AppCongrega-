import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export function useActiveChurch() {
  const query = trpc.church.mine.useQuery();
  const [savedId, setSavedId] = useState<number | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("igreja-jornada:churchId");
    setSavedId(stored ? Number(stored) : null);
  }, []);

  const churches = query.data ?? [];
  const church = churches.find(item => item.id === savedId) ?? churches[0] ?? null;

  useEffect(() => {
    if (church && church.id !== savedId) window.localStorage.setItem("igreja-jornada:churchId", String(church.id));
  }, [church, savedId]);

  return { ...query, churches, church };
}
