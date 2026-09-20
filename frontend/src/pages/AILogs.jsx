import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { getAILogs } from "../services/api.js";

function AILogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getAILogs();
        if (!cancelled) setLogs(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const groupedLogs = sortedLogs.reduce((groups, log) => {
    if (!groups[log.order_id]) groups[log.order_id] = [];
    groups[log.order_id].push(log);
    return groups;
  }, {});

  const allActions = [
    "Received order",
    "Understood customer request",
    "Identified products",
    "Checked inventory",
    "Calculated order total",
    "Created order",
    "Updated inventory",
    "Updated order status",
    "Sent confirmation",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-ocean-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Failed to load AI logs: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">AI Agent Workflow Logs</h2>
        <span className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-700 font-medium">Agent Active</span>
        </span>
      </div>

      {/* Workflow Steps Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Autonomous Workflow Pipeline</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {allActions.map((action, i) => (
            <div key={action} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-palm-light/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 size={20} className="text-green-600" />
              </div>
              <p className="text-xs font-medium text-gray-600 leading-tight">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Logs */}
      <div className="space-y-6">
        {Object.entries(groupedLogs).map(([orderId, orderLogs]) => (
          <div key={orderId} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock size={16} className="text-ocean-600" />
              <h3 className="font-semibold text-gray-800">Order: {orderId}</h3>
              <span className="ml-auto text-xs text-gray-400">{orderLogs.length} events</span>
            </div>
            <div className="p-5">
              {orderLogs.map((log, index) => (
                <div key={log.id} className="flex items-start gap-4 relative">
                  {/* Vertical line */}
                  {index < orderLogs.length - 1 && (
                    <div className="absolute left-[9px] top-5 w-px bg-ocean-200 h-[calc(100%-12px)]" />
                  )}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${log.status === "success" ? "bg-palm-light/20" : "bg-red-100"}`}>
                    {log.status === "success" ? (
                      <CheckCircle2 size={14} className="text-green-600" />
                    ) : (
                      <span className="text-red-600 text-xs">✕</span>
                    )}
                  </div>
                  <div className="pb-5 last:pb-0">
                    <p className="text-sm font-medium text-gray-700">{log.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(log.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400">No AI logs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AILogs;
