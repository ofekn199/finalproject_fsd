# ArenaX 🚀

## 📌 Overview
ArenaX is a Full Stack web application for managing posts and analyzing chess positions using AI.

The system allows users to:
- Sign in with Google OAuth
- Create and interact with posts
- Analyze chess positions using Stockfish engine

---

## 🏗️ Architecture

Client (React)  
↓  
nginx (Static + Reverse Proxy)  
↓  
Backend (Node.js / Express)  
↓  
MongoDB + Stockfish  

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Axios
- React Router

### Backend
- Node.js
- Express
- TypeScript
- JWT Authentication
- Google OAuth

### Database
- MongoDB (Mongoose)

### DevOps
- Linux Server
- nginx (reverse proxy)
- PM2 (process manager)
- HTTPS (self-signed)

### AI
- Stockfish (Chess Engine)
- child_process (Node.js)

---

## ⚙️ Installation (Local)

### 1. Clone the repository
```bash
git clone https://github.com/ofekn199/finalproject_fsd.git
cd finalproject_fsd
```

### 2. Backend setup
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/finalproject_fsd
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
OPENAI_API_KEY=your_key
```

Run server:
```bash
npm run dev
```

---

### 3. Frontend setup
```bash
cd ../client
npm install
npm run dev
```

---

## 🚀 Production Deployment

### Backend
```bash
npm run build
pm2 start npm --name arenax-server -- start
```

### Frontend
```bash
npm run build
```

### nginx
- Serves frontend
- Proxies API requests to backend
- Handles HTTPS

---

## 🔐 Authentication
- Google OAuth integration
- JWT tokens for session handling

---

## 🤖 Chess AI (Stockfish)

The system analyzes chess positions using FEN.

Flow:
1. Client sends FEN
2. Server runs Stockfish
3. Returns:
   - best move
   - evaluation
   - move line

---

## 📡 API Endpoints (Examples)

- `POST /api/auth/google`
- `GET /api/posts`
- `POST /api/posts`
- `POST /api/chess/analyze`

---

## ⚠️ Known Issues
- Stockfish requires installation on server
- Self-signed HTTPS may show browser warnings

---

## 🔮 Future Improvements
- Use Let's Encrypt for HTTPS
- Add caching (Redis)
- Improve UI/UX
- Scale backend services

---

## 👨‍💻 Author
Ofek Nagauker  
Mevorach Barrabi

---

## 📄 License
This project is for educational purposes.
