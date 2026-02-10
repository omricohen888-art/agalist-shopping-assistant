# 🛒 Agalist - Smart Shopping Assistant

![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=azure-devops&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![RTL](https://img.shields.io/badge/RTL-Supported-0052CC?style=for-the-badge)
![Lovable](https://img.shields.io/badge/Developed%20with-Lovable-FF4F81?style=for-the-badge)

> **Agalist** is a smart shopping companion designed to streamline list management. By leveraging **Microsoft Azure** for robust hosting and **Supabase** for real-time data synchronization, Agalist ensures that your shopping list is always accessible and up-to-date across all your devices.

<br>
<table align="center">
  <tr>
    <td align="center" width="30%">
      <b>📱 Mobile View</b><br><br>
      <img src="https://github.com/user-attachments/assets/aa103faf-57cd-4d49-88a4-b529435784d2" width="100%" alt="Mobile App Interface">
    </td>
    <td align="center" width="70%">
      <b>💻 Desktop Dashboard</b><br><br>
      <img src="https://github.com/user-attachments/assets/a9cbf438-6458-4700-b631-dfa16cb1e1b9" width="100%" alt="Desktop Dashboard Interface">
    </td>
  </tr>
</table>
<br>

<p align="center">
  🌐 <b>Live Demo:</b> 
  <a href="https://icy-plant-07a95c31e.4.azurestaticapps.net" target="_blank">Launch Agalist App</a>
</p>

---

## 🚀 Application Modules & Capabilities

Agalist is built with a focus on UX, efficiency, and system control. Here is a breakdown of the core modules:

### 1. Smart List Management
* **Intuitive Item Entry:** Quickly add items with smart suggestions.
* **Categories & Organization:** Items are automatically sorted to optimize the shopping path.
* **Language Focus:** The application is tailored specifically for the **Hebrew** language, featuring a fully optimized **Right-to-Left (RTL)** interface.

### 2. Financial Insights & Budgeting 💰
* **Expense Tracking:** Provides real-time visibility into estimated shopping costs.
* **Smart Summaries:** Helps users track their spending habits and manage the budget effectively during the shopping trip.

### 3. Real-Time Data Sync
* **Cross-Device Synchronization:** Powered by Supabase Realtime, changes made on one device (e.g., desktop) appear instantly on others (e.g., mobile). No refresh required.
* **Live Status Updates:** Instant visual feedback when items are marked as "bought" or edited.

### 4. Admin & System Control 🛡️
* **Administrative Dashboard:** A secured backend interface for monitoring user statistics, active lists, and system health.
* **Maintenance Mode:** A global "kill-switch" capability. Admins can toggle the system offline for updates, instantly redirecting all active users to a maintenance page via real-time listeners.
* **Enhanced Security:** Critical actions (like changing settings or accessing the dashboard) are protected by a secondary "Master Password" layer and environment-variable based credentials (`Defense in Depth` strategy).

### 5. User Experience (UX)
* **Cross-Platform Design:** A fully responsive interface that adapts seamlessly from desktop monitors to mobile screens.
* **PWA Support:** Installable as a native-like app on iOS and Android devices for offline access and quick launch.
* **Secure Authentication:** Frictionless login using Google OAuth or Magic Links.

---

## 🏗️ Technical Architecture

This project serves as a showcase of modern cloud-native development:

* **Frontend:** Built with **React** and **Vite** for lightning-fast performance.
* **Backend & Database:** Utilizes **Supabase (PostgreSQL)** for structured data storage, **RPC Functions** for admin statistics, and **Row Level Security (RLS)**.
* **DevOps & CI/CD:**
    * Code is managed in **GitHub**.
    * Automated workflows trigger deployment to **Azure Static Web Apps** on every push to the main branch.
    * Environment variables are securely managed via Azure Configuration.

---

## 🛠️ AI-Augmented Workflow

This project demonstrates a high-efficiency development cycle using AI-driven tools:

* **Lovable:** Used for rapid UI prototyping, component scaffolding, and initial logic generation.
* **Cursor:** Employed as the primary IDE for advanced refactoring, TypeScript strict-typing optimization, and complex bug resolution.
* **VS Code:** Final integration environment for testing and deployment management.

---

## 🔒 Access Notice

**Please Note:** This repository is for review and portfolio purposes only.
Local installation and execution are restricted to the owner to ensure the security of private API configurations and cloud resources.

---

## 👨‍💻 Connect with Me
* **Author:** Omri Cohen (IT Student & Full Stack Enthusiast)
* **LinkedIn:** <a href="https://www.linkedin.com/in/omri-cohen-it/" target="_blank">Omri Cohen Profile</a>
