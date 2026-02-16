# 🎮 Vietnamese Lô Tô - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
cd /Users/admin/Desktop/khanh/workspace/lo-to
pnpm install
```
**Status:** ✅ Done - Dependencies installed!

### 2. Run Development Server
```bash
pnpm dev
```

### 3. Open Your Browser
Navigate to: **http://localhost:3000**

### 4. Play!
1. **Create a room** - Enter your name and select number of cards (1-5)
2. **Share room ID** - Copy and share with friends
3. **Join from another device** - Use the room ID to join
4. **Start the game** - Host clicks "Bắt Đầu Chơi"
5. **Play Lô Tô** - Numbers are called automatically or manually
6. **Win!** - Complete a row (5 numbers) to win with confetti celebration! 🎉

---

## 🚀 Production Deployment (Railway)

### Prerequisites
- GitHub account
- Railway account (free tier available)

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Vietnamese Lô Tô game ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lo-to.git
git push -u origin main
```

2. **Deploy to Railway**
- Go to [railway.app](https://railway.app)
- Click "New Project" → "Deploy from GitHub repo"
- Select your repository
- Railway will auto-detect and deploy!

3. **Set Environment Variable**
After first deployment:
- Copy your Railway URL (e.g., `https://your-app.up.railway.app`)
- Go to Variables tab
- Add: `NEXT_PUBLIC_SOCKET_URL` = `https://your-app.up.railway.app`
- Redeploy

4. **Done!** 🎉
Your game is now live and accessible worldwide!

**Detailed guide:** See [RAILWAY_QUICK_START.md](./RAILWAY_QUICK_START.md)

---

## 📖 What You Get

### ✅ Fully Working Features
- **Real-time multiplayer** (up to 16 players)
- **Authentic Vietnamese Lô Tô** (3×9 cards, 1-90 numbers)
- **Two game modes:**
  - Machine mode (auto-call numbers every 1-60 seconds)
  - Manual mode (caller selects numbers)
- **Multiple cards per player** (1-5 cards)
- **Automatic win detection** with confetti celebration
- **Traditional Vietnamese design** (off-white paper, green borders)
- **Responsive** (desktop + mobile with expandable sheet)
- **Dark mode** with localStorage persistence
- **Sound effects** (number call beep, win celebration chord)
- **Host controls** (kick players, reset game, change modes)
- **Room sharing** (copyable room URLs)

### ✅ Production Ready
- **TypeScript** - Zero errors
- **Build** - Successful production build
- **Tests** - All tests passing
- **Deployment** - Railway configured
- **Documentation** - Complete guides

---

## 🎯 Game Rules (Vietnamese Lô Tô)

### Card Format
- **Layout:** 3 rows × 9 columns = 27 cells
- **Numbers:** 15 numbers (1-90) + 12 blank cells
- **Each row:** 5 numbers + 4 blanks
- **Column ranges:**
  - Column 1: 1-9
  - Column 2: 10-19
  - Column 3: 20-29
  - ...
  - Column 9: 80-90

### How to Win
- **Complete 1 horizontal row** (all 5 numbers called)
- First player to complete a row wins! 🏆

### Example Card
```
┌──┬──┬──┬──┬──┬──┬──┬──┬──┐
│ 5│  │  │32│  │56│  │71│  │  Row 1: 5 numbers
├──┼──┼──┼──┼──┼──┼──┼──┼──┤
│  │12│23│  │45│  │67│  │89│  Row 2: 5 numbers
├──┼──┼──┼──┼──┼──┼──┼──┼──┤
│ 8│  │28│  │  │58│  │  │90│  Row 3: 5 numbers
└──┴──┴──┴──┴──┴──┴──┴──┴──┘
   15 numbers, 12 blanks
```

---

## 🛠 Development

### Project Structure
```
lo-to/
├── app/                    # Next.js pages
│   ├── page.tsx           # Home page (create/join room)
│   └── room/[id]/         # Game room page
├── components/game/        # React components
│   ├── TicketDisplay.tsx  # Player cards
│   ├── CallerPanel.tsx    # Number calling
│   ├── PlayerList.tsx     # Player management
│   └── WinModal.tsx       # Win celebration
├── server/                # Socket.io server
│   ├── server.ts          # Main server
│   └── socket-handler.ts  # Event handlers
├── lib/                   # Game logic
│   ├── game.ts            # Game engine
│   └── winDetection.ts    # Win detection
├── store/                 # State management
│   └── useGameStore.ts    # Zustand store
├── hooks/                 # React hooks
│   ├── useSocket.ts       # Socket.io client
│   └── useWinDetection.ts # Auto win detection
└── types/                 # TypeScript types
    └── index.ts           # Type definitions
```

### Available Scripts
```bash
pnpm dev          # Development server (localhost:3000)
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint check
pnpm type-check   # TypeScript check
```

### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS
- **Real-time:** Socket.io (client + server)
- **State:** Zustand
- **Validation:** Zod
- **Animations:** Framer Motion
- **Celebrations:** Canvas Confetti
- **Sound:** Web Audio API
- **Icons:** Lucide React

---

## 📚 Documentation

- **[PROJECT_COMPLETE_SUMMARY.md](./PROJECT_COMPLETE_SUMMARY.md)** - Full project overview
- **[README.md](./README.md)** - Main documentation
- **[AUTHENTIC_VIETNAMESE_LOTO_RULES.md](./AUTHENTIC_VIETNAMESE_LOTO_RULES.md)** - Game rules research
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[RAILWAY_QUICK_START.md](./RAILWAY_QUICK_START.md)** - 10-minute deployment

### Component Documentation
- **[components/game/README.md](./components/game/README.md)** - Ticket components
- **[components/game/CALLER_COMPONENTS.md](./components/game/CALLER_COMPONENTS.md)** - Caller panel
- **[components/game/PLAYER_COMPONENTS.md](./components/game/PLAYER_COMPONENTS.md)** - Player list
- **[WIN_DETECTION_GUIDE.md](./WIN_DETECTION_GUIDE.md)** - Win detection system

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Then restart
pnpm dev
```

### Build Fails
```bash
# Clean and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Socket Connection Issues
- Check if server is running: `curl http://localhost:3000/api/health`
- Check browser console for errors
- Verify `NEXT_PUBLIC_SOCKET_URL` environment variable

### Railway Deployment Issues
- Run verification: `./scripts/verify-deployment.sh`
- Check Railway logs for errors
- Ensure `NEXT_PUBLIC_SOCKET_URL` is set

---

## 🎉 You're Ready!

```bash
# Start playing now:
pnpm dev

# Open: http://localhost:3000
```

**Chúc mừng! Have fun playing Vietnamese Lô Tô!** 🎊

---

## 🆘 Need Help?

- Check documentation files listed above
- See examples in `components/game/*.example.tsx`
- Run tests: `npx tsx lib/game.test.ts`
- Read troubleshooting: [DEPLOYMENT.md](./DEPLOYMENT.md)

**The game is production-ready and fully functional!** 🚀
