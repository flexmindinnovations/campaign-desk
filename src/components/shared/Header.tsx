import * as React from "react";
import { useStore } from "../../store/useStore";
import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon, RefreshCw } from "lucide-react";
import { toast } from "../ui/Toast";
import { cn } from "../ui/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const syncOdooContacts = useStore(state => state.syncOdooContacts);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const getActiveTab = () => {
    const path = location.pathname.substring(1);
    if (!path) return "dashboard";
    return path.split("/")[0];
  };

  const activeTab = getActiveTab();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return { category: 'Analytics', page: 'Dashboard' };
      case 'campaigns': {
        const pathSegments = location.pathname.split("/").filter(Boolean);
        if (pathSegments.length > 1 && pathSegments[0] === 'campaigns') {
          return { category: 'Campaigns', page: 'Campaign Detail' };
        }
        return { category: 'Campaigns', page: 'Directory' };
      }
      case 'contacts': return { category: 'CRM', page: 'Contacts List' };
      case 'templates': return { category: 'Meta Account', page: 'WhatsApp Templates' };
      case 'message-center': return { category: 'Support', page: 'Inbox Center' };
      case 'analytics': return { category: 'Reports', page: 'Delivery Trends' };
      case 'scheduler': return { category: 'Automation', page: 'Campaign Calendar' };
      case 'settings': return { category: 'Configuration', page: 'Integration Settings' };
      case 'ai-ready': return { category: 'Add-ons', page: 'AI Upgrade Hub' };
      default: return { category: 'Platform', page: 'Workspace' };
    }
  };

  const breadcrumb = getBreadcrumb();

  const handleSyncClick = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    toast.info("Connecting to Odoo ERP server via XML-RPC...");
    
    try {
      const result = await syncOdooContacts();
      toast.success(`ERP synchronization successful! Synced ${result.total_synced} contacts (Created ${result.created}, Updated ${result.updated}).`);
    } catch (e) {
      toast.error("Odoo Sync failed: ERP Connection timeout.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      {/* Mobile Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3 lg:pl-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center text-xs font-semibold gap-1.5 text-slate-400 dark:text-slate-500 font-sans">
          <span className="truncate">{breadcrumb.category}</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 truncate font-bold font-display">{breadcrumb.page}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        
        {/* API Health Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono">Meta API Active</span>
        </div>

        {/* Odoo ERP Synchronizer Widget */}
        <button
          onClick={handleSyncClick}
          disabled={isSyncing}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-xs transition-all cursor-pointer",
            isSyncing 
              ? "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500" 
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
          )}
        >
          <RefreshCw 
            size={13} 
            className={cn("text-emerald-500", isSyncing && "animate-spin")} 
          />
          <span className="hidden md:inline">Sync Odoo</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}
