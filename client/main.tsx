import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Auth Pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Register from "./pages/Register";
// Onboarding
import OnboardingStep1 from "./pages/OnboardingStep1";
import OnboardingStep2 from "./pages/OnboardingStep2";
import OnboardingStep3 from "./pages/OnboardingStep3";
// Main Pages
import Index from "./pages/Index";
import ScanKamera from "./pages/ScanKamera";
import Nutrition from "./pages/Nutrition";
import Recipes from "./pages/Recipes";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
// Detail Pages
import DetailResep from "./pages/DetailResep";
import FoodLog from "./pages/FoodLog";
import NutritionDashboard from "./pages/NutritionDashboard";
import ScanHistory from "./pages/ScanHistory";
import FullProfile from "./pages/FullProfile";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/splash" element={<Splash />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Onboarding (requires auth) */}
            <Route path="/onboarding-1" element={<ProtectedRoute><OnboardingStep1 /></ProtectedRoute>} />
            <Route path="/onboarding-2" element={<ProtectedRoute><OnboardingStep2 /></ProtectedRoute>} />
            <Route path="/onboarding-3" element={<ProtectedRoute><OnboardingStep3 /></ProtectedRoute>} />

            {/* Main App (requires auth) */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><ScanKamera /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/recipe/:id" element={<ProtectedRoute><DetailResep /></ProtectedRoute>} />
            <Route path="/food-log" element={<ProtectedRoute><FoodLog /></ProtectedRoute>} />
            <Route path="/nutrition-dashboard" element={<ProtectedRoute><NutritionDashboard /></ProtectedRoute>} />
            <Route path="/scan-history" element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
            <Route path="/full-profile" element={<ProtectedRoute><FullProfile /></ProtectedRoute>} />

            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<Root />);