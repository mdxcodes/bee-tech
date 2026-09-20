import { useState } from "react";
import { Save } from "lucide-react";

function Settings() {
  const [lowStockThreshold, setLowStockThreshold] = useState(12);
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState("Kirana Store");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
          <input
            type="number"
            min="1"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
          <p className="text-xs text-gray-400 mt-1">Products with stock below this value are flagged as low stock.</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-ocean-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ocean-700 transition-colors"
          >
            <Save size={16} />
            Save Settings
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-3">About</h3>
        <p className="text-sm text-gray-500">
          HACK IT BROS &apos;26 — Track 1: Autonomous AI &amp; Agentic Workflows
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Zero-Click Store Operator — Kirana Store AI Operator Dashboard
        </p>
      </div>
    </div>
  );
}

export default Settings;
