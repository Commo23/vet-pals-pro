import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VetNavigation } from "@/components/VetNavigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ClientProvider } from "@/contexts/ClientContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Pets from "./pages/Pets";
import Appointments from "./pages/Appointments";
import Consultations from "./pages/Consultations";
import History from "./pages/History";
import Farm from "./pages/Farm";
import Vaccinations from "./pages/Vaccinations";
import Antiparasites from "./pages/Antiparasites";
import Stock from "./pages/Stock";
import TestStats from "./pages/TestStats";
import SimpleTest from "./pages/SimpleTest";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import { SettingsProvider } from "@/contexts/SettingsContext";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ClientProvider>
          <SettingsProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={
                    <>
                      <VetNavigation />
                      <Dashboard />
                    </>
                  } />
                  <Route path="/clients" element={
                    <>
                      <VetNavigation />
                      <Clients />
                    </>
                  } />
                  <Route path="/pets" element={
                    <>
                      <VetNavigation />
                      <Pets />
                    </>
                  } />
                  <Route path="/appointments" element={
                    <>
                      <VetNavigation />
                      <Appointments />
                    </>
                  } />
                  <Route path="/consultations" element={
                    <>
                      <VetNavigation />
                      <Consultations />
                    </>
                  } />
                  <Route path="/history" element={
                    <>
                      <VetNavigation />
                      <History />
                    </>
                  } />
                  <Route path="/farm" element={
                    <>
                      <VetNavigation />
                      <Farm />
                    </>
                  } />
                  <Route path="/vaccinations" element={
                    <>
                      <VetNavigation />
                      <Vaccinations />
                    </>
                  } />
                  <Route path="/antiparasites" element={
                    <>
                      <VetNavigation />
                      <Antiparasites />
                    </>
                  } />
                  <Route path="/stock" element={
                    <>
                      <VetNavigation />
                      <Stock />
                    </>
                  } />
                  <Route path="/test-stats" element={
                    <>
                      <VetNavigation />
                      <TestStats />
                    </>
                  } />
                  <Route path="/simple-test" element={
                    <>
                      <VetNavigation />
                      <SimpleTest />
                    </>
                  } />
                  <Route path="/settings" element={
                    <>
                      <VetNavigation />
                      <Settings />
                    </>
                  } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </SettingsProvider>
        </ClientProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

