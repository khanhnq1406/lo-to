# Vietnamese Lô Tô Game

A real-time multiplayer Vietnamese Lô Tô (lottery bingo) game built with Next.js 15 and Socket.io.

## Features

- Real-time multiplayer gameplay with WebSocket support
- Traditional Vietnamese Lô Tô paper ticket design
- Room-based game sessions
- Responsive design for desktop and mobile
- Real-time synchronization across all players
- Animated number drawing with confetti celebrations
- State management with Zustand
- Type-safe with TypeScript and Zod validation

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Real-time**: Socket.io (Client & Server)
- **State Management**: Zustand
- **Validation**: Zod
- **Animations**: Framer Motion
- **Styling**: TailwindCSS
- **Package Manager**: pnpm

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lo-to
```

2. Install dependencies:
```bash
pnpm install
```

## Development

Start the development server with Socket.io support:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

The custom server runs on port 3000 and handles both Next.js pages and Socket.io WebSocket connections.

## Building for Production

1. Build the application:
```bash
pnpm build
```

2. Start the production server:
```bash
pnpm start
```

## Deployment

### Railway (Recommended)

This project is fully configured for Railway deployment with WebSocket/Socket.io support.

**Quick Deploy** (10 minutes):
- See [RAILWAY_QUICK_START.md](./RAILWAY_QUICK_START.md) for fast deployment

**Detailed Guide**:
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive instructions, troubleshooting, and custom domain setup

**What's Included**:
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Process definition
- ✅ Health check endpoint at `/api/health`
- ✅ Socket.io production configuration
- ✅ Environment variable templates
- ✅ Deployment verification script

**Why Railway?**
- Full WebSocket/Socket.io support (required for real-time gameplay)
- Custom Node.js server support
- Auto-scaling and HTTPS included
- Simple deployment process

## Project Structure

```
lo-to/
├── app/                    # Next.js 15 app router pages
├── components/             # React components
│   ├── game/              # Game-specific components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/                   # Utility functions and helpers
│   ├── utils.ts           # General utilities
│   └── socket.ts          # Socket.io client setup
├── server/                # Custom Node.js server
│   ├── index.js           # Server entry point
│   └── game-logic/        # Game logic and Socket.io handlers
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── ...config files
```

## Scripts

- `pnpm dev` - Start development server with custom Socket.io server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## Game Rules

Vietnamese Lô Tô is a traditional lottery-style game:

1. Each player receives a ticket with 15 numbers (3 rows × 5 columns)
2. Numbers range from 1-90
3. The host draws numbers randomly
4. Players mark matching numbers on their tickets
5. First player to complete 1, 2, or 3 rows wins prizes
6. Complete ticket (all 15 numbers) wins the grand prize

## Configuration

### Tailwind Theme

The game uses a custom Tailwind theme with traditional Vietnamese colors:
- Paper: Off-white background (#FBF9F4)
- Green: Traditional dark green borders (#2D5016)
- Red: Vietnamese red accents (#C41E3A)
- Gold: Prize highlights (#FFD700)

### Socket.io

WebSocket connections are handled by a custom Node.js server that integrates with Next.js. Configuration is in `server/index.js`.

## Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NODE_ENV=development
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run type checking and linting
4. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues and questions, please open an issue on the repository.
