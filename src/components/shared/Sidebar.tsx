import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Send, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Calendar, 
  Sparkles, 
  Layers, 
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../ui/utils";
import { useStore } from "../../store/useStore";
import { Tooltip } from "../ui/Tooltip";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarCollapsed = useStore(state => state.sidebarCollapsed);
  const toggleSidebarCollapse = useStore(state => state.toggleSidebarCollapse);

  const getActiveTab = () => {
    const path = location.pathname.substring(1);
    if (!path) return "dashboard";
    return path.split("/")[0];
  };

  const activeTab = getActiveTab();

  const menuItems: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'templates', label: 'Templates', icon: MessageSquare },
    // { id: 'message-center', label: 'Inbox / Chat', icon: Inbox, badge: 'Simulated' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'scheduler', label: 'Scheduler', icon: Calendar },
    // { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Core Shell */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-all duration-300 border-r border-slate-200 dark:border-slate-900 lg:relative lg:translate-x-0",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64",
          isOpen ? "w-64 translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Absolute Floating Collapse Button on Sidebar Edge (Reddit-style) */}
        <Tooltip content={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"} side="right">
          <button
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex absolute top-5 -right-3 z-50 items-center justify-center w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-md cursor-pointer transition-all duration-200 focus:outline-none"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={12} />
            ) : (
              <ChevronLeft size={12} />
            )}
          </button>
        </Tooltip>

        {/* Workspace Brand Header */}
        <div className={cn(
          "flex items-center h-16 border-b border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 transition-all duration-300",
          sidebarCollapsed ? "justify-center px-4" : "justify-between px-6"
        )}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Layers size={18} />
            </div>
            <div className={cn(
              "flex flex-col transition-all duration-300",
              sidebarCollapsed ? "lg:hidden opacity-0 w-0" : "opacity-100 w-auto"
            )}>
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display leading-tight tracking-tight whitespace-nowrap">
                Bulk Sender
              </h1>
              <p className="text-[10px] text-emerald-650 dark:text-emerald-400 font-mono tracking-wider font-semibold uppercase leading-none whitespace-nowrap">
                SaaS Enterprise
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Switcher Card */}
        <div className={cn("py-3 border-b border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/50 transition-all duration-300", sidebarCollapsed ? "px-2" : "px-4")}>
          <div className={cn(
            "flex items-center rounded-lg transition-all duration-300",
            sidebarCollapsed 
              ? "lg:bg-transparent lg:border-transparent lg:justify-center p-1" 
              : "bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2 gap-3 shadow-xs"
          )}>
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold text-xs shadow-xs">
              FI
            </div>
            <div className={cn(
              "flex-1 min-w-0 transition-all duration-300",
              sidebarCollapsed ? "lg:hidden" : "block"
            )}>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none mb-1">
                Flexmind Innovations
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-none">
                  WhatsApp API Connected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Link Menu */}
        <nav className={cn("flex-1 py-4 space-y-1.5 overflow-y-auto transition-all duration-300", sidebarCollapsed ? "px-2" : "px-3")}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            const buttonElement = (
              <button
                key={item.id}
                onClick={() => {
                  navigate(`/${item.id}`);
                  setIsOpen(false);
                }}
                className={cn(
                  "relative flex items-center w-full py-2.5 text-xs font-semibold rounded-lg group transition-all duration-200 cursor-pointer focus:outline-none border border-transparent",
                  sidebarCollapsed ? "lg:justify-center lg:px-0" : "px-3 justify-between",
                  isActive
                    ? "text-emerald-600 bg-white border border-slate-200 shadow-sm dark:border-transparent dark:text-slate-50 dark:bg-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:text-slate-200 dark:hover:bg-slate-900/30"
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute left-0 w-1 h-5 rounded-r-md bg-emerald-500"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}

                <div className={cn("flex items-center gap-3", sidebarCollapsed ? "lg:justify-center" : "")}>
                  <Icon 
                    size={16} 
                    className={cn(
                      "transition-colors duration-200 shrink-0",
                      isActive 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    )} 
                  />
                  <span className={cn("transition-all duration-350 whitespace-nowrap", sidebarCollapsed ? "lg:hidden" : "")}>
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-[9px] rounded-md font-mono bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 font-bold leading-none shrink-0 whitespace-nowrap",
                    sidebarCollapsed ? "lg:hidden" : ""
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );

            return sidebarCollapsed ? (
              <Tooltip key={item.id} content={item.label} side="right">
                {buttonElement}
              </Tooltip>
            ) : (
              buttonElement
            );
          })}

          {/* AI Feature Locked Link Card */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-900">
            {(() => {
              const aiButtonElement = (
                <button
                  onClick={() => {
                    navigate('/ai-ready');
                    setIsOpen(false);
                  }}
                  className={cn(
                    "relative flex items-center w-full py-2.5 text-xs font-bold rounded-lg border cursor-pointer focus:outline-none transition-all duration-350 group",
                    sidebarCollapsed ? "lg:justify-center lg:px-0 lg:border-transparent lg:bg-transparent" : "px-3 justify-between",
                    activeTab === 'ai-ready'
                      ? "bg-emerald-50 border-emerald-500/30 text-emerald-600 shadow-sm dark:bg-slate-900/70 dark:text-emerald-400 dark:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : "bg-white/40 border-slate-200 text-slate-600 hover:bg-white hover:text-emerald-600 dark:bg-slate-950/20 dark:border-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-emerald-400"
                  )}
                >
                  <div className={cn("flex items-center gap-3", sidebarCollapsed ? "lg:justify-center" : "")}>
                    <Sparkles size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0 animate-pulse" />
                    <span className={cn("transition-all duration-350 whitespace-nowrap", sidebarCollapsed ? "lg:hidden" : "")}>AI Upgrade Hub</span>
                  </div>
                  <span className={cn(
                    "px-1.5 py-0.5 text-[9px] rounded-md font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase leading-none tracking-wide animate-pulse shrink-0 whitespace-nowrap",
                    sidebarCollapsed ? "lg:hidden" : ""
                  )}>
                    Upgrade
                  </span>
                </button>
              );

              return sidebarCollapsed ? (
                <Tooltip content="AI Upgrade Hub" side="right">
                  {aiButtonElement}
                </Tooltip>
              ) : (
                aiButtonElement
              );
            })()}
          </div>
        </nav>

        {/* Administrator Profile Card */}
        <div className={cn("p-4 border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 transition-all duration-300", sidebarCollapsed ? "lg:px-2" : "")}>
          <div className={cn("flex items-center", sidebarCollapsed ? "lg:justify-center" : "gap-3")}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
              alt="Admin User Avatar"
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 object-cover shrink-0"
            />
            <div className={cn(
              "flex-1 min-w-0 transition-all duration-300",
              sidebarCollapsed ? "lg:hidden" : "block"
            )}>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight whitespace-nowrap">
                Mohammad Imran
              </p>
              <p className="text-[10px] text-slate-550 dark:text-slate-500 truncate leading-none mt-0.5 whitespace-nowrap">
                imran@flexmind.in
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
