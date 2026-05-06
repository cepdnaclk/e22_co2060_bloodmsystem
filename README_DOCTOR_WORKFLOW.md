# Doctor-Donor-Inventory Workflow Guide

Welcome to the new fully integrated workflow connecting Doctors, the Inventory System, and Donors. This system replaces the static dashboard with a real-time responsive ecosystem.

## 🔄 The Request Lifecycle

1. **Doctor Creates Request (`PENDING`)**
   - The Doctor fills out the "Request Blood" form.
   - The system sets `priority_level` based on Urgency (NORMAL, HIGH, CRITICAL).
   - Saved with status `PENDING`.
2. **Admin/Blood Bank Approval (`APPROVED` or `REJECTED`)**
   - Inventory admin reviews the request.
   - If rejected, a `rejection_note` must be provided (visible to the Doctor).
   - If approved, the admin allocates the units (`units_approved`).
3. **Emergency Alerts (Automated)**
   - If the request is marked **HIGH** or **CRITICAL**, the system automatically queries eligible Donors.
   - Donors are strictly filtered by:
     - Matching Blood Group.
     - General Eligibility (No donation in the last 90 days).
     - Cooldown limit (`last_alerted_at` must be > 24 hours ago).
   - Alerts are capped at **30 donors** to prevent spamming.
4. **Fulfillment (Inventory Dashboard)**
   - The Inventory Admin logs into the **Blood Bank Dashboard** (`StaffDashboard`).
   - The Admin navigates to the **Doctor Requests** tab to view all incoming requests in real-time.
   - The Admin can **Approve** the request (allocating units) or **Reject** it (providing a mandatory reason).
   - Once approved or rejected, the Doctor sees the updated status and notes immediately on their dashboard.
   - The request transitions to `IN_PROGRESS` as donors donate or inventory is transported.
   - Once complete, it is marked as `FULFILLED` (or `COMPLETED`).

---

## 📱 Mobile Responsiveness

The Doctor Dashboard has been completely overhauled with SCSS (Sass):
- **Sidebar Navigation:** Collapses into a scrollable horizontal icon-bar at the top on devices < 768px.
- **Data Tables:** Allow horizontal scrolling on small screens instead of breaking the layout.
- **Form Layouts:** Two-column grids gracefully stack into single-column layouts.

---

## 📷 QR Scanner Workflow

The **Donor Scanner** tab uses the device's camera (via `html5-qrcode`) to scan a Donor's secure UUID (`qr_id`). 
1. The endpoint `/api/v1/donor/public/{qr_id}/` returns donor details.
2. The UI computes the `is_eligible` status dynamically (checking the 90-day gap rule).
3. **Green UI (✅):** The donor is eligible; doctor can proceed.
4. **Red UI (❌):** The donor is ineligible (shows last donation date).
*Edge Case Handled:* Scanning an invalid QR code gracefully alerts the user instead of crashing.

---

## 📊 Live Inventory

The "Blood Availability" tab is directly wired to the backend `LiveStockResponse`.
- Data is intelligently grouped by blood type (e.g., `A+`, `O-`).
- Units and Status (`NORMAL`, `LOW`, `CRITICAL`) are calculated in real-time.
- If the API fails or stock is entirely empty, a clean empty state with a "Retry Fetch" button is displayed.

## 🛠️ API Architecture Used
- **POST `/api/v1/bloodinventor/doctor/requests/`**: Create requests.
- **GET `/api/v1/bloodinventor/doctor/requests/`**: Fetch logged-in doctor's requests.
- **GET `/api/v1/bloodinventor/public/live-stock/`**: Real-time grouped inventory data.
- **GET `/api/v1/donor/public/{qr_id}/`**: Fetch secure donor details via QR.

---

## ✅ Camp Donor Workflow Phase (Newly Added)

This phase introduces a strict state machine for camp donation processing in the backend.

### 1. New status flow

`registered -> arrived -> screening -> approved/rejected -> donated`

Model: `backEnd/main/apps/donor/models/campRegistration.py`

### 2. New tracking fields on `CampRegistration`

- `arrived_at`
- `screened_at`
- `screened_by`
- `rejection_reason`
- `collected_at`
- `collected_by`

### 3. Transition APIs added

Base prefix: `/api/v1/donor/`

- **POST** `/camps/registrations/<id>/arrive/`  
  Mark donor as arrived at camp.
- **POST** `/camps/registrations/<id>/screening/`  
  Send donor to doctor screening queue.
- **POST** `/camps/registrations/<id>/approve/`  
  Doctor approves donor after screening.
- **POST** `/camps/registrations/<id>/reject/`  
  Doctor rejects donor with required reason.
- **POST** `/camps/registrations/<id>/donate/`  
  Staff marks donation complete (`donated` status).

Compatibility route retained:
- **POST** `/camps/registrations/<id>/complete/` (mapped to donate logic)

### 4. Transition validation rules

Only these transitions are accepted:

- `registered -> arrived`
- `arrived -> screening`
- `screening -> approved` or `screening -> rejected`
- `approved -> donated`

Invalid jumps return HTTP `400` with a transition error message.

### 5. Migration added

File: `backEnd/main/apps/donor/migrations/0006_registration_workflow_fields.py`

Data migration mapping:
- `pending -> registered`
- `completed -> donated`

### 6. What happens when status becomes `donated`

In one atomic backend transaction:
- registration updated to `donated`
- donor donation counters/date updated
- `DonationHistory` record created
- donor notification created

### 7. Role behavior in this phase

- **Blood camp staff (`bloodcamp`) / admin**: arrive, screening, donate actions
- **Doctor / admin**: approve and reject actions

### 8. Apply this phase locally

```bash
cd "backEnd/main"
python manage.py migrate
python manage.py test apps.donor --verbosity 2
```
