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
  // Désactiver l'authentification obligatoire pour simplifier l'utilisation
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  // Commenter l'authentification pour permettre l'accès direct
  // useEffect(() => {
  //   const getSession = async () => {
  //     const { data: { session } } = await supabase.auth.getSession();
  //     setSession(session);
  //     setLoading(false);
  //   };

  //   getSession();

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session);
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  // if (loading) {
  //   return <div>Chargement...</div>; // Ou un composant de chargement plus joli
  // }

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
            <Route path="/nurse-portal" element={<NursePortalPage />} />
            <Route path="/employee-portal" element={<EmployeePortalPage />} />
            <Route path="/cook-portal" element={<CookPortalPage />} />
            <Route path="/portails/nurse" element={<NursePortalPage />} />
            <Route path="/portails/employee" element={<EmployeePortalPage />} />
            <Route path="/portails/cook" element={<CookPortalPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;