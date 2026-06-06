import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Skeleton from '../components/ui/Skeleton';

// Lazy loading pages for performance and skeletons transitions
const LandingPage = React.lazy(() => import('../pages/LandingPage'));
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('../pages/auth/SignupPage'));
const Dashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const VendorList = React.lazy(() => import('../pages/vendors/VendorList'));
const VendorDetail = React.lazy(() => import('../pages/vendors/VendorDetail'));
const RFQList = React.lazy(() => import('../pages/rfqs/RFQList'));
const RFQCreate = React.lazy(() => import('../pages/rfqs/RFQCreate'));
const QuotationList = React.lazy(() => import('../pages/quotations/QuotationList'));
const QuotationDetail = React.lazy(() => import('../pages/quotations/QuotationDetail'));
const QuoteComparison = React.lazy(() => import('../pages/quotations/QuoteComparison'));
const ApprovalWorkflow = React.lazy(() => import('../pages/approvals/ApprovalWorkflow'));
const POList = React.lazy(() => import('../pages/purchase-orders/POList'));
const InvoiceList = React.lazy(() => import('../pages/invoices/InvoiceList'));
const ActivityLogs = React.lazy(() => import('../pages/activity-logs/ActivityLogs'));
const SettingsPage = React.lazy(() => import('../pages/settings/SettingsPage'));

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A]">
        <div className="space-y-4 w-72 text-center">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <React.Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center p-8 bg-[#0F172A]">
          <div className="space-y-4 w-full max-w-xl">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Private Layout-based Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Vendors */}
          <Route 
            path="/vendors" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Procurement Officer']}>
                <VendorList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendors/:id" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Procurement Officer']}>
                <VendorDetail />
              </ProtectedRoute>
            } 
          />

          {/* RFQs */}
          <Route path="/rfqs" element={<RFQList />} />
          <Route 
            path="/rfqs/create" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Procurement Officer']}>
                <RFQCreate />
              </ProtectedRoute>
            } 
          />

          {/* Quotations */}
          <Route path="/quotations" element={<QuotationList />} />
          <Route path="/quotations/:id" element={<QuotationDetail />} />
          <Route path="/quotations/compare/:rfqId" element={<QuoteComparison />} />

          {/* Approvals */}
          <Route 
            path="/approvals" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                <ApprovalWorkflow />
              </ProtectedRoute>
            } 
          />

          {/* Purchase Orders */}
          <Route path="/purchase-orders" element={<POList />} />

          {/* Invoices */}
          <Route path="/invoices" element={<InvoiceList />} />

          {/* Activity Logs */}
          <Route 
            path="/activity-logs" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Procurement Officer', 'Manager']}>
                <ActivityLogs />
              </ProtectedRoute>
            } 
          />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};
export default AppRoutes;
