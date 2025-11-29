import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SoundSettingsProvider } from "@/hooks/use-sound-settings.tsx";
import Index from "./pages/Index";
import History from "./pages/History";
import Compare from "./pages/Compare";
import MyNotebook from "./pages/MyNotebook";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SoundSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/notebook" element={<MyNotebook />} />
                  <Route path="/about" element={<About />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <footer className="w-full py-6 pb-8 text-center">
                <p className="text-[11px] text-gray-400 dark:text-slate-700 font-medium">
                  © 2025 Agalist™ • v0.1.0 (Beta) • Dev by OC
                </p>
              </footer>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </SoundSettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;