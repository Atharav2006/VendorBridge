<div align="center">
  <img src="./logo.png" alt="VendorBridge Logo" width="200" />
  <h1>VendorBridge</h1>
  <p><strong>Next-Generation Enterprise Procurement & Vendor Management Platform</strong></p>
</div>

<br />

VendorBridge is an enterprise-grade SaaS platform designed to streamline and automate the entire procurement lifecycle. From vendor onboarding and Request For Quotations (RFQs), to Purchase Order (PO) generation and Invoice reconciliation, VendorBridge provides an intelligent, automated, and cryptographically auditable pipeline for high-level finance and procurement teams.

## 🎥 Demo Video

Watch our complete platform walkthrough:
[**demo video.mp4**](#) *(Replace this # with your Google Drive / YouTube link)*

## 🌟 Key Features

*   **Role-Based Access Control (RBAC):** Tailored dashboards and permissions for **Admins, Finance Managers, Procurement Officers, and Vendors**.
*   **Automated Procurement Pipeline:** Seamlessly convert winning RFQ Bids into Purchase Orders, and Purchase Orders into Invoices without manual data entry.
*   **Real-time Analytics:** Live, dynamic tracking of active vendors, generated RFQs, procurement savings, and invoice statuses.
*   **Approval Workflows:** Multi-tier authorization logic ensuring financial security (e.g., Procurement approves bids -> Finance Manager approves POs).
*   **Immutable Activity Logs:** Cryptographic-style tracking of all system actions for enterprise compliance and auditing.
*   **Modern UI/UX:** A stunning, glassmorphic, and highly responsive user interface built with Framer Motion and Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React.js (via Vite)
*   **Styling:** Tailwind CSS + Vanilla CSS (for glassmorphism)
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **Routing:** React Router DOM
*   **State Management/API:** Axios + React Context API

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB & Mongoose
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt.js
*   **File Generation:** PDFKit (for in-memory PO/Invoice generation)
*   **Security:** CORS, Helmet, express-rate-limit

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB (Local instance or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/Atharav2006/VendorBridge.git
cd VendorBridge
```

### 2. Setup the Backend
```bash
cd Backend
npm install
```
Create a `.env` file in the `Backend` directory with the following:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vendorbridge
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window and navigate to the frontend folder:
```bash
cd Frontend
npm install
```
Create a `.env` file in the `Frontend` directory:
```env
VITE_API_URL=http://localhost:3000/api
```
Start the frontend development server:
```bash
npm run dev
```

## 👥 User Roles & Demo Flow

To fully test the application, you can simulate the workflow using these roles:

1.  **Procurement Officer:** Creates an RFQ and assigns it to a vendor.
2.  **Vendor:** Submits a quotation/bid for the assigned RFQ.
3.  **Procurement Officer:** Approves the vendor's bid.
4.  **Finance Manager:** Provides final financial approval, which automatically generates a PO.
5.  **Vendor:** Views the PO, accepts it, and generates an invoice.
6.  **Admin / Finance:** Reconciles the invoice (marks as Paid) and reviews global system Activity Logs.

## 🔒 Security & Compliance
All actions are logged in the `ActivityLogs` collection. Route endpoints are guarded by a custom `roleCheck` middleware ensuring users can only access endpoints authorized for their specific clearance level.

---
*Built for the Hackathon 2026. Designed for the Future of Procurement.*
