
# When change update
git add .
git commit -m "Update project"
git push

/admin  → Admin dashboard (React)
/client → Portfolio website (React)
/server → Backend API (Node/Express/MongoDB)


# Project Documentation

## 📂 Project Structure

This project is a Monorepo containing three main components:

-   **/admin**: React-based dashboard for managing the portfolio content.
-   **/client**: React-based portfolio website.
-   **/server**: Node.js & Express backend API connecting to MongoDB.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v14 or higher)
-   [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)

## 🛠️ Setup Instructions

### 1. Server (Backend)

The backend handles API requests and database connections.

```bash
cd server
npm install
```

**Configuration (.env):**
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

**Run Server:**
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### 2. Admin Panel (Dashboard)

The admin panel allows you to manage projects, skills, and other content.

```bash
cd admin
npm install
```

**Configuration (.env):**
Create a `.env` file in the `admin` directory with your login credentials:
```env
VITE_ADMIN_EMAIL=admin@gmail.com
VITE_ADMIN_PASSWORD=admin123
```

**Run Admin:**
```bash
npm run dev
# Admin runs on http://localhost:5173 (usually)
```

---

### 3. Client (Portfolio Website)

The main portfolio website visible to visitors.

```bash
cd client
npm install
```

**Run Client:**
```bash
npm run dev
# Client runs on http://localhost:5174 (usually)
```

## ✨ Features

-   **Dynamic Content**: Admin panel updates reflect immediately on the portfolio.
-   **Authentication**: Secure login for the admin dashboard.
-   **Responsive Design**: Mobile-friendly interfaces for both client and admin.
-   **RESTful API**: Clean API structure for data fetching.

## 💻 Tech Stack

-   **Frontend**: React, Vite, CSS Modules/Styled Components
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB, Mongoose
-   **State Management**: React Hooks (useState, useEffect)
