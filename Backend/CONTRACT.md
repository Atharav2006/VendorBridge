# VendorBridge — API Contract
> Single source of truth for Frontend & Backend teams.
> Both AntiGravity sessions must have this file pasted in before writing any code.
> Any change to this file requires verbal agreement from both teams first.

---

## Base URL
```
Development:  http://localhost:3000/api
Frontend runs on: http://localhost:5173
```

---

## User Roles
| Role | Value (in JWT) | Can Do |
|------|---------------|--------|
| Admin | `admin` | Manage users, manage vendors, view analytics |
| Procurement Officer | `procurement_officer` | Create RFQs, compare quotations, generate PO & invoices |
| Manager / Approver | `manager` | Approve or reject procurement requests, monitor workflows |
| Vendor | `vendor` | Submit quotations, edit quotations, track RFQ status, view POs |

---

## Authentication Header
All protected routes require:
```
Authorization: Bearer <token>
```

---

## Data Models

### User
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "admin | procurement_officer | manager | vendor",
  "isActive": "boolean",
  "createdAt": "ISO8601 string"
}
```

### Vendor
```json
{
  "id": "string",
  "name": "string",
  "category": "string",
  "gst": "string",
  "contactPerson": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "status": "active | inactive | blacklisted",
  "rating": "number (1-5)",
  "linkedUserId": "string | null",
  "createdAt": "ISO8601 string"
}
```

### RFQ (Request for Quotation)
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "items": [
    {
      "name": "string",
      "quantity": "number",
      "unit": "string"
    }
  ],
  "deadline": "ISO8601 string",
  "attachmentUrl": "string | null",
  "assignedVendorIds": ["string"],
  "status": "draft | open | closed | cancelled",
  "createdBy": "userId string",
  "createdAt": "ISO8601 string"
}
```

### Quotation
```json
{
  "id": "string",
  "rfqId": "string",
  "vendorId": "string",
  "items": [
    {
      "name": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number"
    }
  ],
  "deliveryDays": "number",
  "notes": "string | null",
  "subtotal": "number",
  "taxPercent": "number",
  "taxAmount": "number",
  "grandTotal": "number",
  "status": "submitted | shortlisted | rejected",
  "submittedAt": "ISO8601 string",
  "updatedAt": "ISO8601 string"
}
```

### Approval
```json
{
  "id": "string",
  "rfqId": "string",
  "quotationId": "string",
  "requestedBy": "userId string",
  "approvedBy": "userId string | null",
  "status": "pending | approved | rejected",
  "remarks": "string | null",
  "approvalTimeline": [
    {
      "action": "string",
      "by": "userId string",
      "at": "ISO8601 string",
      "remarks": "string | null"
    }
  ],
  "createdAt": "ISO8601 string",
  "updatedAt": "ISO8601 string"
}
```

### Purchase Order
```json
{
  "id": "string",
  "poNumber": "string (e.g. PO-2024-0001)",
  "rfqId": "string",
  "quotationId": "string",
  "vendorId": "string",
  "items": [
    {
      "name": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number"
    }
  ],
  "subtotal": "number",
  "taxPercent": "number",
  "taxAmount": "number",
  "grandTotal": "number",
  "status": "draft | issued | delivered | cancelled",
  "createdBy": "userId string",
  "createdAt": "ISO8601 string"
}
```

### Invoice
```json
{
  "id": "string",
  "invoiceNumber": "string (e.g. INV-2024-0001)",
  "purchaseOrderId": "string",
  "vendorId": "string",
  "billingDetails": {
    "companyName": "string",
    "address": "string",
    "gst": "string"
  },
  "items": [
    {
      "name": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number"
    }
  ],
  "subtotal": "number",
  "taxPercent": "number",
  "taxAmount": "number",
  "grandTotal": "number",
  "status": "generated | sent | paid",
  "pdfUrl": "string | null",
  "emailSentTo": "string | null",
  "emailSentAt": "ISO8601 string | null",
  "createdAt": "ISO8601 string"
}
```

### Activity Log
```json
{
  "id": "string",
  "userId": "string",
  "userName": "string",
  "action": "string (e.g. 'Created RFQ', 'Approved Quotation')",
  "entityType": "rfq | vendor | quotation | approval | purchase_order | invoice | user",
  "entityId": "string",
  "metadata": "object | null",
  "timestamp": "ISO8601 string"
}
```

### Notification
```json
{
  "id": "string",
  "userId": "string",
  "type": "rfq_assigned | quotation_received | approval_requested | approval_done | po_generated | invoice_sent",
  "message": "string",
  "entityType": "string",
  "entityId": "string",
  "isRead": "boolean",
  "createdAt": "ISO8601 string"
}
```

---

## API Endpoints

---

### 1. AUTH

#### POST `/api/auth/signup`
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "admin | procurement_officer | manager | vendor"
}
```
**Response `201`:**
```json
{
  "token": "JWT string",
  "user": { "id": "string", "name": "string", "email": "string", "role": "string" }
}
```

#### POST `/api/auth/login`
**Body:**
```json
{ "email": "string", "password": "string" }
```
**Response `200`:**
```json
{
  "token": "JWT string",
  "user": { "id": "string", "name": "string", "email": "string", "role": "string" }
}
```

#### POST `/api/auth/forgot-password`
**Body:**
```json
{ "email": "string" }
```
**Response `200`:**
```json
{ "message": "Password reset email sent" }
```

---

### 2. USERS (Admin only)

#### GET `/api/users`
**Auth:** admin
**Query params:** `?role=string&search=string`
**Response `200`:**
```json
{
  "users": [ { ...User } ],
  "total": "number"
}
```

#### PUT `/api/users/:id`
**Auth:** admin
**Body:**
```json
{ "isActive": "boolean", "role": "string" }
```
**Response `200`:**
```json
{ ...User }
```

#### DELETE `/api/users/:id`
**Auth:** admin
**Response `200`:**
```json
{ "message": "User deleted" }
```

---

### 3. VENDORS

#### GET `/api/vendors`
**Auth:** any role
**Query params:** `?search=string&category=string&status=active|inactive|blacklisted`
**Response `200`:**
```json
{
  "vendors": [ { ...Vendor } ],
  "total": "number"
}
```

#### GET `/api/vendors/:id`
**Auth:** any role
**Response `200`:**
```json
{ ...Vendor }
```

#### POST `/api/vendors`
**Auth:** admin, procurement_officer
**Body:**
```json
{
  "name": "string",
  "category": "string",
  "gst": "string",
  "contactPerson": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```
**Response `201`:**
```json
{ ...Vendor }
```

#### PUT `/api/vendors/:id`
**Auth:** admin, procurement_officer
**Body:** (any Vendor fields to update)
**Response `200`:**
```json
{ ...Vendor }
```

#### PATCH `/api/vendors/:id/status`
**Auth:** admin
**Body:**
```json
{ "status": "active | inactive | blacklisted" }
```
**Response `200`:**
```json
{ ...Vendor }
```

#### DELETE `/api/vendors/:id`
**Auth:** admin
**Response `200`:**
```json
{ "message": "Vendor deleted" }
```

---

### 4. RFQs

#### GET `/api/rfqs`
**Auth:** any role (vendor sees only their assigned RFQs)
**Query params:** `?status=open|closed|draft|cancelled&search=string`
**Response `200`:**
```json
{
  "rfqs": [ { ...RFQ } ],
  "total": "number"
}
```

#### GET `/api/rfqs/:id`
**Auth:** any role
**Response `200`:**
```json
{ ...RFQ }
```

#### POST `/api/rfqs`
**Auth:** procurement_officer
**Body:**
```json
{
  "title": "string",
  "description": "string",
  "items": [ { "name": "string", "quantity": "number", "unit": "string" } ],
  "deadline": "ISO8601 string",
  "assignedVendorIds": ["string"]
}
```
**Response `201`:**
```json
{ ...RFQ }
```

#### PUT `/api/rfqs/:id`
**Auth:** procurement_officer
**Body:** (any RFQ fields to update, only when status is draft)
**Response `200`:**
```json
{ ...RFQ }
```

#### PATCH `/api/rfqs/:id/status`
**Auth:** procurement_officer
**Body:**
```json
{ "status": "open | closed | cancelled" }
```
**Response `200`:**
```json
{ ...RFQ }
```

#### GET `/api/rfqs/:id/compare`
Returns all quotations for an RFQ enriched for comparison.
**Auth:** procurement_officer, manager
**Response `200`:**
```json
{
  "rfqId": "string",
  "rfqTitle": "string",
  "quotations": [
    {
      "id": "string",
      "vendorId": "string",
      "vendorName": "string",
      "vendorRating": "number",
      "items": [ { "name": "string", "quantity": "number", "unitPrice": "number", "totalPrice": "number" } ],
      "deliveryDays": "number",
      "grandTotal": "number",
      "taxAmount": "number",
      "notes": "string | null",
      "isLowestPrice": "boolean",
      "isFastestDelivery": "boolean",
      "status": "string"
    }
  ]
}
```

---

### 5. QUOTATIONS

#### GET `/api/quotations`
**Auth:** procurement_officer, manager, admin (vendor sees only own)
**Query params:** `?rfqId=string&vendorId=string&status=string`
**Response `200`:**
```json
{ "quotations": [ { ...Quotation } ] }
```

#### GET `/api/quotations/:id`
**Auth:** any role
**Response `200`:**
```json
{ ...Quotation }
```

#### POST `/api/rfqs/:rfqId/quotations`
**Auth:** vendor
**Body:**
```json
{
  "items": [ { "name": "string", "quantity": "number", "unitPrice": "number", "totalPrice": "number" } ],
  "deliveryDays": "number",
  "notes": "string | null",
  "subtotal": "number",
  "taxPercent": "number",
  "taxAmount": "number",
  "grandTotal": "number"
}
```
**Response `201`:**
```json
{ ...Quotation }
```

#### PUT `/api/quotations/:id`
**Auth:** vendor (only allowed while status is "submitted" and no approval initiated)
**Body:** (any Quotation fields)
**Response `200`:**
```json
{ ...Quotation }
```

---

### 6. APPROVALS

#### GET `/api/approvals`
**Auth:** procurement_officer, manager, admin
**Query params:** `?status=pending|approved|rejected`
**Response `200`:**
```json
{ "approvals": [ { ...Approval } ] }
```

#### GET `/api/approvals/:id`
**Auth:** procurement_officer, manager, admin
**Response `200`:**
```json
{ ...Approval }
```

#### POST `/api/approvals`
**Auth:** procurement_officer
Initiate approval for a selected quotation.
**Body:**
```json
{
  "rfqId": "string",
  "quotationId": "string"
}
```
**Response `201`:**
```json
{ ...Approval }
```

#### POST `/api/approvals/:id/action`
**Auth:** manager
**Body:**
```json
{
  "action": "approved | rejected",
  "remarks": "string | null"
}
```
**Response `200`:**
```json
{ ...Approval }
```

---

### 7. PURCHASE ORDERS

#### GET `/api/purchase-orders`
**Auth:** procurement_officer, manager, admin (vendor sees only their own)
**Query params:** `?status=draft|issued|delivered|cancelled&vendorId=string`
**Response `200`:**
```json
{ "purchaseOrders": [ { ...PurchaseOrder } ] }
```

#### GET `/api/purchase-orders/:id`
**Auth:** any role
**Response `200`:**
```json
{ ...PurchaseOrder }
```

#### POST `/api/purchase-orders`
**Auth:** procurement_officer
Auto-generates PO from an approved quotation. Auto-assigns poNumber.
**Body:**
```json
{ "approvalId": "string" }
```
**Response `201`:**
```json
{ ...PurchaseOrder }
```

#### PATCH `/api/purchase-orders/:id/status`
**Auth:** procurement_officer
**Body:**
```json
{ "status": "issued | delivered | cancelled" }
```
**Response `200`:**
```json
{ ...PurchaseOrder }
```

---

### 8. INVOICES

#### GET `/api/invoices`
**Auth:** procurement_officer, manager, admin
**Query params:** `?status=generated|sent|paid&vendorId=string`
**Response `200`:**
```json
{ "invoices": [ { ...Invoice } ] }
```

#### GET `/api/invoices/:id`
**Auth:** any role
**Response `200`:**
```json
{ ...Invoice }
```

#### POST `/api/invoices`
**Auth:** procurement_officer
Generate invoice from a Purchase Order. Auto-assigns invoiceNumber.
**Body:**
```json
{ "purchaseOrderId": "string" }
```
**Response `201`:**
```json
{ ...Invoice }
```

#### GET `/api/invoices/:id/pdf`
**Auth:** procurement_officer, manager, admin
Returns binary PDF for download and print.
**Response `200`:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-2024-0001.pdf"
(binary PDF data)
```

#### POST `/api/invoices/:id/email`
**Auth:** procurement_officer
**Body:**
```json
{ "recipientEmail": "string" }
```
**Response `200`:**
```json
{ "message": "Invoice emailed successfully", "sentTo": "string", "sentAt": "ISO8601 string" }
```

---

### 9. DASHBOARD

#### GET `/api/dashboard`
**Auth:** any role (response filtered by role)
**Response `200`:**
```json
{
  "pendingApprovals": "number",
  "activeRFQs": "number",
  "totalVendors": "number",
  "monthlySpend": "number",
  "recentPurchaseOrders": [
    { "id": "string", "poNumber": "string", "vendorId": "string", "grandTotal": "number", "status": "string", "createdAt": "string" }
  ],
  "recentInvoices": [
    { "id": "string", "invoiceNumber": "string", "grandTotal": "number", "status": "string", "createdAt": "string" }
  ],
  "monthlyProcurementTrend": [
    { "month": "string (e.g. Jan)", "spend": "number", "poCount": "number" }
  ]
}
```

---

### 10. NOTIFICATIONS

#### GET `/api/notifications`
**Auth:** any role (returns notifications for logged-in user only)
**Response `200`:**
```json
{ "notifications": [ { ...Notification } ], "unreadCount": "number" }
```

#### PATCH `/api/notifications/:id/read`
**Auth:** any role
**Response `200`:**
```json
{ "message": "Notification marked as read" }
```

#### PATCH `/api/notifications/read-all`
**Auth:** any role
**Response `200`:**
```json
{ "message": "All notifications marked as read" }
```

---

### 11. ACTIVITY LOGS

#### GET `/api/logs`
**Auth:** admin, manager
**Query params:** `?entityType=string&userId=string&limit=number&page=number`
**Response `200`:**
```json
{ "logs": [ { ...ActivityLog } ], "total": "number" }
```

---

### 12. REPORTS & ANALYTICS

#### GET `/api/reports/vendor-performance`
**Auth:** admin, manager, procurement_officer
**Response `200`:**
```json
{
  "vendors": [
    {
      "vendorId": "string",
      "vendorName": "string",
      "totalQuotations": "number",
      "wonQuotations": "number",
      "avgDeliveryDays": "number",
      "totalPOValue": "number",
      "rating": "number"
    }
  ]
}
```

#### GET `/api/reports/procurement-summary`
**Auth:** admin, manager
**Query params:** `?from=ISO8601&to=ISO8601`
**Response `200`:**
```json
{
  "totalSpend": "number",
  "totalPOs": "number",
  "totalInvoices": "number",
  "totalRFQs": "number",
  "avgApprovalTime": "number (hours)",
  "monthlyTrend": [ { "month": "string", "spend": "number" } ]
}
```

---

## Error Response Format
All errors follow this shape:
```json
{
  "error": true,
  "message": "Human readable error message",
  "code": "ERROR_CODE_STRING"
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Not authorized (wrong role) |
| 404 | Not found |
| 500 | Server error |

---

## Workflow State Transitions

```
RFQ:        draft → open → closed | cancelled
Quotation:  submitted → shortlisted | rejected
Approval:   pending → approved | rejected
PO:         draft → issued → delivered | cancelled
Invoice:    generated → sent → paid
```

---

## Frontend Mock API Notes
Frontend must create `mockApi.js` mirroring every function in `api.js`.
When swapping to real backend, only the import line changes — no component changes.

```js
// During development (no backend needed)
import { getVendors, createRFQ } from './mockApi';

// After backend is ready — ONE LINE CHANGE
import { getVendors, createRFQ } from './api';
```

---

## Tech Stack Agreement
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT — token stored in localStorage |
| PDF | pdfkit |
| Email | Nodemailer |
| File Uploads | Multer (local /uploads folder) |

---

## Folder Structure Agreement
```
vendorbridge/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── vendors.js
│   │   ├── rfqs.js
│   │   ├── quotations.js
│   │   ├── approvals.js
│   │   ├── purchaseOrders.js
│   │   ├── invoices.js
│   │   ├── dashboard.js
│   │   ├── notifications.js
│   │   ├── logs.js
│   │   └── reports.js
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   │   ├── auth.js        ← JWT verify
│   │   └── roleCheck.js   ← role-based access
│   ├── utils/
│   │   ├── pdfGenerator.js
│   │   ├── emailSender.js
│   │   └── autoNumber.js  ← PO-2024-0001, INV-2024-0001
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── api.js
│   │   │   └── mockApi.js
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
└── CONTRACT.md
```

---

*Last updated: Hackathon Day 1 — agree any changes verbally before editing.*
