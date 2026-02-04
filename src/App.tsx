import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SoundSettingsProvider } from "@/hooks/use-sound-settings.tsx";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { SettingsModal } from "@/components/SettingsModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useState } from "react";
import Index from "./pages/Index";
import History from "./pages/History";
import Compare from "./pages/Compare";
import Insights from "./pages/Insights";
import MyNotebook from "./pages/MyNotebook";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { ShoppingMode } from "./pages/ShoppingMode";
import Auth from "./pages/Auth";
import OGDesign from "./pages/OGDesign";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const location = useLocation();
  
  // Hide navigation on shopping mode
  const isShoppingMode = location.pathname.startsWith('/shopping/');

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shopping/:id" element={<ShoppingMode />} />
          <Route path="/history" element={<History />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/notebook" element={<MyNotebook />} />
          <Route path="/about" element={<About />} />
          <Route path="/og-design" element={<OGDesign />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isShoppingMode && (
        <Navigation onSettingsClick={() => setIsSettingsModalOpen(true)} />
      )}
      <SettingsModal open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} />
      {!isShoppingMode && (
        <footer className="w-full py-6 pb-8 text-center">
          <p className="text-[11px] text-gray-400 dark:text-slate-700 font-medium">
            © 2025 Agalist™ • v0.1.0 (Beta) • Dev by OC
          </p>
        </footer>
      )}
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SoundSettingsProvider>
            <LanguageProvider>
              <AuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <AppContent />
                </TooltipProvider>
              </AuthProvider>
            </LanguageProvider>
          </SoundSettingsProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;