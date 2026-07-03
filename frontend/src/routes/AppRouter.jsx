import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../layouts/PublicLayout';
import Home        from '../pages/Home';
import About       from '../pages/About';
import Categories  from '../pages/Categories';
import Timeline    from '../pages/Timeline';
import FAQs        from '../pages/FAQs';
import Contact     from '../pages/Contact';
import ApplyNow    from '../pages/ApplyNow';
import JudgePortal from '../pages/JudgePortal';
import Login       from '../pages/Login';
import NotFound    from '../pages/NotFound';
import VerifyOTP   from '../pages/VerifyOTP';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword  from '../pages/ResetPassword';

// Dashboards
import CandidateDashboard from '../pages/candidate/CandidateDashboard';
import JudgeDashboard     from '../pages/judge/JudgeDashboard';
import AdminDashboard     from '../pages/admin/AdminDashboard';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isEmailVerified, user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Email verification guard
  if (!isEmailVerified) {
    return <Navigate to="/verify-otp" replace state={{ email: user?.email }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route index        element={<Home />} />
        <Route path="about"       element={<About />} />
        <Route path="categories"  element={<Categories />} />
        <Route path="timeline"    element={<Timeline />} />
        <Route path="faqs"        element={<FAQs />} />
        <Route path="contact"     element={<Contact />} />
        <Route path="apply"       element={<ApplyNow />} />
        <Route path="judge-portal" element={<JudgePortal />} />
        <Route path="login"       element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password"  element={<ResetPassword />} />
      </Route>

      {/* Verification OTP screen */}
      <Route path="verify-otp" element={<VerifyOTP />} />

      {/* Protected dashboard routes */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="judge-dashboard"
        element={
          <ProtectedRoute allowedRoles={['judge']}>
            <JudgeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
