import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RepasCDL from "./pages/RepasCDL";
import PortalAccess from "./pages/PortalAccess";
import NotFound from "./pages/NotFound";
import NursePortalPage from "./pages/portals/NursePortalPage";
import EmployeePortalPage from "./pages/portals/EmployeePortalPage";
import CookPortalPage from "./pages/portals/CookPortalPage";
import { ServiceWorkerManager } from "./components/ServiceWorkerManager";
import ResourceErrorHandler from "./components/ResourceErrorHandler";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ResourceErrorHandler>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ServiceWorkerManager />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<PortalAccess />} />
              <Route path="/portails" element={<PortalAccess />} />
              {/* Tous les portails - Accès libre */}
              <Route path="/employee-portal" element={<EmployeePortalPage />} />
              <Route path="/portails/employee" element={<EmployeePortalPage />} />
              <Route path="/nurse-portal" element={<NursePortalPage />} />
              <Route path="/cook-portal" element={<CookPortalPage />} />
              <Route path="/portails/nurse" element={<NursePortalPage />} />
              <Route path="/portails/cook" element={<CookPortalPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ResourceErrorHandler>
  );
};

export default App;