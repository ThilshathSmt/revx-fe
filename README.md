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
  <img src="./src/assets/Frontend_ArchitextureDigram.png" alt="RevX Architecture Diagram" width="700"/>
</p>





| Module          | Description                                    |
| --------------- | ---------------------------------------------- |
| Authentication  | Secure login using NextAuth                    |
| Dashboard       | Role-based views for HR, Manager, and Employee |
| Goal Management | Create, update, and track progress             |
| Task Tracking   | Assign, monitor, and review tasks              |
| Reviews         | Conduct goal & task review cycles              |
| Analytics       | Graphical performance insights using Chart.js  |


==========================================================================

# 🚀 Quick Start Guide

## Backend Setup


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

| Member           | Role                 | Feature Focus                       |
| ---------------- | -------------------- | ----------------------------------- |
| **Thilshath SM** | Full Stack Developer | Review Scheduling & Notification UI |
| **Faskath MHM**  | Full Stack Developer | Auth & Role-Based UI (NextAuth)     |
| **Muadh MRM**    | Full Stack Developer | Goal Setting & Progress Tracking    |
| **Fadhil MFM**   | Full Stack Developer | Feedback & Self-Assessment UI       |
| **Haneef MNAR**  | Full Stack Developer | Analytics Dashboard & Reports       |


=========================================================================

| Command       | Description               |
| ------------- | ------------------------- |
| `npm run dev` | Start backend in dev mode |
| `npm start`   | Start in production mode  |
| `npm test`    | Run backend tests         |

=============================================================================

## 📋 Folder Structure


revx-fe/
│
├── 📁 public/              # Static assets
│   └── 🖼️ Images, fonts, and public files
│
├── 📁 src/
│   ├── 📁 pages/           # Routes and Next.js pages
│   │   └── 🔗 Application routing
│   │
│   ├── 📁 components/      # Reusable UI elements
│   │   └── 🧩 React components
│   │
│   ├── 📁 styles/          # Tailwind styles
│   │   └── 🎨 CSS and styling files
│   │
│   ├── 📁 hooks/           # Custom React hooks
│   │   └── 🪝 Reusable logic hooks
│   │
│   └── 📁 utils/           # Helper functions
│       └── 🛠️ Utility functions
│
├── ⚙️ next.config.js       # Next.js configuration
├── 🎨 tailwind.config.js   # Tailwind CSS configuration
└── 📦 package.json         # Dependencies and scripts

=============================================================================

## 📊 Deployment
- Easily deployable on Vercel or Netlify
- Ensure environment variables are configured before deployment

