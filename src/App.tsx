import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import DesignTool from "./pages/DesignTool";
import FloorPlanResult from "./pages/FloorPlanResult";
import AIRenderedView from "./pages/AIRenderedView";
import Interactive3DView from "./pages/Interactive3DView";
import VRWalkthroughPage from "./pages/VRWalkthroughPage";
import CostEstimationPage from "./pages/CostEstimationPage";
import DesignSummary from "./pages/DesignSummary";
import Dashboard from "./pages/Dashboard";
import PricingPage from "./pages/PricingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/design" element={<ProtectedRoute><DesignTool /></ProtectedRoute>} />
            <Route path="/floor-plan-result" element={<ProtectedRoute><FloorPlanResult /></ProtectedRoute>} />
            <Route path="/ai-rendered-view" element={<ProtectedRoute><AIRenderedView /></ProtectedRoute>} />
            <Route path="/interactive-3d" element={<ProtectedRoute><Interactive3DView /></ProtectedRoute>} />
            <Route path="/vr-walkthrough" element={<ProtectedRoute><VRWalkthroughPage /></ProtectedRoute>} />
            <Route path="/cost-estimation" element={<ProtectedRoute><CostEstimationPage /></ProtectedRoute>} />
            <Route path="/design-summary" element={<ProtectedRoute><DesignSummary /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
