# 🚀 RevX Backend (Node.js + Express + MongoDB)

![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue)

> Backend service for the **Employee Performance Review System (RevX)** — powering APIs, authentication, notifications, and data management.

---

## 🧠 Overview

RevX backend handles:
- 🔐 **Authentication & Role-Based Access Control (RBAC)**
- 🎯 **Goal & Task Management APIs**
- 🗓️ **Review Scheduling & Notifications**
- 💬 **Feedback & Self-Assessment Modules**
- 📊 **Reporting & Analytics**

---

## 🗂️ Project Structure

```bash
revx-be/
├── config/           # Database & app configuration
├── controllers/      # Request handlers for each module
├── middleware/       # Auth & validation middlewares
├── models/           # MongoDB schemas using Mongoose
├── routes/           # Express routes
├── Services/         # Business logic services
├── utils/            # Utility helpers
├── uploads/          # File uploads directory
├── app.js            # Express app entry
├── server.js         # Server bootstrap
└── .env.example      # Environment variable template
