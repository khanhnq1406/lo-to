# Railway Deployment Guide

Complete guide for deploying the Vietnamese Lô Tô Game to Railway.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Environment Variables](#environment-variables)
- [Custom Domain](#custom-domain)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code must be in a GitHub repository
3. **pnpm Lock File**: The `pnpm-lock.yaml` file must be committed
4. **Node.js 18+**: Specified in `package.json` engines

---

## Quick Start

### Option 1: Deploy from GitHub (Recommended)

1. **Connect GitHub to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repository
   - Select your `lo-to` repository

2. **Configure Environment Variables** (see below)

3. **Deploy**:
   - Railway will automatically detect the configuration
   - Click "Deploy"
   - Wait for build to complete (5-10 minutes)

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to existing project or create new one
railway link

# Deploy
railway up
```

---

## Detailed Setup

### Step 1: Initial Deployment

1. **Create New Project**:
   - Login to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Railway Auto-Detection**:
   Railway will automatically detect:
   - `pnpm-lock.yaml` → Uses pnpm package manager
   - `package.json` → Reads Node.js version from engines
   - `railway.json` → Uses custom build/start commands
   - `Procfile` → Alternative process definition

3. **Wait for Initial Build**:
   - First build takes 5-10 minutes
   - Railway installs dependencies and builds Next.js
   - You'll see build logs in real-time

### Step 2: Configure Environment Variables

After first deployment, Railway provides a public URL (e.g., `https://your-app.up.railway.app`).

1. **Go to Variables Tab**:
   - Click your service
   - Go to "Variables" tab
   - Add the following variables:

2. **Required Variables**:

```bash
# Node Environment (Railway sets this automatically, but you can override)
NODE_ENV=production

# Hostname (Railway requires 0.0.0.0 for external access)
HOSTNAME=0.0.0.0

# Socket.io Public URL (Replace with your actual Railway URL)
NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app
```

3. **Railway Auto-Set Variables**:
   Railway automatically sets:
   - `PORT` - The port your app should listen on (usually 3000-9000)
   - `RAILWAY_ENVIRONMENT` - Current environment (production/staging)
   - `RAILWAY_DEPLOYMENT_ID` - Unique deployment identifier

### Step 3: Update Socket URL and Redeploy

After getting your Railway URL:

1. **Update Environment Variable**:
   - Copy your Railway public URL
   - Update `NEXT_PUBLIC_SOCKET_URL` with your URL
   - Example: `https://loto-game-production.up.railway.app`

2. **Trigger Redeploy**:
   - Railway auto-redeploys on git push
   - Or click "Redeploy" in Railway dashboard
   - Or use CLI: `railway up`

3. **Verify Deployment**:
   - Visit your Railway URL
   - Check health endpoint: `https://your-app.up.railway.app/api/health`
   - Should return: `{"status":"ok","timestamp":1234567890,"environment":"production","uptime":123}`

---

## Environment Variables

### Complete Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Auto-set by Railway | 3000 | Server port (Railway provides this) |
| `NODE_ENV` | Auto-set | `production` | Node environment |
| `HOSTNAME` | Yes | `0.0.0.0` | Server hostname (must be 0.0.0.0 for Railway) |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | - | Public URL for Socket.io client connections |

### Setting Variables in Railway

**Via Dashboard**:
1. Go to your service
2. Click "Variables" tab
3. Click "New Variable"
4. Enter name and value
5. Click "Add"

**Via CLI**:
```bash
# Set single variable
railway variables set NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app

# Set multiple variables
railway variables set HOSTNAME=0.0.0.0 NODE_ENV=production
```

**Via railway.json** (for defaults):
```json
{
  "deploy": {
    "envVars": {
      "NODE_ENV": "production",
      "HOSTNAME": "0.0.0.0"
    }
  }
}
```

---

## Custom Domain

### Adding Custom Domain

1. **Configure Domain in Railway**:
   - Go to your service settings
   - Click "Custom Domain"
   - Click "Add Domain"
   - Enter your domain (e.g., `loto.yourdomain.com`)

2. **Update DNS Records**:
   Railway will provide CNAME or A records:
   ```
   Type: CNAME
   Name: loto (or subdomain)
   Value: your-app.up.railway.app
   ```

3. **Update Environment Variable**:
   ```bash
   NEXT_PUBLIC_SOCKET_URL=https://loto.yourdomain.com
   ```

4. **Redeploy**:
   - Push to git or click "Redeploy"
   - SSL certificate is automatically provisioned
   - Wait 5-10 minutes for DNS propagation

### Domain Verification

Test your domain:
```bash
# Check health endpoint
curl https://loto.yourdomain.com/api/health

# Check DNS resolution
nslookup loto.yourdomain.com

# Check SSL certificate
openssl s_client -connect loto.yourdomain.com:443 -servername loto.yourdomain.com
```

---

## Monitoring

### Health Checks

Railway uses `/api/health` endpoint to monitor service:

```bash
# Test health check
curl https://your-app.up.railway.app/api/health

# Expected response
{
  "status": "ok",
  "timestamp": 1234567890,
  "environment": "production",
  "uptime": 123.456
}
```

### Viewing Logs

**Via Dashboard**:
1. Go to your service
2. Click "Deployments" tab
3. Click on active deployment
4. View real-time logs

**Via CLI**:
```bash
# View live logs
railway logs

# View logs with follow
railway logs --follow

# View specific deployment logs
railway logs --deployment <deployment-id>
```

### Metrics

Railway provides built-in metrics:
- **CPU Usage**: Monitor in dashboard
- **Memory Usage**: Track memory consumption
- **Network Traffic**: Inbound/outbound bandwidth
- **Active Connections**: WebSocket connections count

---

## Troubleshooting

### Common Issues

#### 1. Build Fails

**Symptom**: Build fails with TypeScript errors

**Solution**:
```bash
# Fix TypeScript errors locally first
pnpm type-check

# Fix and commit
git add .
git commit -m "Fix TypeScript errors"
git push
```

#### 2. Server Not Responding

**Symptom**: Railway shows "Error: Connection Refused"

**Possible Causes**:
- Server not binding to `0.0.0.0`
- Server not using Railway's `PORT` variable
- Health check endpoint not responding

**Solution**:
```bash
# Check server.ts configuration
# Verify: hostname = '0.0.0.0' in production
# Verify: port = process.env.PORT

# Check health endpoint
curl https://your-app.up.railway.app/api/health
```

#### 3. WebSocket Connection Failed

**Symptom**: Client shows "WebSocket connection failed"

**Possible Causes**:
- `NEXT_PUBLIC_SOCKET_URL` not set
- CORS configuration blocking connections
- Client using wrong URL

**Solution**:
```bash
# Verify environment variable
railway variables get NEXT_PUBLIC_SOCKET_URL

# Set correct URL
railway variables set NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app

# Redeploy
railway up
```

#### 4. Health Check Timeout

**Symptom**: Railway shows "Health Check Timeout"

**Possible Causes**:
- Next.js not fully initialized
- Server taking too long to start
- Health endpoint returning error

**Solution**:
```bash
# Increase timeout in railway.json
{
  "deploy": {
    "healthcheckTimeout": 300
  }
}

# Test health endpoint locally
pnpm build
pnpm start
curl http://localhost:3000/api/health
```

#### 5. Build Timeout

**Symptom**: "Build timed out after 10 minutes"

**Possible Causes**:
- Dependencies taking too long to install
- Next.js build is very large
- Network issues downloading packages

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Optimize build
# Check next.config.js for large bundles

# Use Railway's build cache (automatic)
```

#### 6. Memory Issues

**Symptom**: "Out of Memory" errors

**Solution**:
- Upgrade Railway plan for more memory
- Optimize Next.js bundle size
- Check for memory leaks in Socket.io handlers

#### 7. CORS Errors

**Symptom**: "Access-Control-Allow-Origin" errors in browser

**Solution**:
Check `server/server.ts` CORS configuration:
```typescript
cors: {
  origin: process.env.NEXT_PUBLIC_SOCKET_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true,
}
```

### Debug Commands

```bash
# Check Railway service status
railway status

# View environment variables
railway variables

# View deployment history
railway list

# Open service in browser
railway open

# SSH into running container (if available)
railway run bash

# Run commands in Railway environment
railway run pnpm type-check
```

### Getting Help

- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Status**: [status.railway.app](https://status.railway.app)

---

## Advanced Configuration

### Auto-Deploy on Push

Railway automatically deploys when you push to the connected branch.

**Configure Branch**:
1. Go to service settings
2. Click "Source"
3. Select deployment branch (main/master)
4. Enable/disable auto-deploy

### Deployment Rollback

**Via Dashboard**:
1. Go to "Deployments"
2. Find successful deployment
3. Click "..." menu
4. Select "Redeploy"

**Via CLI**:
```bash
# List deployments
railway list

# Redeploy specific deployment
railway redeploy <deployment-id>
```

### Multiple Environments

**Create Staging Environment**:
1. Create new service
2. Connect same repo, different branch
3. Set different environment variables
4. Deploy

```bash
# Example: Staging environment
NEXT_PUBLIC_SOCKET_URL=https://loto-staging.up.railway.app
NODE_ENV=staging
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All TypeScript errors resolved (`pnpm type-check`)
- [ ] All tests passing
- [ ] `pnpm-lock.yaml` committed
- [ ] `.env.example` updated with all variables
- [ ] `railway.json` configured
- [ ] Health check endpoint working locally
- [ ] Socket.io connection tested locally
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Server starts correctly (`pnpm start`)
- [ ] Documentation updated

After first deployment:

- [ ] Railway URL obtained
- [ ] `NEXT_PUBLIC_SOCKET_URL` environment variable set
- [ ] Redeployed with correct URL
- [ ] Health check accessible at `/api/health`
- [ ] WebSocket connections working
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate issued
- [ ] Monitoring enabled

---

## Performance Optimization

### Caching

Railway caches:
- Node modules (speeds up builds)
- Next.js build cache
- pnpm store

### Build Optimization

```javascript
// next.config.js
module.exports = {
  // Reduce bundle size
  swcMinify: true,

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Railway Optimization

- Use Railway's built-in CDN
- Enable HTTP/2
- Configure proper cache headers
- Minimize cold starts (keep service active)

---

## Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files
   - Use Railway's encrypted variable storage
   - Rotate secrets regularly

2. **CORS Configuration**:
   - Set specific origins (not `*`) in production
   - Update when adding custom domain

3. **Rate Limiting**:
   - Add rate limiting to Socket.io connections
   - Implement API rate limits

4. **Monitoring**:
   - Set up alerts for errors
   - Monitor unusual traffic patterns
   - Track failed WebSocket connections

---

## Cost Estimation

Railway pricing (as of 2024):

- **Free Tier**: $5/month in credits
- **Pro Plan**: $20/month + usage
- **Estimated monthly cost**: $5-20 depending on traffic

**Cost Factors**:
- Active hours
- Memory usage
- CPU usage
- Network egress
- Number of deployments

---

## Support

For deployment issues:

1. Check this guide first
2. Review Railway documentation
3. Check Railway Discord
4. Check project README.md
5. Contact development team

---

## Version History

- **v1.0.0** - Initial Railway deployment configuration
- Added health check endpoint
- Configured Socket.io for production
- Set up environment variables
