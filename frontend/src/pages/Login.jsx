import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, User, Lock, Eye, EyeOff } from "lucide-react";
import { login, ROLES, getCurrentUser } from "../services/auth.js";

function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate(user.role === "owner" ? "/dashboard" : "/chat", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await login(identifier, password, role);
      if (result.success) {
        navigate(role === ROLES.CUSTOMER ? "/chat" : "/dashboard", { replace: true });
      } else {
        setError(result.message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showDemoHint = () => {
    if (role === ROLES.CUSTOMER) {
      setHint("Demo: Enter any phone/name + password 'password'");
    } else {
      setHint("Demo: Enter any name + password 'password'");
    }
    setTimeout(() => setHint(""), 5000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-100 to-sand-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-ocean-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Store size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Kirana Store AI</h1>
            <p className="text-sm text-gray-500 mt-1">Zero-Click Store Operator</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setRole(ROLES.CUSTOMER); showDemoHint(); }}
                  className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                    role === ROLES.CUSTOMER ? "border-ocean-600 bg-ocean-50 text-ocean-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <User size={16} className="inline mr-1.5" />
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => { setRole(ROLES.OWNER); showDemoHint(); }}
                  className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                    role === ROLES.OWNER ? "border-ocean-600 bg-ocean-50 text-ocean-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Store size={16} className="inline mr-1.5" />
                  Store Owner
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {role === ROLES.CUSTOMER ? "Phone Number / Name" : "Owner Name / ID"}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === ROLES.CUSTOMER ? "9876543210 or Rajesh" : "Owner name or ID"}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {hint && (
              <div className="bg-ocean-50 border border-ocean-200 rounded-lg px-3 py-2">
                <p className="text-xs text-ocean-700">{hint}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ocean-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-ocean-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              HACK IT BROS &apos;26 — Track 1: Autonomous AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
