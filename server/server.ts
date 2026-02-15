/**
 * Custom Next.js + Socket.io Server
 * Integrates Next.js with Socket.io on the same port
 * Supports both HTTP (Next.js) and WebSocket (Socket.io)
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketServer } from 'socket.io';
import { setupSocketHandlers } from './socket-handler';

const dev = process.env.NODE_ENV !== 'production';
// Railway requires binding to 0.0.0.0 in production
const hostname = process.env.HOSTNAME || (dev ? 'localhost' : '0.0.0.0');
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize Socket.io
  const io = new SocketServer(httpServer, {
    cors: {
      origin: dev
        ? ['http://localhost:3000']
        : process.env.NEXT_PUBLIC_SOCKET_URL
          ? [process.env.NEXT_PUBLIC_SOCKET_URL]
          : '*', // Allow all origins in production if URL not set
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Setup socket event handlers
  setupSocketHandlers(io);

  // Start server
  httpServer.once('error', (err: Error & { code?: string }) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please use a different port.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  httpServer.listen(port, () => {
    console.log('');
    console.log('='.repeat(60));
    console.log(`🎮  Vietnamese Lô Tô Game Server`);
    console.log('='.repeat(60));
    console.log(`🌐  Environment: ${dev ? 'Development' : 'Production'}`);
    console.log(`🚀  HTTP Server: http://${hostname}:${port}`);
    console.log(`🔌  WebSocket: ws://${hostname}:${port}`);
    console.log(`📝  Ready for connections`);
    console.log('='.repeat(60));
    console.log('');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing server');
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing server');
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
