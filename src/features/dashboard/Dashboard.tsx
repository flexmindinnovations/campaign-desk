import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Tv, 
  Send, 
  CheckCircle, 
  MailOpen, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Database,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/Card";
import { DeliveryAreaChart, SendingVolumeBarChart } from "../../components/charts/DashboardCharts";
import { formatDate, formatNumber, formatPercent } from "../../components/ui/utils";
import { Badge } from "../../components/ui/Badge";

export function Dashboard() {
  const navigate = useNavigate();
  const contacts = useStore(state => state.contacts);
  const campaigns = useStore(state => state.campaigns);
  const messages = useStore(state => state.messages);
  const activities = useStore(state => state.activities);
  
  // Computations
  const totalContacts = contacts.length;
  const activeCampaignsCount = campaigns.filter(c => c.status === 'running').length;
  
  // Exclude pending from sent calculations
  const totalSent = messages.filter(m => m.delivery_status !== 'pending' && m.campaign_id !== 9999).length;
  const totalDelivered = messages.filter(m => (m.delivery_status === 'delivered' || m.delivery_status === 'read') && m.campaign_id !== 9999).length;
  const totalRead = messages.filter(m => m.delivery_status === 'read' && m.campaign_id !== 9999).length;
  const totalFailed = messages.filter(m => m.delivery_status === 'failed' && m.campaign_id !== 9999).length;
  
  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) : 0.94;
  const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) : 0.68;

  const kpis = [
    {
      title: "Total CRM Contacts",
      value: formatNumber(totalContacts),
      subtext: "Synced from Odoo ERP",
      icon: Users,
      trend: "+12.4%",
      isPositive: true,
      color: "border-l-emerald-500",
      path: "/contacts"
    },
    {
      title: "Active Campaigns",
      value: activeCampaignsCount.toString(),
      subtext: "Background job processing",
      icon: Tv,
      trend: activeCampaignsCount > 0 ? "LIVE" : "IDLE",
      isPositive: activeCampaignsCount > 0,
      color: "border-l-blue-500",
      path: "/campaigns"
    },
    {
      title: "Total Messages Sent",
      value: formatNumber(totalSent),
      subtext: "Delivered via Meta Cloud",
      icon: Send,
      trend: "+8.2%",
      isPositive: true,
      color: "border-l-slate-700 dark:border-l-slate-400",
      path: "/analytics"
    },
    {
      title: "Delivered Messages",
      value: formatNumber(totalDelivered),
      subtext: `${formatPercent(deliveryRate)} success rate`,
      icon: CheckCircle,
      trend: "+9.1%",
      isPositive: true,
      color: "border-l-emerald-500",
      path: "/analytics"
    },
    {
      title: "Read Messages",
      value: formatNumber(totalRead),
      subtext: `${formatPercent(readRate)} open rate`,
      icon: MailOpen,
      trend: "+14.2%",
      isPositive: true,
      color: "border-l-blue-500",
      path: "/analytics"
    },
    {
      title: "Failed Deliveries",
      value: formatNumber(totalFailed),
      subtext: `${totalSent > 0 ? ((totalFailed / totalSent) * 100).toFixed(1) : 0.0}% failure rate`,
      icon: AlertTriangle,
      trend: "-2.4%",
      isPositive: true, // Decreasing failures is positive
      color: "border-l-rose-500",
      path: "/analytics"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6 max-w-7xl mx-auto grid-bg-lines"
    >
      {/* Header and Welcome Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
            Welcome back, Imran
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Here's the delivery performance overview for your WhatsApp Campaign System.
          </p>
        </div>

        {/* Floating Quick Action */}
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-200 cursor-pointer shrink-0"
        >
          <Plus size={15} />
          Create Campaign
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(kpi.path)}
              className="cursor-pointer"
            >
              <Card hoverGlow className={`border-l-4 ${kpi.color} hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans tracking-wide uppercase">
                      {kpi.title}
                    </span>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Icon size={16} />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display leading-none">
                      {kpi.value}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      kpi.trend === 'LIVE' 
                        ? 'bg-blue-500/10 text-blue-500 animate-pulse'
                        : kpi.trend === 'IDLE'
                        ? 'bg-slate-500/10 text-slate-400'
                        : kpi.isPositive 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {kpi.trend !== 'LIVE' && kpi.trend !== 'IDLE' && (
                        kpi.isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />
                      )}
                      {kpi.trend}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 font-sans">
                    {kpi.subtext}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Graphs & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph Area Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Message Delivery & Read Trends</CardTitle>
                <CardDescription>Visual analysis of delivered vs. read messages over 7 days.</CardDescription>
              </div>
              <Badge variant="success" className="font-mono flex gap-1 items-center">
                <TrendingUp size={11} />
                +14% Open rate
              </Badge>
            </CardHeader>
            <CardContent>
              <DeliveryAreaChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Sending Volume</CardTitle>
              <CardDescription>Number of bulk template dispatches fired per 24 hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <SendingVolumeBarChart />
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed Sidebar Column */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Live background system events stream.</CardDescription>
                </div>
                <Database size={15} className="text-slate-400 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[660px] space-y-4">
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-2.5 pl-6 space-y-6 py-2">
                {activities.map((act) => {
                  let circleColor = "bg-slate-400";
                  
                  if (act.type === 'campaign_started') circleColor = "bg-blue-500";
                  else if (act.type === 'campaign_completed') circleColor = "bg-emerald-500";
                  else if (act.type === 'failed_delivery') circleColor = "bg-rose-500";
                  else if (act.type === 'contacts_synced') circleColor = "bg-amber-500";

                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline Pill Node */}
                      <span className={`absolute -left-[31px] top-1 flex h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-950 ${circleColor}`}></span>
                      
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {act.campaign_name || (act.type === 'contacts_synced' ? 'Odoo ERP Integration' : 'System Event')}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(act.timestamp)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                          {act.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </motion.div>
  );
}
