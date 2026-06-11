import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import { useStore } from "../../store/useStore";
import type { CampaignMessage, Campaign } from "../../types/database";

interface ChartWrapperProps {
  height?: number;
}

const getDailyDeliveryData = (messages: CampaignMessage[]) => {
  if (!messages.length) return [];

  const dailyStats: Record<string, { sent: number; delivered: number; read: number }> = {};

  messages.forEach(msg => {
    if (msg.campaign_id === 9999 || !msg.sent_at) return;

    const date = new Date(msg.sent_at);
    const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!dailyStats[day]) {
      dailyStats[day] = { sent: 0, delivered: 0, read: 0 };
    }

    if (msg.delivery_status !== 'pending') {
      dailyStats[day].sent += 1;
    }
    if (msg.delivery_status === 'delivered' || msg.delivery_status === 'read') {
      dailyStats[day].delivered += 1;
    }
    if (msg.delivery_status === 'read') {
      dailyStats[day].read += 1;
    }
  });

  return Object.entries(dailyStats)
    .map(([day, stats]) => ({ day, ...stats }))
    .slice(-7);
};

const getCampaignComparisonData = (campaigns: Campaign[], messages: CampaignMessage[]) => {
  if (!campaigns.length) return [];

  return campaigns.slice(0, 5).map(campaign => {
    const campaignMessages = messages.filter(m => m.campaign_id === campaign.id && m.campaign_id !== 9999);
    const sent = campaignMessages.filter(m => m.delivery_status !== 'pending').length;
    const delivered = campaignMessages.filter(m => m.delivery_status === 'delivered' || m.delivery_status === 'read').length;
    const read = campaignMessages.filter(m => m.delivery_status === 'read').length;

    const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100) : 0;
    const readRate = delivered > 0 ? Math.round((read / delivered) * 100) : 0;

    return {
      name: campaign.name,
      deliveryRate,
      readRate
    };
  });
};

export function DeliveryAreaChart({ height = 300 }: ChartWrapperProps) {
  const messages = useStore(state => state.messages);
  const data = getDailyDeliveryData(messages);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data.length > 0 ? data : []}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
          <XAxis 
            dataKey="day" 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false} 
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "12px",
              fontFamily: "Inter"
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "Inter" }} />
          <Area
            type="monotone"
            dataKey="delivered"
            name="Delivered"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDelivered)"
          />
          <Area
            type="monotone"
            dataKey="read"
            name="Read"
            stroke="#22C55E"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRead)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SendingVolumeBarChart({ height = 300 }: ChartWrapperProps) {
  const messages = useStore(state => state.messages);
  const data = getDailyDeliveryData(messages);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data.length > 0 ? data : []}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
          <XAxis 
            dataKey="day" 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false} 
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "12px",
              fontFamily: "Inter"
            }}
          />
          <Bar 
            dataKey="sent" 
            name="Sent Messages" 
            fill="#22C55E" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyTrendLineChart({ height = 300 }: ChartWrapperProps) {
  const messages = useStore(state => state.messages);
  const data = getDailyDeliveryData(messages);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data.length > 0 ? data : []}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
          <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "12px",
              fontFamily: "Inter"
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Line 
            type="monotone" 
            dataKey="sent" 
            name="Sent" 
            stroke="#22C55E" 
            strokeWidth={3} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="delivered" 
            name="Delivered" 
            stroke="#3B82F6" 
            strokeWidth={2} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CampaignComparisonBarChart({ height = 300 }: ChartWrapperProps) {
  const campaigns = useStore(state => state.campaigns);
  const messages = useStore(state => state.messages);
  const data = getCampaignComparisonData(campaigns, messages);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data.length > 0 ? data : []}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "12px",
              fontFamily: "Inter"
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Bar dataKey="deliveryRate" name="Delivery Rate %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="readRate" name="Read Rate %" fill="#22C55E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
