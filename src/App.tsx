import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DesignTool from "./pages/DesignTool";
import FloorPlanResult from "./pages/FloorPlanResult";
import AIRenderedView from "./pages/AIRenderedView";
import Interactive3DView from "./pages/Interactive3DView";
import DesignSummary from "./pages/DesignSummary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/design" element={<DesignTool />} />
          <Route path="/floor-plan-result" element={<FloorPlanResult />} />
          <Route path="/ai-rendered-view" element={<AIRenderedView />} />
          <Route path="/interactive-3d" element={<Interactive3DView />} />
          <Route path="/design-summary" element={<DesignSummary />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
