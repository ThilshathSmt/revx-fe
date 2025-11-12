
---

## 🌐 **2️⃣ Frontend – `revx-fe` (Next.js + Tailwind + NextAuth)**

```markdown
# 💼 RevX Frontend – Employee Performance Review System (Client)

The **RevX Frontend** provides an interactive interface for HR Admins, Managers, and Employees to collaborate in the performance review process.  
Built using **Next.js**, **NextAuth**, and **Tailwind CSS**.

---

## 🧠 Project Overview

- Role-based dashboards for HR, Manager, and Employee  
- Goal and task tracking with progress indicators  
- Self-assessment and feedback submission  
- Performance review scheduling and notifications  
- Data-driven analytics and reports  

---

## 🏗️ Tech Stack

| Technology | Purpose |
|-------------|----------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white) | React Framework |
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) | Frontend library |
| ![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?logo=auth0&logoColor=white) | Secure authentication |
| ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white) | Styling framework |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white) | API calls |
| ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white) | Data visualization |

---

## 🧬 System Architecture

```mermaid
flowchart LR
    subgraph Frontend[Next.js App]
    A1[Login & Dashboards]
    A2[Goal / Task / Review Pages]
    end

    subgraph Backend[Node.js API]
    B1[/REST Endpoints/]
    B2[(MongoDB)]
    end

    A1 -->|Axios Calls| B1
    A2 -->|Fetch Data| B1
    B1 --> B2
