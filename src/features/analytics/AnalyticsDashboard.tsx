import { useStore } from "../../store/useStore";
import { 
  Download, 
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/Card";
import { WeeklyTrendLineChart, CampaignComparisonBarChart } from "../../components/charts/DashboardCharts";
import { cn, formatPercent } from "../../components/ui/utils";
import { toast } from "../../components/ui/Toast";

export function AnalyticsDashboard() {
  const campaigns = useStore(state => state.campaigns);
  const getCampaignAnalytics = useStore(state => state.getCampaignAnalytics);

  const handleExportReport = () => {
    toast.success("Preparing analytical summary export...");
    setTimeout(() => {
      const headers = ["Campaign ID", "Campaign Name", "Status", "Contacts Targeted", "Delivered Count", "Read Count", "Delivery Success %"];
      const rows = campaigns.map(c => {
        const a = getCampaignAnalytics(c.id);
        return [
          c.id,
          c.name,
          c.status,
          a?.total_contacts || 0,
          a?.delivered || 0,
          a?.read || 0,
          a?.total_contacts ? ((a.delivered / a.total_contacts) * 100).toFixed(1) + "%" : "0%"
        ];
      });

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `whatsapp_cms_analytics_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Successfully generated and downloaded analytics CSV report.");
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6 max-w-7xl mx-auto grid-bg-lines font-sans"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
            Performance Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Review delivery pipelines, customer open percentages, and campaign efficacy comparisons.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 rounded-lg shadow-md transition-colors cursor-pointer shrink-0 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          <Download size={14} />
          Export Report
        </button>
      </div>

      {/* Primary Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Longitudinal progress */}
        <Card>
          <CardHeader>
            <CardTitle>Historical Sending Trends</CardTitle>
            <CardDescription>Aggregate weekly dispatches and receiver engagement rates.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyTrendLineChart />
          </CardContent>
        </Card>

        {/* Campaign success comparing */}
        <Card>
          <CardHeader>
            <CardTitle>Top Campaign Conversions</CardTitle>
            <CardDescription>Side-by-side comparison of delivery and customer read percentages.</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignComparisonBarChart />
          </CardContent>
        </Card>
      </div>

      {/* Grid: Failure analysis & comparative list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Failure breakdown panel */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery Failures Audit</CardTitle>
                  <CardDescription>Meta Cloud API response codes breakdown.</CardDescription>
                </div>
                <AlertTriangle size={15} className="text-rose-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-semibold">
              {[
                { code: "Meta Code 131026", label: "Receiver Profile Unregistered", rate: "62%", desc: "The targeted cell phone is not active on WhatsApp." },
                { code: "Meta Code 130429", label: "Cloud Rate Limit Exceeded", rate: "22%", desc: "Batch throttle size hit standard Meta Graph tier limits." },
                { code: "Meta Code 132001", label: "Template Parameter Mismatch", rate: "11%", desc: "Substitution variable count was incorrect." },
                { code: "Internal Timeout", label: "FastAPI server queue error", rate: "5%", desc: "Connection failed during webhook handshake." }
              ].map((f) => (
                <div key={f.code} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{f.label}</span>
                    <span className="text-rose-500 font-mono">{f.rate}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono font-medium mt-1">{f.code}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-sans font-normal mt-1">{f.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Campaign Table */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Efficacy Ledger</CardTitle>
              <CardDescription>High fidelity logs of all past campaigns.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Campaign Name</th>
                    <th className="p-4 text-center">Contacts</th>
                    <th className="p-4 text-center text-blue-500">Delivered %</th>
                    <th className="p-4 text-center text-emerald-500">Read %</th>
                    <th className="p-4 text-center text-rose-500">Failed %</th>
                    <th className="p-4 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {campaigns.map((c) => {
                    const a = getCampaignAnalytics(c.id);
                    const delRate = a?.total_contacts ? (a.delivered / a.total_contacts) : 0.95;
                    const readRate = a?.delivered ? (a.read / a.delivered) : 0.68;
                    const failRate = a?.total_contacts ? (a.failed / a.total_contacts) : 0.05;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white truncate max-w-[150px] font-display">{c.name}</td>
                        <td className="p-4 text-center font-semibold">{a?.total_contacts || 0}</td>
                        <td className="p-4 text-center font-mono font-bold text-blue-500">{formatPercent(delRate)}</td>
                        <td className="p-4 text-center font-mono font-bold text-emerald-500">{formatPercent(readRate)}</td>
                        <td className="p-4 text-center font-mono font-bold text-rose-500">{formatPercent(failRate)}</td>
                        <td className="p-4 pr-6">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border",
                            c.status === 'completed'
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : c.status === 'running'
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          )}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

      </div>

    </motion.div>
  );
}
