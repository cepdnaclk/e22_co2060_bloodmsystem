# HOPEDROP Administration Dashboard - Backend Architecture Guide

This document outlines how the **Real-World Backend Architecture** for the HOPEDROP Admin Command Center should be developed, structured, and scaled to handle real-time medical logistics and high user traffic.

---

## 🏗️ 1. Architecture Overview (The Big Picture)

To support a live command center, the backend must move beyond basic CRUD and become an **Event-Driven Architecture**.

### The 3 Core Pillars:
1. **Core API Server (Django / Node.js)**: Handles business logic, authentication, and database writes.
2. **Real-time Server (WebSockets / Redis PubSub)**: Pushes live updates to the dashboard instantly so admins don't have to hit "refresh".
3. **Caching Layer (Redis)**: Serves static or slowly-changing dashboard metrics blazingly fast.

---

## 🔄 2. Real-World Data Flow

**Example Scenario: A Hospital needs O- Blood urgently.**
1. **Request**: Hospital submits an emergency request via the hospital portal.
2. **API Layer**: Backend API receives `POST /api/v1/requests`. It validates the request and stores it in PostgreSQL/MySQL.
3. **Event Trigger**: The backend publishes an event `emergency_request_created` to a Redis pub/sub channel.
4. **WebSocket Push**: The WebSocket server (listening to Redis) blasts this event to all connected `AdminDashboard` clients.
5. **Dashboard UI Update**: The React frontend receives the WebSocket message and instantly plays a notification sound, adding the new request to the **"Urgent Requests Pending"** table. 

---

## ⚡ 3. Traffic & API Scaling

When the system goes national, the dashboard APIs will be hit heavily.

### A. Pagination & Query Optimization
Instead of fetching all donors `GET /api/v1/donors` (which will crash when you hit 1 million donors), use cursor-based or limit/offset pagination:
```http
GET /api/v1/requests?status=pending&priority=emergency&limit=20&page=1
```

### B. Caching Dashboard Stats
The 4 main KPI blocks at the top of the dashboard should **never** query the main database directly.
* Use a scheduled background task (e.g., Celery or node-cron) to calculate "Total Active Units" and "Total Donors" every 5 minutes.
* Store these in Redis: `SET dashboard:total_donors 124000`
* Your `GET /api/v1/dashboard/stats` reads directly from Redis in `O(1)` time (sub-millisecond latency).

---

## 🚦 4. Blood Stock & Priority Logic

### Threshold Algorithms
The backend must assign "states" to blood types based on logic, not just return raw numbers.
```python
# Backend logic example
def calculate_stock_status(units_available, daily_burn_rate):
    days_left = units_available / daily_burn_rate
    
    if days_left <= 2:
        return "CRITICAL" # Returns RED to frontend
    elif days_left <= 7:
        return "LOW"      # Returns YELLOW to frontend
    else:
        return "SAFE"     # Returns GREEN to frontend
```
*The frontend simple applies the CSS class matching the string returned by the API.*

### Priority Queues
Hospital requests should be stored with ENUM priorities (`LOW`, `NORMAL`, `EMERGENCY`). The database index should prioritize sorting by `Priority DESC, CreatedAt ASC` to ensure FIFO rules apply, but emergencies *always* jump the queue.

---

## 🔐 5. Security & Access Control

The Command Center has god-mode privileges. Security must be air-tight.
- **JWT Authentication**: Short-lived Access Tokens (15 mins) and HTTP-only, secure Refresh Tokens.
- **Role-Based Access Control (RBAC)**: Ensure the backend verifies the `role === 'admin'` on *every* request hitting `/api/v1/admin/*`. Do not trust the frontend React router alone.
- **Audit Logging**: Every single action taken on the dashboard (e.g., clicking "Approve Request") must be logged in an append-only `audit_logs` table.
  * *Schema*: `admin_id`, `action_type`, `target_id`, `ip_address`, `timestamp`.

---

## 🚀 6. Deployment Mindset

To ensure 99.98% uptime for a medical system:

1. **Frontend**: Deploy the React app to Vercel, Netlify, or AWS S3 + CloudFront (CDN) for fast global edge delivery. Use domains like `admin.hopedrop.lk`.
2. **Backend**: Host API on AWS ECS, DigitalOcean App Platform, or Heroku.
3. **Database**: Managed PostgreSQL (e.g., AWS RDS) with automated daily backups and point-in-time recovery.
4. **Load Balancing**: Place an NGINX reverse proxy or AWS Application Load Balancer in front of the backend to distribute traffic across multiple server instances as demand grows.

## 🏁 Final Verification Checklist for Production
- [ ] Websocket connection disconnects and reconnects gracefully.
- [ ] No N+1 query problems in the dashboard API endpoints.
- [ ] JWT tokens are invalidated upon admin logout.
- [ ] Daily backups of the SQL database are active.
