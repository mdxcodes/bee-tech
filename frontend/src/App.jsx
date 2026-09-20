import { Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./services/auth.js";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Orders from "./pages/Orders.jsx";
import Products from "./pages/Products.jsx";
import AILogs from "./pages/AILogs.jsx";
import Customers from "./pages/Customers.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import Chat from "./pages/Chat.jsx";
import WhatsAppTest from "./pages/WhatsAppTest.jsx";

function ProtectedRoute({ role, children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "owner" ? "/dashboard" : "/chat"} replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<ProtectedRoute role="customer"><Chat /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={getCurrentUser()?.role === "owner" ? "/dashboard" : "/chat"} replace />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute role="owner"><Dashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute role="owner"><Orders /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute role="owner"><Products /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute role="owner"><Customers /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute role="owner"><Analytics /></ProtectedRoute>} />
        <Route path="/ai-logs" element={<ProtectedRoute role="owner"><AILogs /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute role="owner"><Settings /></ProtectedRoute>} />
        <Route path="/whatsapp" element={<ProtectedRoute role="owner"><WhatsAppTest /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to={getCurrentUser()?.role === "owner" ? "/dashboard" : "/chat"} replace />} />
    </Routes>
  );
}

export default App;
