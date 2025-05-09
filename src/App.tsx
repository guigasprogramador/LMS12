
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import NetworkErrorBoundary from "./components/NetworkErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetails from "./pages/CourseDetails";
import CourseContent from "./pages/CourseContent";
import Certificate from "./pages/Certificate";
import CoursePlayer from "./pages/aluno/CoursePlayer";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminModules from "./pages/admin/AdminModules";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminMakeUserAdmin from "./pages/admin/AdminMakeUserAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NetworkErrorBoundary>
          <BrowserRouter>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected student routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/courses/:courseId" element={<CourseDetails />} />
              <Route path="/courses/:courseId/content" element={<CourseContent />} />
              <Route path="/aluno/curso/:id/player" element={<CoursePlayer />} />
              <Route path="/certificates/:certificateId" element={<Certificate />} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/modules" element={<AdminModules />} />
              <Route path="/admin/lessons" element={<AdminLessons />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/make-admin" element={<AdminMakeUserAdmin />} />
              <Route path="/admin/certificates" element={<AdminCertificates />} />
              <Route path="/admin/profiles" element={<AdminProfiles />} />
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NetworkErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
