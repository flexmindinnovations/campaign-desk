import { 
  Sparkles, 
  Lock, 
  Bot, 
  PenTool, 
  MessageSquare,
  Wand2,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { toast } from "../../components/ui/Toast";

export function AIUpgradePanel() {
  
  const handleUnlockClick = () => {
    toast.success("Redirecting to Stripe secure checkout panel...");
    setTimeout(() => {
      toast.info("Mock payment gateway verified: Plan upgraded successfully!");
    }, 2000);
  };

  const aiFeatures = [
    {
      title: "AI Interactive Chatbot",
      desc: "Autonomously parse, evaluate, and reply to incoming client WhatsApp texts by hooking directly to custom OpenAI/Claude knowledgebases.",
      icon: Bot,
      status: "Beta Ready"
    },
    {
      title: "AI Campaign Generator",
      desc: "Provide a simple topic brief (e.g. 'collect Q2 payments from late manual accounts') and let the AI compile, structure, and suggest optimized dispatches.",
      icon: Wand2,
      status: "Pipeline"
    },
    {
      title: "AI Template Writer",
      desc: "Draft highly compelling, Meta-compliant WhatsApp templates within seconds, optimized for high click-through rates and delivery approvals.",
      icon: PenTool,
      status: "Meta Ready"
    },
    {
      title: "AI Support Agent Integration",
      desc: "Escalate complex client questions directly to human support staff, keeping a live ledger of Odoo partner logs synchronized in the background.",
      icon: MessageSquare,
      status: "Beta Ready"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-5xl mx-auto space-y-8 font-sans grid-bg-lines text-xs font-semibold"
    >
      
      {/* Visual Locked Neon Banner Card */}
      <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] grid-bg-dots">
        
        {/* Glow particles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-[80px]" />
        
        <div className="space-y-4 max-w-lg relative z-10 text-center md:text-left">
          <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider text-[10px] animate-pulse">
            Enterprise Add-on
          </Badge>
          
          <h1 className="text-3xl md:text-4xl font-extrabold font-display leading-tight tracking-tight text-white flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2.5">
            <Sparkles className="text-emerald-400 animate-pulse shrink-0" size={32} />
            Elevate with AI-ready CMS
          </h1>
          
          <p className="text-slate-400 text-sm leading-relaxed font-sans font-normal">
            Supercharge your bulk sending with autonomous customer support, smart personalized template variables generator, and contextual webhook auto-responders.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 text-[11px] font-sans font-normal text-slate-350">
            <div className="flex items-center justify-center md:justify-start gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>Full XML-RPC Odoo Sync</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>Personalized variables write</span>
            </div>
          </div>
        </div>

        {/* CTA Unlock Button Card */}
        <div className="relative z-10 w-full md:w-auto shrink-0 flex flex-col items-center">
          <button
            onClick={handleUnlockClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-black text-slate-950 bg-white hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] rounded-xl shadow-2xl transition-all cursor-pointer font-display tracking-wide"
          >
            <Cpu size={15} className="animate-spin text-emerald-500" />
            Unlock AI features
          </button>
          <span className="text-[10px] text-slate-500 mt-2 font-sans font-normal">Only $49/month — cancel anytime.</span>
        </div>
      </div>

      {/* Grid of future locked visual features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiFeatures.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="relative overflow-hidden group border-slate-200/60 dark:border-slate-800">
                
                {/* Visual Lock Overlay Panel */}
                <div className="absolute inset-0 bg-slate-50/10 backdrop-blur-[1px] dark:bg-slate-950/20 z-10" />

                <CardContent className="p-6 relative z-0 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-500 group-hover:scale-110 transition-transform">
                        <Icon size={18} />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm font-display">{feat.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      <Badge variant="outline" className="text-[8px] tracking-wide uppercase font-mono font-bold">
                        {feat.status}
                      </Badge>
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center dark:bg-slate-100 dark:text-slate-900 shadow-sm shrink-0">
                        <Lock size={11} className="animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-normal">
                    {feat.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
}
