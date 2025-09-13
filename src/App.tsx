import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RepasCDL from "./pages/RepasCDL";
import PortalAccess from "./pages/PortalAccess";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import NursePortalPage from "./pages/portals/NursePortalPage";
import EmployeePortalPage from "./pages/portals/EmployeePortalPage";
import CookPortalPage from "./pages/portals/CookPortalPage";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const App = () => {
  // Authentification obligatoire pour Infirmier et Cuisinier seulement
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PortalAccess />} />
            <Route path="/portails" element={<PortalAccess />} />
            {/* Portail Employé - Accès libre */}
            <Route path="/employee-portal" element={<EmployeePortalPage />} />
            <Route path="/portails/employee" element={<EmployeePortalPage />} />
            {/* Portails Infirmier et Cuisinier - Authentification obligatoire */}
            <Route 
              path="/nurse-portal" 
              element={session ? <NursePortalPage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/cook-portal" 
              element={session ? <CookPortalPage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/portails/nurse" 
              element={session ? <NursePortalPage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/portails/cook" 
              element={session ? <CookPortalPage /> : <Navigate to="/login" replace />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;