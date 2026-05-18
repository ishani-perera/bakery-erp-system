import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { authAPI } from "./services/api";
import "./App.css";

// අලුත් Pages 4 Import කරගැනීම
import Documentation from "./pages/Documentation";
import ApiReference from "./pages/ApiReference";
import Changelog from "./pages/Changelog";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Proper Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-container">
        <div className="page-content">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Auto-login with default admin credentials if not already authenticated
    const initializeAuth = async () => {
      const existingToken = localStorage.getItem("authToken");
      if (!existingToken) {
        try {
          const response = await authAPI.login({
            username: "admin",
            password: "password123",
          });
          const { token, user } = response.data;
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          console.error("Auto-login failed:", error);
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  if (!isInitialized) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Initializing...</div>;
  }
  if (!isInitialized) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Initializing...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />

        {/* අලුතින් හදපු System Pages වලට අදාළ Routes */}
        <Route path="/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
        <Route path="/api-reference" element={<ProtectedRoute><ApiReference /></ProtectedRoute>} />
        <Route path="/changelog" element={<ProtectedRoute><Changelog /></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;