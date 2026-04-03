import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, isAdminRole } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { PublicLayout } from "@/components/PublicLayout";
import { MemberLayout } from "@/components/MemberLayout";
import { AdminLayout } from "@/components/AdminLayout";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import FeatureDetail from "./pages/public/FeatureDetail";
import CellGroupDetail from "./pages/public/CellGroupDetail";
import PublicEvents from "./pages/public/PublicEvents";
import PublicSermons from "./pages/public/PublicSermons";
import MemberDashboard from "./pages/member/Dashboard";
import Profile from "./pages/member/Profile";
import Events from "./pages/member/Events";
import EventDetail from "./pages/member/EventDetail";
import Media from "./pages/member/Media";
import MemberNewsletters from "./pages/member/Newsletters";
import AdminDashboard from "./pages/admin/Dashboard";
import FinanceDashboard from "./pages/admin/FinanceDashboard";
import SecretaryDashboard from "./pages/admin/SecretaryDashboard";
import Attendance from "./pages/admin/Attendance";
import Finance from "./pages/admin/Finance";
import ExpenseTracking from "./pages/admin/ExpenseTracking";
import BudgetPlanning from "./pages/admin/BudgetPlanning";
import FinanceReports from "./pages/admin/FinanceReports";
import OfferingRecords from "./pages/admin/OfferingRecords";
import MediaManagement from "./pages/admin/MediaManagement";
import Records from "./pages/admin/Records";
import MemberManagement from "./pages/admin/MemberManagement";
import Newsletters from "./pages/admin/Newsletters";
import EventManagement from "./pages/admin/EventManagement";
import NotificationsPage from "./pages/Notifications";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={isAdminRole(user.role) ? '/admin' : '/member'} replace />;
  }
  return <>{children}</>;
};

const LoginRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (isAuthenticated && user) {
    return <Navigate to={isAdminRole(user.role) ? '/admin' : '/member'} replace />;
  }
  return <Login />;
};

const RegisterRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (isAuthenticated && user) {
    return <Navigate to={isAdminRole(user.role) ? '/admin' : '/member'} replace />;
  }
  return <Register />;
};

const adminRoles = ['super_admin', 'finance_admin', 'secretary'];
const financeRoles = ['super_admin', 'finance_admin'];
const secretaryRoles = ['super_admin', 'secretary'];

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/about/:slug" element={<PublicLayout><FeatureDetail /></PublicLayout>} />
            <Route path="/cell-groups/:slug" element={<PublicLayout><CellGroupDetail /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><PublicEvents /></PublicLayout>} />
            <Route path="/sermons" element={<PublicLayout><PublicSermons /></PublicLayout>} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegisterRoute />} />

            {/* Member Routes */}
            <Route path="/member" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout><MemberDashboard /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/profile" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout><Profile /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/events" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout><Events /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/events/:id" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout><EventDetail /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/media" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout><Media /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/notifications" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout><NotificationsPage /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/newsletters" element={<ProtectedRoute allowedRoles={['member']}><MemberLayout><MemberNewsletters /></MemberLayout></ProtectedRoute>} />

            {/* Admin Dashboard - role-specific */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={adminRoles}><AdminLayout><AdminDashboardRouter /></AdminLayout></ProtectedRoute>} />

            {/* Finance Routes */}
            <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={financeRoles}><AdminLayout><Finance /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/expenses" element={<ProtectedRoute allowedRoles={financeRoles}><AdminLayout><ExpenseTracking /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/budget" element={<ProtectedRoute allowedRoles={financeRoles}><AdminLayout><BudgetPlanning /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={financeRoles}><AdminLayout><FinanceReports /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/offerings" element={<ProtectedRoute allowedRoles={financeRoles}><AdminLayout><OfferingRecords /></AdminLayout></ProtectedRoute>} />

            {/* Secretary Routes */}
            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={secretaryRoles}><AdminLayout><Attendance /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute allowedRoles={secretaryRoles}><AdminLayout><MediaManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/records" element={<ProtectedRoute allowedRoles={secretaryRoles}><AdminLayout><Records /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute allowedRoles={secretaryRoles}><AdminLayout><MemberManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/newsletters" element={<ProtectedRoute allowedRoles={secretaryRoles}><AdminLayout><Newsletters /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/event-management" element={<ProtectedRoute allowedRoles={secretaryRoles}><AdminLayout><EventManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={adminRoles}><AdminLayout><NotificationsPage /></AdminLayout></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

// Routes the admin dashboard based on role
const AdminDashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'finance_admin') return <FinanceDashboard />;
  if (user?.role === 'secretary') return <SecretaryDashboard />;
  return <AdminDashboard />;
};

export default App;
