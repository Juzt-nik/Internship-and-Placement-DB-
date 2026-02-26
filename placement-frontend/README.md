# SRM HAVLOC – Placement Portal Frontend

React + Tailwind CSS frontend for the Student Internship & Placement DBMS.

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.jsx          ← Sidebar + main layout
│   ├── ProtectedRoute.jsx  ← Auth + role guard
│   └── UI.jsx              ← Reusable components (Button, Modal, Table, etc.)
├── context/
│   └── AuthContext.js      ← JWT auth state (login, logout, role checks)
├── pages/
│   ├── Login.jsx           ← Login page
│   ├── Activate.jsx        ← Student account activation with token
│   ├── Dashboard.jsx       ← Stats + charts overview
│   ├── Students.jsx        ← Full student CRUD + verify + token display
│   ├── Organizations.jsx   ← Organization CRUD
│   ├── Internships.jsx     ← Internship CRUD
│   ├── Applications.jsx    ← Applications + add rounds + mark selected
│   ├── Placements.jsx      ← Placement records + stats
│   └── Reports.jsx         ← Analytics dashboard with filterable charts
└── services/
    └── api.js              ← All Axios API calls mapped to backend routes
```

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start the app
```bash
npm start
```
Runs on http://localhost:3000

### 3. Make sure backend is running on port 5000
```bash
# In your backend folder:
npm run dev
```

---

## ⚠️ Backend Fix Required

In your `server.js`, the routes are registered AFTER `app.listen()`. This works in Express but it's a bad pattern — and more critically, the `errorHandler` is registered BEFORE routes, which means it won't catch errors from them.

**Fix server.js — move routes BEFORE listen:**

```js
// server.js correct order:
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Routes FIRST
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/organizations', require('./routes/organizationRoutes'));
app.use('/api/internships', require('./routes/internshipRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/placements', require('./routes/placementRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/rounds', require('./routes/roundRoutes'));

// Error handler LAST
app.use(require('./middleware/errorHandler'));

app.listen(process.env.PORT || 5000, () => console.log('Server running'));
```

Also in `reportService.js` there is a `resolve()` call inside a nested callback that is unreachable — the final resolve is shadowed by the outer one. The service still works but the outer `resolve` should be removed.

---

## 🎭 Role-Based Access

| Role              | Access |
|-------------------|--------|
| `admin`           | Everything |
| `placement_officer` | Students, Orgs, Internships, Applications, Placements, Reports |
| `hod`             | Students (verify), Orgs, Internships, Applications, Reports |
| `faculty`         | Students (verify), Internships, Applications, Reports |
| `student`         | Dashboard, Internships (view), Applications (apply) |

## 🔄 Key Flows

1. **Student Registration**: Admin/PO creates student shell → token generated → student goes to `/activate` → sets password → faculty/hod verifies → account activated
2. **Application Flow**: Student applies → PO adds rounds → rounds get Cleared/Eliminated → if all cleared, PO marks as Selected → student placement_status = Placed
3. **Internship**: PO/admin adds internship record linking student + organization
4. **Reports**: Faculty/HOD/PO can filter by year, CGPA range, organization, type
