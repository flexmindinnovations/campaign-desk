import * as React from "react";
import { useStore } from "./store/useStore";
import { Sidebar } from "./components/shared/Sidebar";
import { Header } from "./components/shared/Header";
import { ToastContainer } from "./components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Features import
import { Dashboard } from "./features/dashboard/Dashboard";
import { CampaignList } from "./features/campaigns/CampaignList";
import { CampaignDetail } from "./features/campaigns/CampaignDetail";
import { ContactsList } from "./features/contacts/ContactsList";
import { TemplatesGallery } from "./features/templates/TemplatesGallery";
import { MessageCenter } from "./features/message-center/MessageCenter";
import { AnalyticsDashboard } from "./features/analytics/AnalyticsDashboard";
import { SchedulerCalendar } from "./features/scheduler/SchedulerCalendar";
import { SettingsPanel } from "./features/settings/SettingsPanel";
import { AIUpgradePanel } from "./features/ai-ready/AIUpgradePanel";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const initStore = useStore(state => state.initStore);
  const theme = useStore(state => state.theme);
  const location = useLocation();

  React.useEffect(() => {
    initStore();
  }, [initStore]);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen w-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* SaaS Premium Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main View Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dynamic Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic page viewport with smooth entry transitions */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.26, ease: [0.25, 1, 0.5, 1], delay: 0.05 } 
              }}
              exit={{ 
                opacity: 0, 
                y: -8,
                transition: { duration: 0.15, ease: [0.25, 0, 0.75, 0] } 
              }}
              className="h-full"
            >
              <Routes location={location}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/campaigns" element={<CampaignList />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/contacts" element={<ContactsList />} />
                <Route path="/templates" element={<TemplatesGallery />} />
                <Route path="/message-center" element={<MessageCenter />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/scheduler" element={<SchedulerCalendar />} />
                <Route path="/settings" element={<SettingsPanel />} />
                <Route path="/ai-ready" element={<AIUpgradePanel />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Toast notifications mounted at bottom-right */}
      <ToastContainer />
    </div>
  );
}
