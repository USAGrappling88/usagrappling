import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Collegiate from "./pages/Collegiate";
import CoachesOfficials from "./pages/CoachesOfficials";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Events from "./pages/Events";
import Membership from "./pages/Membership";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PressRelease from "./pages/PressRelease";
import News from "./pages/News";
import PressOps from "./pages/admin/PressOps";
import EventOps from "./pages/admin/EventOps";
import StaffOps from "./pages/admin/StaffOps";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<PressRelease />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/press-ops" element={<PressOps />} />
            <Route path="/admin/event-ops" element={<EventOps />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
