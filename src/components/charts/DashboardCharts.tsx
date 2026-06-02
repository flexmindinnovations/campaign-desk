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

// 7-day mock delivery data
const DAILY_DELIVERY_DATA = [
  { day: "May 27", sent: 120, delivered: 115, read: 82 },
  { day: "May 28", sent: 150, delivered: 142, read: 98 },
  { day: "May 29", sent: 180, delivered: 175, read: 125 },
  { day: "May 30", sent: 140, delivered: 138, read: 110 },
  { day: "May 31", sent: 210, delivered: 202, read: 152 },
  { day: "Jun 01", sent: 250, delivered: 245, read: 198 },
  { day: "Jun 02", sent: 290, delivered: 282, read: 210 }
];

// Campaign comparison data
const CAMPAIGN_COMPARING_DATA = [
  { name: "Promo Q1", deliveryRate: 98, readRate: 85 },
  { name: "Sale Alert", deliveryRate: 95, readRate: 78 },
  { name: "Tax Invoice", deliveryRate: 92, readRate: 64 },
  { name: "Pay Link", deliveryRate: 88, readRate: 58 },
  { name: "HelloWorld", deliveryRate: 99, readRate: 92 }
];

interface ChartWrapperProps {
  height?: number;
}

export function DeliveryAreaChart({ height = 300 }: ChartWrapperProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={DAILY_DELIVERY_DATA}
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
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={DAILY_DELIVERY_DATA}
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
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={DAILY_DELIVERY_DATA}
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
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={CAMPAIGN_COMPARING_DATA}
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
