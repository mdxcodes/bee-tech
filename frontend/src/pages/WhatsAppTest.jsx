import { useState, useEffect } from "react";
import { Send, CheckCircle2, XCircle, MessageSquare } from "lucide-react";

function WhatsAppTest() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("Hello from Kirana Store AI Operator! 🛒");
  const [to, setTo] = useState("+15551885299");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${API_URL}/whatsapp/status`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ configured: false, error: "Backend unreachable" });
    }
  };

  const sendMessage = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${API_URL}/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendTest = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${API_URL}/whatsapp/test`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800">WhatsApp Integration</h2>

      {/* Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Connection Status</p>
            <div className="flex items-center gap-2 mt-1">
              {status?.configured ? (
                <>
                  <CheckCircle2 size={18} className="text-palm-DEFAULT" />
                  <span className="text-sm font-semibold text-gray-900">Connected</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-red-500" />
                  <span className="text-sm font-semibold text-gray-900">Not Configured</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={fetchStatus}
            className="text-xs bg-ocean-50 text-ocean-700 px-3 py-1.5 rounded-lg border border-ocean-200 hover:bg-ocean-100"
          >
            Refresh
          </button>
        </div>

        {status && (
          <div className="mt-4 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Phone Number ID</span>
              <span className="font-mono">{status.phone_number_id || "not set"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Test Number</span>
              <span className="font-mono">{status.test_number}</span>
            </div>
          </div>
        )}
      </div>

      {/* Send Message */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare size={18} className="text-ocean-600" />
          Send WhatsApp Message
        </h3>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To (Phone Number)</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="flex items-center gap-2 bg-ocean-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ocean-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
            Send Message
          </button>
          <button
            onClick={sendTest}
            disabled={loading}
            className="bg-white text-ocean-700 border border-ocean-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-ocean-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Send Test Message
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">Message Sent Successfully</p>
          <pre className="text-xs text-green-700 bg-green-100/50 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Setup Instructions */}
      {!status?.configured && (
        <div className="bg-sand-100 border border-sand-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Setup Instructions</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>To enable WhatsApp integration, add these to <code className="bg-sand-200 px-1.5 py-0.5 rounded text-xs">database/.env</code>:</p>
            <pre className="bg-sand-200 rounded-lg p-3 text-xs overflow-x-auto">
{`WHATSAPP_ACCESS_TOKEN=<your_access_token>
WHATSAPP_PHONE_NUMBER_ID=<your_phone_number_id>
WHATSAPP_TEST_NUMBER=+15551885299
WHATSAPP_WEBHOOK_VERIFY_TOKEN=kirana_webhook_token`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              Note: The access token is stored in <code className="bg-sand-200 px-1 rounded text-xs">database/.env</code> which is gitignored.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatsAppTest;
