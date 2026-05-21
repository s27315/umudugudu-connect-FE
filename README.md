# Umudugudu Connect — Frontend

**IGIRE Rwanda / SheCanCODE Capstone Project**

A community management platform for Umudugudu (village) administration in Rwanda, enabling citizens, Isibo Leaders, Village Leaders, and Admins to manage activities, attendance, penalties, payments, and service requests.

---

## My Contributions

### US-1.2 — Role Assignment by Admin
**Epic:** E1 — Authentication & User Management
**Priority:** 🔴 HIGH | 5 Story Points

Admin (District / MINALOC) can search any registered user by phone number and assign or update their role so the correct dashboard and permissions are shown when that user logs in.

**What was built:**
- Search user by phone number
- Display user card with name, phone, village, and current role
- Select and save a new role (Citizen / Isibo Leader / Village Leader)
- Role badge updates immediately after save (no refresh needed)
- Success and error feedback messages
- Auth guard — only Admin can access this page

**Route:** `/admin/roles`

---

### US-2.3 — Mark Attendance
**Epic:** E2 — Activity Management
**Priority:** 🔴 HIGH | 5 Story Points

Isibo Leader can mark attendance for each household member during or after an activity so the Village Leader has accurate participation records.

**What was built:**
- List all household members for a given activity
- Mark each member Present or Absent with toggle buttons
- Real-time save — each tap immediately calls the API
- Absent members flagged with "⚑ Flagged for penalty review"
- Summary bar showing Total / Present / Absent / Pending counts
- **Offline-first** — if connectivity is lost, attendance is saved to localStorage and auto-syncs when back online
- Offline banner, syncing banner, and sync success banner
- Auth guard — only Isibo Leader can access this page

**Route:** `/isibo/attendance/:activityId`

---

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── roleApi.js          # Role assignment & login API calls
│   │   └── attendanceApi.js    # Attendance API calls
│   ├── components/
│   │   ├── AdminRoute.jsx      # Auth guard for Admin pages
│   │   └── IsiboLeaderRoute.jsx # Auth guard for Isibo Leader pages
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── RoleAssignment.jsx  # US-1.2 page
│   │   └── MarkAttendance.jsx  # US-2.3 page
│   ├── App.jsx                 # Routes
│   └── main.jsx                # Entry point
├── .env                        # API base URL config
└── package.json
```

---

## Tech Stack

- **React 18** with Vite
- **React Router DOM** — client-side routing
- **Axios** — HTTP requests with JWT auth interceptor
- **localStorage** — offline attendance queue

---

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Environment Variables

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Update this URL once the backend team shares their API.

---

## API Endpoints Expected from Backend

### Auth (US-1.1 — Backend team)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{ email, password }` | `{ token, role }` |

### Role Assignment (US-1.2)
| Method | Endpoint | Params / Body | Response |
|--------|----------|---------------|----------|
| GET | `/api/users/search` | `?phone=...` | `{ id, name, phone, village, role }` |
| PATCH | `/api/users/:id/role` | `{ role }` | success |

### Attendance (US-2.3)
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/activities/:activityId/members` | `{ activity: { name, date, location }, members: [{ id, name, household, status }] }` |
| POST | `/api/activities/:activityId/attendance` | `{ records: [{ memberId, status }] }` |

---

## Team

| Name | GitHub | Role |
|------|--------|------|
| Shadia | [@s27315](https://github.com/s27315) | Frontend — US-1.2, US-2.3 |

---

*Umudugudu Connect — IGIRE Rwanda / SheCanCODE Capstone | Confidential*
