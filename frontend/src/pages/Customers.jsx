import { useEffect, useState } from "react";
import { getCustomers } from "../services/api.js";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getCustomers();
        if (!cancelled) setCustomers(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Failed to load customers: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Customers</h2>

      {customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No customers yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Phone</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">ID</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-700">{customer.name}</td>
                  <td className="px-5 py-3 text-gray-600">{customer.phone}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{customer.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Customers;
