import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/LoginPage';

// ── Existing Pages ─────────────────────────────────────────────────────────────
import ApprovalWorkflowPage from '../pages/ApprovalWorkflowPage';
import PurchaseOrderInvoicePage from '../pages/PurchaseOrderInvoicePage';
import ActivityAuditLogsPage from '../pages/ActivityAuditLogsPage';
import ReportsAnalyticsPage from '../pages/ReportsAnalyticsPage';

// ── New Pages ──────────────────────────────────────────────────────────────────
import DashboardPage from '../pages/DashboardPage';
import VendorsPage from '../pages/VendorsPage';
import RFQCreationPage from '../pages/RFQCreationPage';
import QuotationSubmissionPage from '../pages/QuotationSubmissionPage';
import QuotationComparisonPage from '../pages/QuotationComparisonPage';
import RFQListPage from '../pages/RFQListPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected ERP Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* ── New Procurement Pages ──────────────────────── */}
          <Route path="/dashboard"                    element={<DashboardPage />} />
          <Route path="/rfqs"                         element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Purchaser', 'Vendor']}><RFQListPage /></ProtectedRoute>} />
          <Route path="/vendors"                      element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Purchaser']}><VendorsPage /></ProtectedRoute>} />
          <Route path="/rfq/create"                   element={<ProtectedRoute allowedRoles={['Admin', 'Purchaser']}><RFQCreationPage /></ProtectedRoute>} />
          <Route path="/quotations/submit/:rfqId"     element={<ProtectedRoute allowedRoles={['Admin', 'Vendor']}><QuotationSubmissionPage /></ProtectedRoute>} />
          <Route path="/quotations/submit"            element={<ProtectedRoute allowedRoles={['Admin', 'Vendor']}><QuotationSubmissionPage /></ProtectedRoute>} />
          <Route path="/quotations/compare/:rfqId"    element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Purchaser']}><QuotationComparisonPage /></ProtectedRoute>} />
          <Route path="/quotations/compare"           element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Purchaser']}><QuotationComparisonPage /></ProtectedRoute>} />

          {/* ── Existing Workflow Pages ────────────────────── */}
          <Route path="/approvals"                    element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><ApprovalWorkflowPage /></ProtectedRoute>} />
          <Route path="/purchase-orders"              element={<PurchaseOrderInvoicePage />} />
          <Route path="/audit-logs"                   element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Purchaser']}><ActivityAuditLogsPage /></ProtectedRoute>} />
          <Route path="/analytics"                    element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><ReportsAnalyticsPage /></ProtectedRoute>} />

          {/* Default Redirect → Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Fallback Wildcard Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

