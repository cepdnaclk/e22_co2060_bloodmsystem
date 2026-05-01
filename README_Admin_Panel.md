# 🩸 Blood Bank Management System - Admin Control Center

This document outlines the architecture, responsibilities, and implementation details for the **Admin Panel** of the Blood Bank Management System.

---

## 🎯 1. Admin Responsibilities

The Admin Panel is designed as a **Control Center**. It focuses strictly on management, monitoring, and oversight. 

**Admins CAN:**
- Manage Users (Approve doctors, block users, manage staff).
- Manage Blood Banks (Add, update, activate/deactivate).
- Monitor Global Inventory (Check stock, view expiries).
- Control Transfusion/Blood Requests (View all, oversee approvals).
- Handle Emergencies (Broadcast urgent shortages to users/banks).
- View Reports (Monthly usage, donation trends, regional shortages).

**Admins DO NOT:**
- Request blood for patients (Doctor's job).
- Donate blood directly through this portal (Donor's job).

---

## 🧱 2. Layout & UI Structure

The Admin UI follows a standard **Sidebar + Topbar** layout to maximize workspace and keep navigation predictable.

```text
-------------------------------------------------
|  Sidebar         |          Topbar            |
|------------------|----------------------------|
|  Dashboard       |                            |
|  Blood Banks     |                            |
|  Inventory       |      Main Content Area     |
|  Users           |      (Data Tables,         |
|  Requests        |       Charts,              |
|  Donations       |       Action Modals)       |
|  Emergency 🚨    |                            |
|  Reports         |                            |
|  Settings        |                            |
-------------------------------------------------
```

---

## 🎨 3. Page Designs & Features

### 🔷 Dashboard
- **Visuals:** Summary Cards (Total Units, Active Requests, Low Stock Alerts, Total Donors).
- **Purpose:** At-a-glance health of the entire blood bank network.

### 🔷 Blood Banks
- **Visuals:** Data Table (`Name | Location | Contact | Status | Actions`).
- **Actions:** Add new bank, Edit details, Activate/Deactivate.

### 🔷 Inventory
- **Visuals:** Data Table (`Blood Bank | Blood Group | Units | Expiry | Status`).
- **Features:** Filter by blood group, highlight low stock rows in red.

### 🔷 Users
- **Visuals:** Tabs for `Doctors`, `Donors`, and `Staff`. Data table for each.
- **Actions:** Approve doctor registrations, Block/Unblock users, Change roles.

### 🔷 Requests
- **Visuals:** Data Table (`Patient | Blood | Units | Doctor | Status | Action`).
- **Actions:** View all global requests, override/approve/reject if necessary.

### 🔷 Emergency Panel 🚨
- **Visuals:** High-contrast panel.
- **Features:** Lists critical shortages and active emergency requests. One-click broadcast alerts to donors and nearby banks.

### 🔷 Reports
- **Visuals:** Charts and Graphs.
- **Metrics:** Monthly usage, donation trends, regional shortages.

---

## ⚛️ 4. React Frontend Structure

The React application uses a layout wrapper to keep the Sidebar and Topbar persistent.

```text
frontend/src/
 ├── components/
 │    └── layout/
 │         ├── AdminSidebar.jsx
 │         ├── AdminTopbar.jsx
 │         └── AdminLayout.jsx
 ├── pages/
 │    └── admin/
 │         ├── AdminDashboard.jsx
 │         ├── ManageBloodBanks.jsx
 │         ├── ManageInventory.jsx
 │         ├── ManageUsers.jsx
 │         ├── ManageRequests.jsx
 │         ├── EmergencyControl.jsx
 │         └── SystemReports.jsx
 └── App.jsx (Routing with RoleRoute protection)
```

**Protection Example (`App.jsx`):**
```jsx
<Route element={<RoleRoute allowedRoles={['admin']} />}>
    <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* ...other admin routes */}
    </Route>
</Route>
```

---

## 🔐 5. Backend Django APIs & Protection

The backend must mirror the frontend's strict access control. Every API endpoint used by the Admin Panel must verify the user's role.

**Custom Permission Class (`permissions.py`):**
```python
from rest_framework.permissions import BasePermission

class IsAdminUserRole(BasePermission):
    """
    Allows access only to users with the 'admin' role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')
```

**Example API Endpoints:**

- **Users:**
  - `GET /api/v1/admin/users/`
  - `PATCH /api/v1/admin/users/<id>/`
- **Blood Banks:**
  - `GET /api/v1/admin/bloodbanks/`
  - `POST /api/v1/admin/bloodbanks/`
- **Inventory:**
  - `GET /api/v1/admin/inventory/`
  - `PATCH /api/v1/admin/inventory/<id>/`

---

## 🎯 6. Design & UX Guidelines

1. **Keep it Clean:** Avoid clutter. Use modals for "Add/Edit" forms rather than redirecting to new pages.
2. **Data Heavy, UI Light:** Use data tables with sorting, filtering, and pagination.
3. **Color Coding:** 
   - 🔴 **Red:** Critical/Low Stock/Emergencies/Rejected
   - 🟡 **Yellow/Orange:** Pending/Warnings
   - 🟢 **Green:** Safe/Approved/Online
4. **Consistency:** Ensure all tables share the same design language and pagination mechanics.

---

## 🚀 7. Next Steps for Development

1. **Backend:** Implement the `IsAdminUserRole` permission class and build out the `/api/v1/admin/...` endpoints.
2. **Frontend UI Shell:** Create the `AdminLayout`, `AdminSidebar`, and `AdminTopbar` components.
3. **Frontend Pages:** Scaffold out the individual page components (Dashboard, Users, Inventory) using dummy data first.
4. **Integration:** Connect the React pages to the Django APIs using `axios`, handling loading and error states.
5. **Refinement:** Add charts to Reports, sorting/filtering to tables, and SweetAlerts for destructive actions.

