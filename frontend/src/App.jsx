import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
import PageNotFound from "@/lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { AdminAuthProvider, useAdminAuth, ADMIN_ROLES_KEY } from "@/lib/AdminAuthContext";
import ClientLayout from "@/components/layouts/ClientLayout";
import AdminLayout from "@/components/layouts/AdminLayout";
import Home from "@/pages/client/Home";
import Vocabulary from "@/pages/client/Vocabulary";
import VocabularyDetail from "@/pages/client/VocabularyDetail";
import VocabularyPractice from "@/pages/client/VocabularyPractice";
import LookUp from "@/pages/client/LookUp";
import Listening, { ListeningPractice } from "@/pages/client/Listening";
import ListeningDetail from "@/pages/client/ListeningDetail";
import Reading, { ReadingPractice } from "@/pages/client/Reading";
import ReadingDetail from "@/pages/client/ReadingDetail";
import Stats from "@/pages/client/Stats";
import Leaderboard from "@/pages/client/Leaderboard";
import Profile from "@/pages/client/Profile";
import Moderation from "@/pages/client/Moderation";
import Landing from "@/pages/client/Landing";
import Register from "@/pages/client/Register";
import Login from "@/pages/client/Login";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminVocabulary from "@/pages/admin/AdminVocabulary";
import AdminReading from "@/pages/admin/AdminReading";
import AdminListening from "@/pages/admin/AdminListening";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminModeration from "@/pages/admin/AdminModeration";

// Component hiển thị spinner loading toàn màn hình
const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

// Component hiển thị spinner loading cho trang admin
const AdminLoadingScreen = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"></div>
  </div>
);

// Route bảo vệ yêu cầu xác thực người dùng client
const ProtectedRoute = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <ClientLayout />;
};

// Route bảo vệ yêu cầu xác thực admin
const AdminProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return <AdminLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout />;
};

// Route chỉ dành cho admin (role 3), dùng lồng bên trong AdminProtectedRoute
const AdminOnlyRoute = () => {
  const { admin, isLoading } = useAdminAuth();

  if (isLoading) {
    return <AdminLoadingScreen />;
  }

  // Đọc roles từ localStorage (fallback nếu context chưa kịp set, tương tự AdminLayout)
  const getCachedRoles = () => {
    try {
      const raw = localStorage.getItem(ADMIN_ROLES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(Number);
      }
    } catch { /* ignore */ }
    return [];
  };
  const cachedRoles = getCachedRoles();
  const roles = (admin?.user?.roles ?? cachedRoles).map(Number);

  if (!roles.includes(3)) {
    return <Navigate to="/admin/vocabulary" replace />;
  }

  return <Outlet />;
};

// Component định tuyến chính dựa trên trạng thái xác thực người dùng
const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Landing />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />}
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/vocabulary/:id/practice/:mode" element={<VocabularyPractice />} />
        <Route path="/vocabulary/:id" element={<VocabularyDetail />} />
        <Route path="/lookup" element={<LookUp />} />
        <Route path="/listening" element={<Listening />} />
        <Route path="/listening/:id/practice" element={<ListeningPractice />} />
        <Route path="/listening/:id" element={<ListeningDetail />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/reading/:id/practice" element={<ReadingPractice />} />
        <Route path="/reading/:id" element={<ReadingDetail />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/moderation" element={<Moderation />} />
      </Route>

      {/* Admin routes - không yêu cầu client auth */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminOnlyRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
        <Route path="/admin/vocabulary" element={<AdminVocabulary />} />
        <Route path="/admin/reading" element={<AdminReading />} />
        <Route path="/admin/listening" element={<AdminListening />} />
        <Route path="/admin/moderation" element={<AdminModeration />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

// Component gốc bao bọc ứng dụng với các Provider
function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
