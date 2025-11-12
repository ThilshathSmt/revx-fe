# 💼 RevX Frontend – Employee Performance Review System (Client)

The RevX Frontend provides an interactive interface for HR Admins, Managers, and Employees to collaborate in the performance review process.
Built using **Next.js**,** NextAuth**, **MUI**, and **Tailwind CSS**.

---

## 🧠 Project Overview

This backend handles:
- Role-based dashboards for HR, Manager, and Employee
- Goal and task tracking with progress indicators
- Self-assessment and feedback submission
- Performance review scheduling and notifications
- Data analytics and reporting APIs

---

## 🏗️ Tech Stack

| Technology | Description |
|-------------|-------------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white) | React Framework |
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) | Frontend library |
| ![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?logo=auth0&logoColor=white) | Secure authentication |
| ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white) | JSON Web Token authentication |
| ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white) | Styling framework |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white) | API calls |
| ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white) | Data visualization |


---

## 🧬 System Architecture

The following diagram illustrates the overall architecture of the **RevX Backend System**:

<p align="center">
  <img src="./assets/images/architecture.jpeg" alt="RevX Architecture Diagram" width="700"/>
</p>



=======================================================================
| Feature         | Endpoint             | Method     | Description               |
| --------------- | -------------------- | ---------- | ------------------------- |
| Authentication  | `/api/auth/login`    | POST       | User login (JWT)          |
| User Management | `/api/users`         | POST / GET | Create & fetch users      |
| Departments     | `/api/departments`   | CRUD       | Manage departments        |
| Teams           | `/api/teams`         | CRUD       | Manage teams and members  |
| Goals           | `/api/goals`         | CRUD       | Set and track goals       |
| Tasks           | `/api/tasks`         | CRUD       | Assign and manage tasks   |
| Reviews         | `/api/reviews`       | POST / PUT | Create goal/task review   |
| Notifications   | `/api/notifications` | GET        | Send alerts and reminders |
| Reports         | `/api/reports`       | GET        | Analytics and summaries   |

==========================================================================

# 🚀 Quick Start Guide

## Backend Setup

```bash
# Clone and setup
git clone https://github.com/ThilshathSmt/revx-be.git
cd revx-be
npm install

# Configure .env
touch .env
```

Add to `.env`:
```env
MONGO_URI=mongodb://localhost:27017/revx_be_1
JWT_SECRET=your-secret
PORT=5001
```

```bash
# Start server
npm run dev
```

---

## Frontend Setup

```bash
# Clone and setup
git clone https://github.com/ThilshathSmt/revx-fe.git
cd revx-fe
npm install

# Configure .env
touch .env
```

Add to `.env`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

```bash
# Start app
npm run dev
```

---

## 📋 Quick Reference

| Service  | URL                      | Port |
|----------|--------------------------|------|
| Frontend | http://localhost:3000    | 3000 |
| Backend  | http://localhost:5001    | 5001 |
| MongoDB  | mongodb://localhost:27017| 27017|

---

## ✅ Verify Installation

```bash
# Check backend
curl http://localhost:5001/api/health

# Check frontend
# Open browser: http://localhost:3000
```
==========================================================================

| Member           | Role                 | Contribution                                      |
| ---------------- | -------------------- | ------------------------------------------------- |
| **Thilshath SM** | Full Stack Developer | Review Scheduling, Notifications, API Integration |
| **Faskath MHM**  | Full Stack Developer | Authentication & Role Management (JWT / RBAC)     |
| **Muadh MRM**    | Full Stack Developer | Goal & Task APIs, CRUD Operations                 |
| **Fadhil MFM**   | Full Stack Developer | Feedback & Self-assessment APIs                   |
| **Haneef MNAR**  | Full Stack Developer | Reporting & Analytics APIs                        |

=========================================================================

| Command       | Description               |
| ------------- | ------------------------- |
| `npm run dev` | Start backend in dev mode |
| `npm start`   | Start in production mode  |
| `npm test`    | Run backend tests         |

=============================================================================

<p align="center">
  <img src="./assets\images\Backend_folderStructure.png" alt="RevX Backend Project folder Structure" width="700"/>
</p>

==========================================================================

📊 Deployment

Can be hosted on Render / EC2 / Vercel

Update .env with production MongoDB URI

Configure email credentials for Nodemailer
