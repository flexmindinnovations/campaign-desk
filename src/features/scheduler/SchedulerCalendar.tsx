import * as React from "react";
import { useStore } from "../../store/useStore";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CalendarCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../components/ui/utils";
import { toast } from "../../components/ui/Toast";
import { cn } from "../../components/ui/utils";
import { DAYS_OF_WEEK } from "../../appConstant";

export function SchedulerCalendar() {
  const campaigns = useStore(state => state.campaigns);
  const updateCampaign = useStore(state => state.updateCampaign);

  const [currentView, setCurrentView] = React.useState<"month" | "week" | "day">("month");
  
  // Modal selection
  const [selectedEventId, setSelectedEventId] = React.useState<number | null>(null);
  
  const selectedEvent = campaigns.find(c => c.id === selectedEventId);

  // We seed the calendar around June 2026
  // June 2026 starts on a Monday. Let's make an elegant grid
  // June 2026 Mon June 1 to Sun June 30
  // Helper to place campaigns into days of June 2026
  // June 2026 Mon June 1 to Sun June 30
  const getDaysInMonth = () => {
    const days = [];
    for (let d = 1; d <= 30; d++) {
      // Find campaigns scheduled for this specific day of June 2026
      const scheduledOnDay = campaigns.filter(c => {
        const dateStr = c.scheduled_at || c.created_at;
        const date = new Date(dateStr);
        // Ensure month is June (5 in JS) and year is 2026
        return date.getMonth() === 5 && date.getFullYear() === 2026 && date.getDate() === d;
      });

      days.push({
        dayNumber: d,
        campaigns: scheduledOnDay
      });
    }
    return days;
  };

  const calendarDays = getDaysInMonth();

  const handleReschedule = (campaignId: number, daysToShift: number) => {
    const c = campaigns.find(item => item.id === campaignId);
    if (!c) return;

    // Shift scheduled_at by days
    const currentTarget = c.scheduled_at ? new Date(c.scheduled_at) : new Date();
    currentTarget.setDate(currentTarget.getDate() + daysToShift);
    
    updateCampaign(campaignId, { 
      scheduled_at: currentTarget.toISOString(),
      status: 'scheduled' as const 
    });

    toast.success(`Rescheduled campaign "${c.name}" to ${formatDate(currentTarget.toISOString())}`);
    setSelectedEventId(null);
  };

  const getCampaignCalendarColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'running': return 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30 animate-pulse';
      case 'scheduled': return 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';
      default: return 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-6 grid-bg-dots font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
            Dispatch Calendar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Drag-and-drop reschedule queues and organize delivery timing charts.
          </p>
        </div>

        {/* View togglers */}
        <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 w-fit shrink-0 select-none text-xs font-semibold">
          {([
            { id: "month", label: "Month" },
            { id: "week", label: "Week" },
            { id: "day", label: "Day" }
          ] as const).map((v) => (
            <button
              key={v.id}
              onClick={() => setCurrentView(v.id)}
              className={`px-4 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                currentView === v.id
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-50"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              {v.label}
            </button>
          )) }
        </div>
      </div>

      {/* Date Header selectors */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-emerald-500" size={18} />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-display">June 2026</h3>
          </div>

          <div className="flex gap-1.5">
            <button className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
              <ChevronLeft size={14} />
            </button>
            <button className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
              <ChevronRight size={14} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* MONTH GRID VIEW */}
      {currentView === "month" && (
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* Days of week header labels */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] text-center py-2 select-none">
            {DAYS_OF_WEEK.map(d => <span key={d}>{d}</span>)}
          </div>

          {/* Days grid cells */}
          <div className="grid grid-cols-7 grid-rows-5 divide-x divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/20 dark:bg-slate-950/10 min-h-[500px]">
            {calendarDays.map((day) => (
              <div 
                key={day.dayNumber} 
                className="p-2 flex flex-col justify-between hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors h-28"
              >
                {/* Date indicator */}
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 block mb-1.5 select-none font-mono">
                  {day.dayNumber}
                </span>

                {/* Day events cards */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
                  {day.campaigns.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedEventId(c.id)}
                      className={cn(
                        "p-1 rounded-md text-[9px] font-bold leading-tight truncate cursor-pointer select-none",
                        getCampaignCalendarColor(c.status)
                      )}
                      title={c.name}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* WEEK GRID VIEW */}
      {currentView === "week" && (
        <Card className="p-6">
          <div className="grid grid-cols-7 gap-4 min-h-[300px]">
            {calendarDays.slice(0, 7).map((day, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/20 h-72">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-2 mb-2 select-none">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{DAYS_OF_WEEK[idx]}</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">{day.dayNumber}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
                  {day.campaigns.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedEventId(c.id)}
                      className={cn(
                        "p-2 rounded-lg text-[9px] font-extrabold leading-normal cursor-pointer select-none",
                        getCampaignCalendarColor(c.status)
                      )}
                    >
                      <Clock size={9} className="inline mr-1" />
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* DAY VIEW */}
      {currentView === "day" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="min-h-[350px]">
              <CardHeader>
                <CardTitle>Schedule Queue for June 2, 2026</CardTitle>
                <CardDescription>Hour-by-hour message dispatch queues.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {calendarDays[1]?.campaigns.map((c) => (
                  <div 
                    key={c.id}
                    onClick={() => setSelectedEventId(c.id)}
                    className={cn(
                      "p-4 rounded-xl flex items-center justify-between cursor-pointer select-none",
                      getCampaignCalendarColor(c.status)
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold leading-none">{c.name}</h4>
                        <span className="text-[10px] opacity-75 font-mono mt-1.5 block">{c.topic}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px]">View Logs</Badge>
                  </div>
                )) || <p className="text-xs text-slate-400 text-center py-10">No campaigns scheduled for today.</p>}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Automation Details</CardTitle>
                <CardDescription>APScheduler thread parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-350">
                <div className="flex justify-between pb-1.5 border-b border-slate-50 dark:border-slate-850/50">
                  <span className="text-slate-400">Database Job Store</span>
                  <span className="font-mono">SQLAlchemy</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-50 dark:border-slate-850/50">
                  <span className="text-slate-400">Thread Count</span>
                  <span className="font-mono">5 Workers</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-50 dark:border-slate-850/50">
                  <span className="text-slate-400">Memory Allocation</span>
                  <span className="font-mono">In-Memory Store</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduler Daemon</span>
                  <span className="text-emerald-500 font-bold">ONLINE</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* EVENT RESCHEDULER DIALOG MODAL */}
      <AnimatePresence>
        {selectedEventId && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEventId(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs dark:bg-slate-950/50"
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-4 mb-4">
                <h3 className="text-md font-bold text-slate-900 dark:text-white font-display flex gap-2 items-center">
                  <CalendarCheck size={18} className="text-emerald-500" />
                  Campaign Automation Settings
                </h3>
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1 font-semibold">
                  <span className="text-slate-400">Campaign Name</span>
                  <p className="text-slate-850 dark:text-slate-200 text-sm font-bold font-display">{selectedEvent.name}</p>
                </div>

                <div className="space-y-1 font-semibold">
                  <span className="text-slate-400">WhatsApp Template</span>
                  <p className="font-mono text-emerald-600 dark:text-emerald-400">{selectedEvent.template_name}</p>
                </div>

                <div className="space-y-1 font-semibold">
                  <span className="text-slate-400">Scheduled Trigger</span>
                  <p className="font-mono text-slate-600 dark:text-slate-400">
                    {selectedEvent.scheduled_at ? formatDate(selectedEvent.scheduled_at) : "Send Now (Immediate)"}
                  </p>
                </div>

                {/* Reschedule buttons (Drag & Drop mockup replacement) */}
                {selectedEvent.status === 'scheduled' && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Reschedule Quick Actions (Drag & Drop Mock)
                    </span>
                    <div className="grid grid-cols-2 gap-2 font-bold">
                      <button
                        onClick={() => handleReschedule(selectedEvent.id, 1)}
                        className="py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750"
                      >
                        +1 Day Later
                      </button>
                      <button
                        onClick={() => handleReschedule(selectedEvent.id, 7)}
                        className="py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750"
                      >
                        +1 Week Later
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
