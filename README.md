# MIS for Hospital Management – Privacy Focused 🏥🔒

A state-of-the-art, role-based Hospital Management Information System (MIS) built for college project demonstration. Engineered using **React.js**, **Node.js/Express**, and **MongoDB**, featuring granular **Role-Based Access Control (RBAC)**, **PII Data Masking**, **EHR Confidentiality Protection**, and **Immutable Security Audit Logs**.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**
   - **👑 Admin**: Overall hospital metrics, doctor/staff management, privacy rules, system settings, and security audit logs.
   - **🩺 Doctor**: Assigned patients, medical history, clinical diagnosis logging, prescription writing, and schedule.
   - **📋 Staff / Receptionist**: Patient registration, appointment booking, and billing. *Medical diagnoses & sensitive PII are automatically masked or restricted.*
   - **👤 Patient**: Self-service portal to view personal health records, prescription list, upcoming appointments, and itemized bills.

2. **Privacy Shield & PII Masking**
   - Dynamic masking of Personally Identifiable Information (SSN: `•••-••-4819`, Phone: `+1 (•••) •••-5678`, Address) for unauthorized roles.
   - One-click **Global Anonymization Mode** toggle for GDPR & HIPAA compliance testing.

3. **Interactive Demo Role Switcher Bar**
   - Built-in header role selector allows evaluators to instantly switch between **Admin**, **Doctor**, **Staff**, and **Patient** views during presentation.

4. **Security Audit Logs Engine**
   - Real-time logging of user actions, API calls, endpoint targets, authorization status (`GRANTED` vs `DENIED`), IP addresses, and timestamps.

5. **Operational Analytics & Reports**
   - Interactive charts for patient admission growth, department workloads, disease breakdown, and one-click **CSV Report Exporter**.

---

## 🔑 Demo Account Credentials

| Role | Username | Password | Default User Name | Special Access |
|---|---|---|---|---|
| **Admin** | `admin` | `password123` | Alex Rivera | Full System, Audit Logs, Staff Management |
| **Doctor** | `dr_jenkins` | `password123` | Dr. Sarah Jenkins | EHR, Clinical Notes, Prescriptions |
| **Staff / Receptionist** | `receptionist` | `password123` | Nurse Mark Vance | Patient Intake, Appointments, Masked PII |
| **Patient** | `john_doe` | `password123` | John Doe | Personal Records, My Bills & Appointments |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or newer installed on your system.

### Running the Application

1. **Start Backend Express API Server**:
   ```bash
   cd server
   node server.js
   ```
   *(Note: The server uses an automated in-memory MongoDB fallback with pre-populated realistic demo data if local MongoDB service is absent).*

2. **Start Frontend React Application**:
   Open a second terminal window:
   ```bash
   cd client
   npm run dev
   ```
   Navigate to `http://localhost:3000` in your web browser.

---

## 📐 Technology Architecture

- **Frontend**: React.js, Vite, Lucide Icons, Recharts Analytics, Vanilla CSS Design System with Healthcare Theme & Glassmorphic Accents.
- **Backend**: Express.js REST API, Mongoose Models, JWT Authentication, RBAC Authorization Middleware, Audit Log Engine.
- **Database**: MongoDB (Mongoose schemas for `User`, `Patient`, `Appointment`, `MedicalRecord`, `Billing`, `AuditLog`).
