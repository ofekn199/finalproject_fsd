# ArenaX - Final Project

ArenaX is a full-stack final course project built with TypeScript.

The project is based on the ArenaX idea and currently integrates a backend foundation for authentication and future Lichess API support.

## Project Structure

- `server/` - Node.js + Express + TypeScript backend
- `client/` - React + TypeScript frontend (to be implemented next)

## What Has Been Completed So Far

### Backend Foundation
- Express server created with TypeScript
- MongoDB connection configured
- Swagger API documentation added
- Health check endpoint implemented
- Authentication system implemented:
  - Register
  - Login
  - Refresh token
  - Logout
- JWT access token and refresh token support
- Refresh token rotation implemented
- Request validation with Zod
- JWT authentication middleware added
- Duplicate user prevention added
- Error handling middleware added

### Testing
- Jest configured
- Supertest configured
- API tests added for:
  - Health endpoint
  - Register validation
  - Register success
  - Login success
  - Invalid login
  - Refresh token
  - Logout
- Current coverage is around 92%

## Technologies

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- Zod
- Swagger
- Jest
- Supertest

## How to Run the Backend

```bash
cd server
npm install
npm run dev

## The backend runs on:

http://localhost:3000

## Swagger documentation is available at:

http://localhost:3000/api-docs
Environment Variables

## Create a .env file inside the server folder and add:

NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/finalproject_fsd
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173