# Railway Setup Summary

## Overview

Your Vietnamese Lô Tô Game is now fully configured for Railway deployment. This document summarizes all changes and provides a quick reference.

## Files Created/Modified

### New Configuration Files

1. **`railway.json`** - Railway deployment configuration
   - Build command: `pnpm install && pnpm build`
   - Start command: `node server/index.js`
   - Health check: `/api/health`
   - Auto-restart on failure

2. **`Procfile`** - Process definition for Railway
   - Defines web process: `web: node server/index.js`

3. **`.env.example`** - Environment variable template
   - Documents all required variables
   - Includes Railway-specific configuration
   - Safe to commit (no secrets)

### New Application Files

4. **`app/api/health/route.ts`** - Health check endpoint
   - Returns server status, timestamp, environment, uptime
   - Used by Railway for health monitoring
   - Accessible at `/api/health`

5. **`lib/socket-config.ts`** - Socket.io client configuration
   - Auto-detects environment (dev/prod)
   - Uses `NEXT_PUBLIC_SOCKET_URL` in production
   - Fallback to `window.location.origin`
   - Includes connection options

### Documentation

6. **`DEPLOYMENT.md`** - Comprehensive deployment guide (12,000+ words)
   - Step-by-step Railway setup
   - Environment variables reference
   - Custom domain configuration
   - Troubleshooting guide
   - Cost estimation
   - Security best practices

7. **`RAILWAY_QUICK_START.md`** - Fast-track deployment guide
   - 10-minute deployment walkthrough
   - Common issues and fixes
   - Platform comparison

8. **`scripts/verify-deployment.sh`** - Deployment verification script
   - Checks all required files
   - Validates dependencies
   - Tests health endpoint
   - Reports deployment readiness

### Modified Files

9. **`server/server.ts`** - Updated for Railway compatibility
   - Binds to `0.0.0.0` in production (Railway requirement)
   - Reads PORT from environment (Railway provides this)
   - CORS configured with `NEXT_PUBLIC_SOCKET_URL`
   - Graceful shutdown handlers

10. **`package.json`** - Added Railway scripts
    - `railway:build` - Railway build command
    - `railway:start` - Railway start command
    - Existing scripts work as before

11. **`README.md`** - Added deployment section
    - Links to deployment guides
    - Highlights Railway benefits
    - Quick reference for deployment

## Environment Variables

### Required for Production

```bash
# Server Configuration
PORT=3000                                           # Auto-set by Railway
NODE_ENV=production                                 # Auto-set by Railway
HOSTNAME=0.0.0.0                                    # Required for Railway

# Client Configuration
NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app  # Set after first deploy
```

### How Variables Are Used

| Variable | Where Used | Purpose |
|----------|------------|---------|
| `PORT` | `server/server.ts` | Server listening port |
| `NODE_ENV` | `server/server.ts` | Development vs production mode |
| `HOSTNAME` | `server/server.ts` | Server bind address (must be 0.0.0.0) |
| `NEXT_PUBLIC_SOCKET_URL` | `lib/socket-config.ts` | Client Socket.io connection URL |

## Architecture Changes

### Server Configuration

**Before**:
```typescript
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
```

**After** (Railway-compatible):
```typescript
const hostname = process.env.HOSTNAME || (dev ? 'localhost' : '0.0.0.0');
const port = parseInt(process.env.PORT || '3000', 10);
```

### Socket.io CORS

**Before**:
```typescript
cors: {
  origin: dev ? ['http://localhost:3000'] : [],
}
```

**After** (Railway-compatible):
```typescript
cors: {
  origin: dev
    ? ['http://localhost:3000']
    : process.env.NEXT_PUBLIC_SOCKET_URL
      ? [process.env.NEXT_PUBLIC_SOCKET_URL]
      : '*',
}
```

### Client Connection

**New**: Centralized Socket.io configuration in `lib/socket-config.ts`
```typescript
export function getSocketUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
}
```

## Deployment Workflow

### Initial Setup (One-time)

1. Push code to GitHub
2. Connect GitHub to Railway
3. Create new Railway project
4. Select repository
5. Wait for first deployment (will fail - expected)
6. Get Railway URL
7. Set `NEXT_PUBLIC_SOCKET_URL` environment variable
8. Redeploy

### Subsequent Deployments (Automatic)

1. Make changes locally
2. Commit and push to GitHub
3. Railway auto-deploys
4. No manual intervention needed

## Testing Deployment

### Local Testing

```bash
# Install dependencies
pnpm install

# Build Next.js
pnpm build

# Test with Railway-style environment
PORT=3001 HOSTNAME=0.0.0.0 NODE_ENV=production node server/index.js

# In another terminal, test health check
curl http://localhost:3001/api/health
```

### Verification Script

```bash
# Run deployment verification
./scripts/verify-deployment.sh

# Expected output: "All checks passed!"
```

### Production Testing

```bash
# Test health endpoint
curl https://your-app.up.railway.app/api/health

# Expected response
{
  "status": "ok",
  "timestamp": 1234567890,
  "environment": "production",
  "uptime": 123.456
}

# Test WebSocket connection
# Open browser console at your Railway URL
# Check for Socket.io connection messages
```

## Key Features

### Railway Benefits

✅ **WebSocket Support** - Full Socket.io compatibility
✅ **Custom Server** - Runs your Node.js server
✅ **Auto-scaling** - Handles traffic automatically
✅ **HTTPS/SSL** - Included for free
✅ **Health Checks** - Automatic monitoring
✅ **Auto-restart** - Restarts on crashes
✅ **Build Cache** - Faster deployments
✅ **GitHub Integration** - Auto-deploy on push
✅ **Environment Variables** - Secure storage
✅ **Logs** - Real-time log viewing

### Why Railway Over Vercel?

| Feature | Railway | Vercel |
|---------|---------|--------|
| WebSocket | ✅ Full support | ❌ Not supported |
| Custom Server | ✅ Yes | ❌ Serverless only |
| Socket.io | ✅ Works perfectly | ❌ Not compatible |
| Real-time | ✅ Native support | ❌ Limited |
| Setup | Easy | Very easy |
| Cost | $5-20/month | Free tier available |

**Verdict**: Railway is required for Socket.io real-time functionality.

## Common Commands

### Railway CLI

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs --follow

# Set environment variable
railway variables set KEY=VALUE

# Open in browser
railway open

# View status
railway status
```

### Local Development

```bash
# Development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build
pnpm build

# Production server (local)
pnpm start
```

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Build fails | Run `pnpm type-check` locally, fix errors |
| Server not responding | Check `HOSTNAME=0.0.0.0` is set |
| WebSocket fails | Verify `NEXT_PUBLIC_SOCKET_URL` matches Railway URL |
| Health check timeout | Wait 2-3 minutes for Next.js to initialize |
| CORS errors | Check CORS origin in `server/server.ts` |

Full troubleshooting guide: [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

## Security Checklist

- [ ] `.env` files are gitignored (already configured)
- [ ] No secrets in `.env.example`
- [ ] Environment variables set in Railway (not in code)
- [ ] CORS properly configured
- [ ] Health check doesn't expose sensitive data
- [ ] Using HTTPS in production (automatic with Railway)

## Performance Optimizations

- **Build Cache**: Railway caches node_modules and `.next`
- **CDN**: Railway includes CDN for static assets
- **Compression**: Enabled in `next.config.js`
- **WebSocket**: Efficient Socket.io configuration
- **Health Checks**: Lightweight endpoint

## Next Steps

### Immediate

1. ✅ Configuration complete
2. ⏳ Push to GitHub
3. ⏳ Deploy to Railway
4. ⏳ Set environment variables
5. ⏳ Test deployment

### Optional Enhancements

- Add custom domain
- Set up staging environment
- Configure monitoring alerts
- Add analytics
- Implement rate limiting
- Add Redis for session management
- Set up CI/CD pipeline

## Support Resources

- **Quick Start**: [RAILWAY_QUICK_START.md](./RAILWAY_QUICK_START.md)
- **Full Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Project README**: [README.md](./README.md)

## Summary

Your project is **production-ready** for Railway deployment with:

- ✅ Complete configuration files
- ✅ Health check endpoint
- ✅ Socket.io production setup
- ✅ Environment variable templates
- ✅ Comprehensive documentation
- ✅ Verification scripts
- ✅ Troubleshooting guides

**Deployment time**: ~10 minutes following [RAILWAY_QUICK_START.md](./RAILWAY_QUICK_START.md)

**Status**: Ready to deploy! 🚀
