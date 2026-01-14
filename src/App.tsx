import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Collegiate from "./pages/Collegiate";
import CoachesOfficials from "./pages/CoachesOfficials";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Events from "./pages/Events";
import Membership from "./pages/Membership";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NewsArticle from "./pages/NewsArticle";
import PressRelease from "./pages/PressRelease";
import PressOps from "./pages/admin/PressOps";
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
          <Route path="/about" element={<About />} />
          <Route path="/collegiate" element={<Collegiate />} />
          <Route path="/coaches-officials" element={<CoachesOfficials />} />
          <Route path="/coaches-official" element={<Navigate to="/coaches-officials" replace />} />
          <Route path="/events" element={<Events />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/news/:slug" element={<PressRelease />} />
          <Route path="/admin/press-ops" element={<PressOps />} />
          {/* Legacy news article route */}
          <Route path="/news-legacy/:slug" element={<NewsArticle />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;