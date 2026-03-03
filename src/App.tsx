import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/auth/AuthContext";
import { RequireAuth } from "@/auth/RequireAuth";
import Auth from "./pages/Auth";
import CalendarPage from "./pages/CalendarPage";
import Agenda from "./pages/Agenda";
import AppGate from "./pages/AppGate";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import StudentPortal from "./pages/StudentPortal";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    { path: "/", element: <Index /> },
    { path: "/auth", element: <Auth /> },
    { path: "/agenda", element: <Agenda /> },
    {
      path: "/calendar",
      element: (
        <RequireAuth>
          <AppGate />
        </RequireAuth>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <RequireAuth>
          <ProfessorDashboard />
        </RequireAuth>
      ),
    },
    {
      path: "/student",
      element: (
        <RequireAuth>
          <StudentPortal />
        </RequireAuth>
      ),
    },
    {
      path: "/calendar-legacy",
      element: (
        <RequireAuth>
          <CalendarPage />
        </RequireAuth>
      ),
    },
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
