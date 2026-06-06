import React, { createContext, useContext, useState, useEffect } from 'react';
import { vendorApi } from '../api/vendorApi';
import { rfqApi } from '../api/rfqApi';
import { quotationApi } from '../api/quotationApi';
import { approvalApi } from '../api/approvalApi';
import { purchaseOrderApi } from '../api/purchaseOrderApi';
import { invoiceApi } from '../api/invoiceApi';
import { activityApi } from '../api/activityApi';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const { token } = useAuth();
  
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (token) {
      loadAllData();
    } else {
      clearData();
    }
  }, [token]);

  const loadAllData = async () => {
    try {
      const [v, r, q, a, p, i, act] = await Promise.all([
        vendorApi.getAll(),
        rfqApi.getAll(),
        quotationApi.getAll(),
        approvalApi.getAll(),
        purchaseOrderApi.getAll(),
        invoiceApi.getAll(),
        activityApi.getAll()
      ]);
      setVendors(v.vendors || v);
      setRfqs((r.rfqs || r).map(rfq => ({
        ...rfq,
        assignedVendors: rfq.assignedVendorIds || []
      })));
      setQuotations((q.quotations || q).map(quote => ({
        ...quote,
        tax: quote.taxAmount,
        total: quote.totalPrice,
      })));
      setApprovals(a.approvals || a);
      setPurchaseOrders((p.purchaseOrders || p).map(po => ({
        ...po,
        total: po.grandTotal
      })));
      setInvoices((i.invoices || i).map(inv => ({
        ...inv,
        total: inv.grandTotal
      })));
      setActivities(act.logs || act);
    } catch (err) {
      console.error("Failed to load backend data", err);
    }
  };

  const clearData = () => {
    setVendors([]); 
    setRfqs([]); 
    setQuotations([]); 
    setApprovals([]);
    setPurchaseOrders([]); 
    setInvoices([]); 
    setActivities([]);
  };

  const logActivity = () => {
    // Activities are automatically logged by the Node.js backend
  };

  // Vendor Operations
  const addVendor = async (vendor) => {
    const res = await vendorApi.create(vendor);
    loadAllData();
    return res;
  };

  const updateVendor = async (id, updated) => {
    await vendorApi.update(id, updated);
    loadAllData();
  };

  const deleteVendor = async (id) => {
    await vendorApi.delete(id);
    loadAllData();
  };

  // RFQ Operations
  const addRFQ = async (rfq, userContext) => {
    const res = await rfqApi.create(rfq);
    loadAllData(); // Reloads RFQs and Auto-created Approvals from backend
    return res;
  };

  const updateRFQStatus = async (id, status) => {
    await rfqApi.updateStatus(id, status);
    loadAllData();
  };

  // Quotation Operations
  const addQuotation = async (quotation, userContext) => {
    const res = await quotationApi.create(quotation);
    loadAllData();
    return res;
  };

  // Approval Operations
  const updateApprovalStatus = async (id, status, comments = '', userContext) => {
    await approvalApi.updateStatus(id, status, comments);
    loadAllData(); // Reloads because accepting quotes creates POs backend-side
  };

  const requestApproval = async (rfqId, quotationId) => {
    await approvalApi.requestApproval(rfqId, quotationId);
    loadAllData();
  };

  // Purchase Order Operations
  const updatePOStatus = async (id, status, userContext) => {
    await purchaseOrderApi.updateStatus(id, status);
    loadAllData(); // Reloads because accepting POs creates Invoices backend-side
  };

  // Invoice Operations
  const updateInvoiceStatus = async (id, status, userContext) => {
    await invoiceApi.updateStatus(id, status);
    loadAllData();
  };

  return (
    <AppContext.Provider value={{
      vendors,
      rfqs,
      quotations,
      approvals,
      purchaseOrders,
      invoices,
      activities,
      addVendor,
      updateVendor,
      deleteVendor,
      addRFQ,
      updateRFQStatus,
      addQuotation,
      requestApproval,
      updateApprovalStatus,
      updatePOStatus,
      updateInvoiceStatus,
      logActivity,
      refreshData: loadAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};
