import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import PublicLayout from './layouts/PublicLayout';
import Home        from './pages/Home';
import About       from './pages/About';
import Categories  from './pages/Categories';
import Timeline    from './pages/Timeline';
import FAQs        from './pages/FAQs';
import Contact     from './pages/Contact';
import ApplyNow    from './pages/ApplyNow';
import JudgePortal from './pages/JudgePortal';
import JudgeDetail from './pages/judge/JudgeDetail';
import Login       from './pages/Login';
import NotFound    from './pages/NotFound';
import VerifyOTP   from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import ScrollToTop   from './components/shared/ScrollToTop';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse    from './pages/TermsOfUse';
import AwardImages  from './pages/AwardImages';

// Dashboards & Wizards
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import NewApplication     from './pages/candidate/NewApplication';
import ApplicationDetail  from './pages/candidate/ApplicationDetail';
import JudgeDashboard     from './pages/judge/JudgeDashboard';
import EvaluationForm     from './pages/judge/EvaluationForm';
import AdminDashboard     from './pages/admin/AdminDashboard';

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

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <ScrollToTop />
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
          <Route path="judge-portal/:id" element={<JudgeDetail />} />
          <Route path="award-images" element={<AwardImages />} />
          <Route path="login"       element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password"  element={<ResetPassword />} />
          <Route path="privacy-policy"  element={<PrivacyPolicy />} />
          <Route path="terms-of-use"    element={<TermsOfUse />} />

          {/* Protected candidate routes (rendered with Navbar and Footer) */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/apply"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <NewApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['candidate', 'admin']}>
                <ApplicationDetail />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Verification OTP screen */}
        <Route path="verify-otp" element={<VerifyOTP />} />

        {/* Protected judge routes */}
        <Route
          path="judge-dashboard"
          element={
            <ProtectedRoute allowedRoles={['judge']}>
              <JudgeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="judge-dashboard/evaluate/:id"
          element={
            <ProtectedRoute allowedRoles={['judge']}>
              <EvaluationForm />
            </ProtectedRoute>
          }
        />

        {/* Protected admin routes */}
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
    <Toaster 
      position="top-right" 
      toastOptions={{
        className: '!bg-slate-900 !text-white !border !border-white/10 !rounded-2xl',
        duration: 4000,
      }} 
    />
  </AuthProvider>
);

export default App;
