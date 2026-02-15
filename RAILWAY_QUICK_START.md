# Railway Quick Start Guide

Fast-track guide to deploy your Vietnamese Lô Tô Game to Railway in under 10 minutes.

## Prerequisites

- GitHub account with your code pushed
- Railway account (sign up at [railway.app](https://railway.app))

## Steps

### 1. Create Railway Project (2 minutes)

```bash
# Go to railway.app
# Click "New Project"
# Select "Deploy from GitHub repo"
# Authorize Railway
# Select your repository
```

### 2. Wait for Initial Deployment (5-7 minutes)

Railway will automatically:
- Detect `pnpm-lock.yaml` and use pnpm
- Read `railway.json` for build/start commands
- Install dependencies
- Build Next.js
- Start the server

**First deployment will fail** - this is expected! We need the URL first.

### 3. Set Environment Variables (1 minute)

After deployment, Railway gives you a URL like:
`https://your-app.up.railway.app`

1. Go to "Variables" tab in Railway
2. Add this variable:

```bash
NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app
```

Replace `your-app.up.railway.app` with your actual Railway URL.

3. Optional variables (Railway sets these automatically):
```bash
NODE_ENV=production
HOSTNAME=0.0.0.0
```

### 4. Redeploy (2 minutes)

```bash
# Option A: Click "Redeploy" button in Railway dashboard
# Option B: Push a new commit to trigger auto-deploy
git commit --allow-empty -m "Trigger redeploy"
git push
```

### 5. Verify Deployment (1 minute)

Test your deployment:

```bash
# Health check (replace with your URL)
curl https://your-app.up.railway.app/api/health

# Expected response
{"status":"ok","timestamp":1234567890,"environment":"production","uptime":123}
```

Open in browser:
```
https://your-app.up.railway.app
```

## That's It!

Your game is now live and accessible worldwide.

## What's Configured

Railway deployment includes:

- **Auto-scaling**: Handles traffic spikes automatically
- **HTTPS**: SSL certificate included
- **Health checks**: Monitors `/api/health` endpoint
- **Auto-restart**: Restarts on crashes
- **WebSocket support**: Socket.io connections work out of the box
- **Environment variables**: Secure variable storage
- **Build cache**: Faster subsequent deployments

## Common Issues

### Build Failed

**Symptom**: "Build command exited with code 1"

**Fix**:
```bash
# Test build locally first
pnpm install
pnpm build

# Fix any TypeScript errors
pnpm type-check

# Commit and push
git add .
git commit -m "Fix build errors"
git push
```

### WebSocket Not Connecting

**Symptom**: "WebSocket connection failed" in browser console

**Fix**:
1. Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly
2. Must match your Railway URL exactly
3. Must include `https://` protocol
4. No trailing slash

### Health Check Timeout

**Symptom**: "Health check failed"

**Fix**:
- Wait 2-3 minutes for Next.js to fully initialize
- Check logs in Railway dashboard
- Verify `/api/health` route exists

## Next Steps

- **Custom Domain**: See [DEPLOYMENT.md](./DEPLOYMENT.md#custom-domain)
- **Monitoring**: View logs in Railway dashboard
- **Scaling**: Upgrade Railway plan for more resources
- **Multiple Environments**: Create staging/production environments

## Need Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting and advanced configuration.

## Cost

Railway free tier includes:
- $5/month in credits
- Usually sufficient for hobby projects
- Can upgrade to Pro ($20/month) for production

## Railway vs Other Platforms

| Feature | Railway | Vercel | Heroku |
|---------|---------|--------|--------|
| WebSocket Support | ✅ Yes | ❌ No | ✅ Yes |
| Custom Server | ✅ Yes | ❌ No | ✅ Yes |
| Socket.io | ✅ Native | ❌ Not supported | ✅ Native |
| Auto-deploy | ✅ Yes | ✅ Yes | ✅ Yes |
| Free Tier | ✅ $5/month | ✅ Yes | ⚠️ Limited |

**Why Railway?**
- Full WebSocket support (required for Socket.io)
- Custom Node.js server support
- Simple configuration
- Great for real-time apps

---

**Deployment Status**: Ready ✅

Your project is fully configured for Railway deployment. Just follow the steps above!
