import * as React from "react";
import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Play,
  Pause,
  XOctagon,
  Copy,
  Trash2,
  Calendar
} from "lucide-react";
import { DataTable, type ColumnDef } from "../../components/ui/DataTable";
import { Tooltip } from "../../components/ui/Tooltip";
import { getCampaignStatusBadge } from "../../components/ui/Badge";
import { formatDate, formatNumber } from "../../components/ui/utils";
import { toast } from "../../components/ui/Toast";
import { CampaignBuilder } from "./CampaignBuilder";
import type { Campaign } from "../../types/database";

export function CampaignList() {
  const navigate = useNavigate();
  const campaigns = useStore(state => state.campaigns);
  const startCampaign = useStore(state => state.startCampaign);
  const pauseCampaign = useStore(state => state.pauseCampaign);
  const cancelCampaign = useStore(state => state.cancelCampaign);
  const duplicateCampaign = useStore(state => state.duplicateCampaign);
  const deleteCampaign = useStore(state => state.deleteCampaign);
  const getCampaignAnalytics = useStore(state => state.getCampaignAnalytics);
  const startPollingCampaigns = useStore(state => state.startPollingCampaigns);
  const stopPollingCampaigns = useStore(state => state.stopPollingCampaigns);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);

  React.useEffect(() => {
    startPollingCampaigns();
    return () => stopPollingCampaigns();
  }, [startPollingCampaigns, stopPollingCampaigns]);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          campaign.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          campaign.template_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStart = (id: number, name: string) => {
    startCampaign(id);
    toast.success(`Launched campaign "${name}"! Processing background queue.`);
  };

  const handlePause = (id: number, name: string) => {
    pauseCampaign(id);
    toast.info(`Paused campaign "${name}".`);
  };

  const handleCancel = (id: number, name: string) => {
    cancelCampaign(id);
    toast.warning(`Cancelled campaign "${name}".`);
  };

  const handleDuplicate = (id: number, name: string) => {
    duplicateCampaign(id);
    toast.success(`Duplicated campaign "${name}".`);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the campaign "${name}"?`)) {
      deleteCampaign(id);
      toast.error(`Deleted campaign "${name}".`);
    }
  };

  const campaignColumns = React.useMemo<ColumnDef<Campaign>[]>(() => [
    {
      key: 'name',
      header: 'Campaign Name',
      defaultPin: 'left',
      minWidth: 200,
      cell: (c) => (
        <div className="flex flex-col">
          <span className="font-display text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs">{c.name}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-xs font-normal mt-0.5">{c.topic}</span>
        </div>
      ),
      sortValue: (c) => c.name,
    },
    {
      key: 'template_name',
      header: 'WhatsApp Template',
      minWidth: 160,
      cell: (c) => (
        <code className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200/50 dark:bg-slate-900/80 dark:text-emerald-400 dark:border-emerald-500/20 px-2 py-0.5 rounded">
          {c.template_name}
        </code>
      ),
      sortValue: (c) => c.template_name,
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 110,
      cell: (c) => getCampaignStatusBadge(c.status),
      sortValue: (c) => c.status,
    },
    {
      key: 'contacts',
      header: 'Contacts',
      className: 'text-center',
      minWidth: 90,
      cell: (c) => <span className="font-semibold">{formatNumber(getCampaignAnalytics(c.id)?.total_contacts || 0)}</span>,
      sortValue: (c) => getCampaignAnalytics(c.id)?.total_contacts ?? 0,
    },
    {
      key: 'sent',
      header: 'Sent',
      className: 'text-center',
      minWidth: 80,
      cell: (c) => <span className="font-mono font-bold">{formatNumber(getCampaignAnalytics(c.id)?.sent || 0)}</span>,
      sortValue: (c) => getCampaignAnalytics(c.id)?.sent ?? 0,
    },
    {
      key: 'delivered',
      header: 'Delivered',
      className: 'text-center text-blue-500',
      minWidth: 90,
      cell: (c) => <span className="font-mono font-bold">{formatNumber(getCampaignAnalytics(c.id)?.delivered || 0)}</span>,
      sortValue: (c) => getCampaignAnalytics(c.id)?.delivered ?? 0,
    },
    {
      key: 'read',
      header: 'Read',
      className: 'text-center text-emerald-500',
      minWidth: 80,
      cell: (c) => <span className="font-mono font-bold">{formatNumber(getCampaignAnalytics(c.id)?.read || 0)}</span>,
      sortValue: (c) => getCampaignAnalytics(c.id)?.read ?? 0,
    },
    {
      key: 'created_at',
      header: 'Created Date',
      minWidth: 130,
      cell: (c) => <span className="font-mono text-slate-400">{formatDate(c.created_at)}</span>,
      sortValue: (c) => c.created_at,
    },
    {
      key: 'actions',
      header: 'Actions',
      defaultPin: 'right',
      minWidth: 145,
      className: 'text-right whitespace-nowrap',
      cell: (c) => <CampaignRowActions campaign={c} {...{ handleStart, handlePause, handleCancel, handleDuplicate, handleDelete, navigate }} />,
    },
  ], [getCampaignAnalytics, handleStart, handlePause, handleCancel, handleDuplicate, handleDelete, navigate]);

  const filterBar = (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search campaigns by name, topic, or template..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:bg-slate-900"
        />
      </div>
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        {['all', 'draft', 'scheduled', 'running', 'completed', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer border ${
              statusFilter === status
                ? "bg-slate-900 text-slate-100 border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800/80"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 grid-bg-dots">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
            Campaign Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Launch, schedule, monitor, and configure bulk WhatsApp templates dispatches.
          </p>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-200 cursor-pointer shrink-0"
        >
          <Plus size={15} />
          New Campaign
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        tableId="campaign-list"
        data={filteredCampaigns}
        columns={campaignColumns}
        rowKey={(c) => c.id}
        animate={true}
        defaultPageSize={20}
        toolbarLeft={filterBar}
        emptyState={() => (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Calendar size={32} className="text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No campaigns match your filters.</p>
            <p className="text-xs text-slate-400">Click "New Campaign" to construct a new WhatsApp marketing flow.</p>
          </div>
        )}
      />

      {/* Campaign Builder Wizard Overlay Modal */}
      <CampaignBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
      />
    </div>
  );
}

interface CampaignRowActionsProps {
  campaign: Campaign;
  handleStart: (id: number, name: string) => void;
  handlePause: (id: number, name: string) => void;
  handleCancel: (id: number, name: string) => void;
  handleDuplicate: (id: number, name: string) => void;
  handleDelete: (id: number, name: string) => void;
  navigate: (path: string) => void;
}

function CampaignRowActions({
  campaign: c,
  handleStart,
  handlePause,
  handleCancel,
  handleDuplicate,
  handleDelete,
  navigate,
}: CampaignRowActionsProps) {
  const isRunning = c.status === 'running';

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Tooltip content="View Analytics & Logs" side="top">
        <button
          type="button"
          onClick={() => navigate(`/campaigns/${c.id}`)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer inline-flex items-center justify-center shrink-0"
          aria-label="View Analytics & Logs"
        >
          <Eye size={13} />
        </button>
      </Tooltip>

      {isRunning ? (
        <Tooltip content="Pause Campaign" side="top">
          <button
            type="button"
            onClick={() => handlePause(c.id, c.name)}
            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-600 dark:border-blue-900/30 dark:bg-blue-500/10 dark:text-blue-400 cursor-pointer inline-flex items-center justify-center shrink-0"
            aria-label="Pause Campaign"
          >
            <Pause size={13} />
          </button>
        </Tooltip>
      ) : (
        c.status !== 'completed' && (
          <Tooltip content="Start Campaign" side="top">
            <button
              type="button"
              onClick={() => handleStart(c.id, c.name)}
              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer inline-flex items-center justify-center shrink-0"
              aria-label="Start Campaign"
            >
              <Play size={13} />
            </button>
          </Tooltip>
        )
      )}

      {(c.status === 'running' || c.status === 'scheduled') && (
        <Tooltip content="Cancel Campaign" side="top">
          <button
            type="button"
            onClick={() => handleCancel(c.id, c.name)}
            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 dark:border-rose-900/30 dark:bg-rose-500/10 dark:text-rose-400 cursor-pointer inline-flex items-center justify-center shrink-0"
            aria-label="Cancel Campaign"
          >
            <XOctagon size={13} />
          </button>
        </Tooltip>
      )}

      <Tooltip content="Duplicate Campaign" side="top">
        <button
          type="button"
          onClick={() => handleDuplicate(c.id, c.name)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer inline-flex items-center justify-center shrink-0"
          aria-label="Duplicate Campaign"
        >
          <Copy size={13} />
        </button>
      </Tooltip>

      {c.status === 'draft' && (
        <Tooltip content="Delete Campaign" side="top">
          <button
            type="button"
            onClick={() => handleDelete(c.id, c.name)}
            className="p-1.5 rounded-lg border border-rose-100 hover:bg-rose-50 text-rose-500 dark:border-rose-900/30 dark:hover:bg-rose-950/20 cursor-pointer inline-flex items-center justify-center shrink-0"
            aria-label="Delete Campaign"
          >
            <Trash2 size={13} />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
