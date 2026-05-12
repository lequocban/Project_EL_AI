import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "@/lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ClientLayout from "@/components/layouts/ClientLayout";
import Home from "@/pages/client/Home";
import Vocabulary from "@/pages/client/Vocabulary";
import LookUp from "@/pages/client/LookUp";
import Listening, { ListeningPractice } from "@/pages/client/Listening";
import Reading, { ReadingPractice } from "@/pages/client/Reading";
import Stats from "@/pages/client/Stats";
import Leaderboard from "@/pages/client/Leaderboard";
import Profile from "@/pages/client/Profile";
import Landing from "@/pages/client/Landing";
import Register from "@/pages/client/Register";
import Login from "@/pages/client/Login";

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

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
        <Route path="/lookup" element={<LookUp />} />
        <Route path="/listening" element={<Listening />} />
        <Route path="/listening/:id/practice" element={<ListeningPractice />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/reading/:id/practice" element={<ReadingPractice />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
