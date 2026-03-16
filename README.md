
# ArenaX – E‑Sports Tournament Platform

ArenaX is a full‑stack web platform for managing online gaming tournaments.  
The system allows users to register, authenticate, and participate in competitive tournaments.

This project is developed as a **Final Project for the Full Stack Development course**.

---

# Architecture

ArenaX follows a modern full‑stack architecture with a clear separation between backend and frontend services.

## Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Swagger API Documentation
- Jest Testing

## Frontend
- React
- Vite
- TypeScript
- React Router
- Context API for Authentication

---

# Project Structure

```
finalproject_fsd
│
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── docs
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   └── tests
│
├── client
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   └── main.tsx
│
└── README.md
```

---

# Implemented Features (Phase 1)

## Authentication System

The project includes a complete authentication system:

- User Registration
- User Login
- JWT Access Tokens
- Refresh Token Mechanism
- Logout
- Google OAuth Login
- Persistent Authentication (localStorage)
- Protected Routes

---

# Google OAuth Authentication

Users can sign in using their Google account.

Implementation includes:

- Google OAuth Client
- Google Identity Services
- Backend verification using Google Auth Library
- Automatic user creation when signing in with Google for the first time

---

# API Documentation

Swagger documentation is available at:

```
http://localhost:3000/api-docs
```

Endpoints include:

- Register
- Login
- Refresh Token
- Logout
- Google Login

---

# Running the Project Locally

## Prerequisites

Make sure the following are installed:

- Node.js (v18 or higher recommended)
- npm
- MongoDB
- Git

---

# 1. Clone the Repository

```
git clone <repository-url>
cd finalproject_fsd
```

---

# 2. Install Dependencies

## Backend

```
cd server
npm install
```

## Frontend

```
cd client
npm install
```

---

# 3. Configure Environment Variables

## Backend

Create:

```
server/.env
```

Add:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/finalproject_fsd
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Frontend

Create:

```
client/.env
```

Add:

```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

# 4. Start MongoDB

Make sure MongoDB is running locally.

Example:

```
mongod
```

---

# 5. Run the Backend Server

```
cd server
npm run dev
```

Server runs on:

```
http://localhost:3000
```

---

# 6. Run the Frontend

```
cd client
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# Testing

Run backend tests:

```
cd server
npm test
```

Run test coverage:

```
npm run test:coverage
```

---

# Git Workflow

Development follows a feature‑branch workflow.

Example branches:

```
main
dev
ofek/client-auth-flow
ofek/google-auth
```

All development is merged into **dev** before being merged into **main**.

---

# Current Status

Phase 1 of the project is completed.

The system currently includes:

- Full Backend API
- Authentication System
- Google OAuth Integration
- Frontend Authentication Flow
- Swagger API Documentation
- Automated Backend Tests

---

# Next Development Phase

The next phase will focus on the **Tournament Management System**, which is the core feature of ArenaX.

Planned features:

- Create tournaments
- Join tournaments
- Player management
- Tournament status management
- Tournament brackets

---

# Authors

**Ofek Ngaoker**  
**Mevorach**

Full Stack Development – Final Project
