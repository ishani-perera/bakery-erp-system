# 🍞 Bakery Management ERP System

> A modern full-stack ERP solution for bakery businesses to manage products, orders, inventory, and daily operations efficiently.

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/Node.js-20-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-black?logo=express" />
  <img src="https://img.shields.io/badge/MySQL-Database-orange?logo=mysql" />
  <img src="https://img.shields.io/badge/JWT-Authentication-red" />
  <img src="https://img.shields.io/badge/License-MIT-purple" />
</p>

---

# 📌 Overview

The **Bakery Management ERP System** is a professional web-based business management platform developed for small and medium-scale bakery businesses.

The system helps bakery owners and staff manage:

* 📦 Products
* 🧾 Orders
* 🥖 Inventory
* 📊 Sales Analytics
* 🔐 User Authentication

This project was developed using a modern **full-stack JavaScript architecture** with React, Node.js, Express.js, and MySQL. 

---

# ✨ Features

## 📊 Dashboard

* KPI Cards

  * Today's Orders
  * Daily Revenue
  * Low Stock Items
  * Active Products
* 7-Day Sales Chart
* Recent Orders Table

## 🛒 Products Management

* Add / Edit / Delete Products
* Product Search
* Stock Quantity Tracking
* Low Stock Badges

## 🧾 Orders Management

* Create Customer Orders
* Multiple Order Items
* Auto Total Calculation
* 5% Tax Calculation
* Order Status Management

## 🥖 Inventory Management

* Ingredient Tracking
* Quantity Monitoring
* Minimum Stock Alerts
* Update Ingredient Levels

## 🔐 Authentication & Security

* JWT Authentication
* bcrypt Password Hashing
* Protected Routes
* Role-Based Access Control

---

# 🛠️ Tech Stack

## Frontend

| Technology       | Purpose           |
| ---------------- | ----------------- |
| React 18         | Frontend UI       |
| Vite             | Fast Build Tool   |
| React Router DOM | Routing           |
| Axios            | API Requests      |
| Recharts         | Dashboard Charts  |
| CSS Modules      | Component Styling |

## Backend

| Technology | Purpose               |
| ---------- | --------------------- |
| Node.js    | Runtime Environment   |
| Express.js | REST API Backend      |
| MySQL      | Database              |
| JWT        | Authentication        |
| bcryptjs   | Password Hashing      |
| dotenv     | Environment Variables |
| cors       | API Security          |

---

# 🏗️ System Architecture

The system follows a **three-tier architecture**:

```text
Frontend (React + Vite)
        ↓
Backend API (Node.js + Express)
        ↓
Database (MySQL)
```

The frontend communicates with the backend using REST APIs and JSON responses. 

---

# 📂 Project Structure

```bash
bakery-erp-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│   │
│   └── public/
│
├── server/
│   ├── routes/
│   ├── middleware/
│   ├── database/
│   └── index.js
│
└── README.md
```

---

# 🚀 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/bakery-erp-system.git

cd bakery-erp-system
```

---

# ⚙️ Frontend Setup

## Navigate to Client Folder

```bash
cd client
```

## Install Dependencies

```bash
npm install
```

## Start Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# ⚙️ Backend Setup

## Navigate to Server Folder

```bash
cd ../server
```

## Install Dependencies

```bash
npm install
```

## Create `.env` File

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=bakery_db

JWT_SECRET=your_secret_key
```

## Start Backend Server

```bash
npm start
```

Backend runs on:

```bash
http://localhost:5000
```

---

# 🗄️ Database Setup

## Create MySQL Database

```sql
CREATE DATABASE bakery_db;
```

## Import SQL Schema

```bash
mysql -u root -p bakery_db < schema.sql
```

---

# 🔐 Authentication Flow

1. User logs in
2. Server validates credentials
3. JWT token is generated
4. Token stored in localStorage
5. Protected routes use JWT verification middleware



---

# 📡 REST API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

## Products

```http
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

## Orders

```http
GET    /api/orders
POST   /api/orders
PUT    /api/orders/:id
```

## Inventory

```http
GET    /api/inventory
POST   /api/inventory
PUT    /api/inventory/:id
```

---

# 📸 System Modules

| Module    | Description           |
| --------- | --------------------- |
| Dashboard | KPI cards & analytics |
| Products  | Product management    |
| Orders    | Order processing      |
| Inventory | Ingredient tracking   |
| Login     | Secure authentication |



---

# 🔒 Security Features

✅ JWT Authentication
✅ bcrypt Password Hashing
✅ Role-Based Access Control
✅ Parameterized SQL Queries
✅ Environment Variable Protection
✅ CORS Security



---

# 🧪 Testing

## Frontend

```bash
npm run dev
```

## Backend

```bash
npm start
```

## API Testing

Use:

* Postman
* Thunder Client

---

# 📈 Future Enhancements

* Online Ordering System
* Payment Gateway Integration
* Barcode Scanning
* Product Image Upload
* Mobile Application
* Multi-Branch Support
* Supplier Management



---

# 👨‍💻 Developed By

### Ishani Perera

* BSc (Hons) Computer Science Undergraduate
* Informatics Institute of Technology (IIT)
* University of Westminster

---

# 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/your-feature
git commit -m "Add new feature"
git push origin feature/your-feature
```

---

# ⭐ Support

If you like this project, give it a ⭐ on GitHub.

---

# 📜 License

This project is licensed under the MIT License.

---

# ❤️ Thank You

Made with dedication for modern bakery business management systems.
