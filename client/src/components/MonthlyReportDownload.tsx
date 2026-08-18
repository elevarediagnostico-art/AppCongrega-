import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Download } from "lucide-react";
import { useState } from "react";

function currentMonth() { return new Date().toISOString().slice(0, 7); }

export function MonthlyReportDownload({ churchId }: { churchId: number }) {
  const [month, setMonth] = useState(currentMonth); const report = trpc.reports.monthly.useQuery({ churchId, month });
  const download = () => {
    if (!report.data) return;
    const rows = [
      ["Relatório mensal", month], ["Gerado em", new Date(report.data.generatedAt).toLocaleString("pt-PT")], [],
      ["Igreja", "Valor"], ["Membros", report.data.church.members], ["Novos membros", report.data.church.newMembers], ["Membros ativos", report.data.church.activeMembers], [],
      ["Bíblia", "Valor"], ["Participantes", report.data.bible.participants], ["Leituras concluídas", report.data.bible.readingsCompleted], [],
      ["EBD", "Valor"], ["Matriculados", report.data.ebd.enrolled], ["Presenças", report.data.ebd.attendances], [],
      ["Participação", "Valor"], ["Eventos", report.data.participation.events], ["Confirmações de evento", report.data.participation.eventCheckins], [],
      ["Cuidado", "Valor"], ["Pedidos de oração", report.data.care.prayerRequests], ["Pedidos ativos", report.data.care.activePrayers], [],
      ["Atividade", "Valor"], ["Membros ativos", report.data.activity.activeMembers], ["Sinais objetivos de baixa participação", report.data.activity.lowParticipation],
    ];
    const csv = rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(";")).join("\n"); const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `relatorio-mensal-${month}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  return <div className="flex flex-col gap-2 sm:flex-row"><input aria-label="Mês do relatório" type="month" value={month} onChange={event => setMonth(event.target.value)} className="h-9 rounded-md border border-stone-200 bg-white px-2 text-sm" /><Button variant="outline" disabled={report.isLoading || !report.data} onClick={download}><Download className="mr-2 size-4" />Exportar CSV</Button></div>;
}
