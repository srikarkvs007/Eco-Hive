# Eco-Hive 🌍🐝

Eco-Hive is a modern web application built with a **PERN Stack** (PostgreSQL, Express.js, React, Node.js). It provides a full-stack dashboard for managing users, orders, and vehicle dispatches. 

## Tech Stack
* **Frontend:** React.js, React Router, Axios, Bootstrap
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (hosted on Neon)
* **ORM:** Prisma
* **Security:** JWT Authentication, Bcrypt Password Hashing

## Features
* Secure User Registration & Login flow.
* Full CRUD capabilities for adding and viewing Delivery Orders.
* Management dashboard for dispatching Vehicles.
* Modern, responsive interface.
* Fully deployed Serverless PostgreSQL database architecture.

## How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-username/eco-hive.git
cd eco-hive
```

### 2. Setup the Backend
Open a terminal and navigate to the `server` directory:
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder with the following variables:
```env
DATABASE_URL="your_neon_postgres_connection_string"
JWT_SECRET="your_secret_key"
```

Push the database schema and start the server:
```bash
npx prisma db push
npm start
```
*(The backend will run on `http://localhost:5001`)*

### 3. Setup the Frontend
Open a new terminal and navigate to the `client` directory:
```bash
cd client
npm install
npm start
```
*(The frontend will run on `http://localhost:3000`)*

## Database GUI
To view and manage your live database tables easily, navigate to your `server` directory and run:
```bash
npx prisma studio
```
This will open a visual dashboard at `http://localhost:5555`.
