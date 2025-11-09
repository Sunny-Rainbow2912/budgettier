# Heroku Deployment Guide

This guide will walk you through deploying Budgettier to Heroku.

## Architecture

Budgettier deploys as a single Heroku app where:

- **Backend** (NestJS) runs on the Heroku dyno
- **Frontend** (React) is served as static files by the backend
- **Database** (SQLite) is included and auto-seeded on deployment

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git Repository**: Your code should be in a Git repository

## Quick Deploy

### Option 1: Deploy with Heroku Button

Click this button to deploy instantly:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Option 2: Deploy via Heroku CLI

#### Step 1: Login to Heroku

```bash
heroku login
```

#### Step 2: Create Heroku App

```bash
# Create a new Heroku app
heroku create your-app-name

# Or let Heroku generate a random name
heroku create
```

#### Step 3: Set Node Version

```bash
# Heroku will automatically use Node 24.x from package.json engines
# Verify with:
heroku buildpacks
```

#### Step 4: Deploy

```bash
# Push to Heroku
git push heroku main

# If you're on a different branch:
git push heroku your-branch:main
```

#### Step 5: Open Your App

```bash
heroku open
```

## What Happens During Deployment

Heroku automatically runs these steps (defined in `package.json`):

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Build Frontend** (`heroku-postbuild` script)

   ```bash
   npm run frontend:build
   ```

3. **Build Backend**

   ```bash
   npm run backend:build
   ```

4. **Seed Database**

   ```bash
   cd backend && npm run seed
   ```

5. **Start Application** (from `Procfile`)
   ```bash
   cd backend && npm run start:prod
   ```

## Configuration

### Environment Variables

The app works out-of-the-box with no additional configuration needed!

Default configurations:

- `PORT`: Set automatically by Heroku (usually 443 for HTTPS)
- `NODE_ENV`: `production`
- `VITE_API_BASE_URL`: Empty (uses same origin as frontend)

### Optional: Custom Environment Variables

If you need custom configuration:

```bash
# Set environment variables
heroku config:set NODE_ENV=production

# View current config
heroku config

# Edit config interactively
heroku config:edit
```

## Monitoring

### View Logs

```bash
# Stream logs in real-time
heroku logs --tail

# View last 100 lines
heroku logs -n 100

# Filter backend logs
heroku logs --source app
```

### Check Dyno Status

```bash
# View running dynos
heroku ps

# Restart dynos
heroku restart
```

### Open App Dashboard

```bash
# Open in browser
heroku dashboard
```

## Scaling

### Free Tier (Default)

- 1 free dyno (sleeps after 30 min of inactivity)
- 550-1000 free dyno hours/month
- Perfect for demos and take-home assessments

### Upgrade for Production

```bash
# Upgrade to Hobby dyno ($7/month)
heroku ps:scale web=1:hobby

# Upgrade to Professional ($25-$250/month)
heroku ps:scale web=1:standard-1x
```

## Database Management

### SQLite Database

- SQLite database is included in the deployment
- Data persists only during the dyno's lifetime
- **Note**: Heroku's ephemeral filesystem means data resets on dyno restart

### For Production: Upgrade to PostgreSQL

If you need persistent data:

```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:essential-0

# View database URL
heroku config:get DATABASE_URL
```

Then update `backend/src/app.module.ts` to use PostgreSQL:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Department, BudgetItem],
  synchronize: true, // Set to false in production!
  ssl: {
    rejectUnauthorized: false,
  },
});
```

## Troubleshooting

### App Not Loading

```bash
# Check logs for errors
heroku logs --tail

# Verify build completed
heroku builds:info

# Check dyno status
heroku ps
```

### Build Failures

```bash
# View build log
heroku builds:info

# Common issues:
# - Node version mismatch: Check package.json engines
# - Missing dependencies: Ensure all deps are in package.json
# - Build errors: Check TypeScript compilation
```

### Frontend Not Loading

1. **Verify frontend build exists**:

   ```bash
   # The frontend should build to frontend/dist
   # Backend serves from: ../frontend/dist
   ```

2. **Check ServeStaticModule configuration** in `backend/src/app.module.ts`

3. **Verify environment variables**:
   ```bash
   # Frontend should use empty VITE_API_BASE_URL for same-origin
   cat frontend/.env.production
   ```

### Database Issues

```bash
# Reseed the database
heroku run npm run --prefix backend seed

# Or restart the app (will reseed automatically)
heroku restart
```

## Custom Domain

### Add Your Domain

```bash
# Add custom domain
heroku domains:add www.yourdomain.com

# View domains
heroku domains
```

Then update your DNS:

```
CNAME: www -> your-app-name.herokuapp.com
```

### Enable HTTPS (Free)

```bash
# Heroku provides free automatic HTTPS
heroku certs:auto:enable
```

## CI/CD Integration

### GitHub Integration

1. Go to your Heroku dashboard
2. Select your app → Deploy tab
3. Connect to GitHub
4. Enable "Automatic Deploys" from main branch
5. ✅ Deploys automatically on every push!

### Manual Deploy from GitHub

```bash
# Deploy specific branch
git push heroku feature-branch:main

# Deploy with force push (careful!)
git push heroku main --force
```

## Performance Optimization

### Enable Compression

Already configured in NestJS via `helmet` and CORS settings.

### Enable Caching

Frontend static files are automatically cached by Heroku's CDN.

### Monitor Performance

```bash
# Install New Relic (free tier)
heroku addons:create newrelic:wayne

# View metrics
heroku addons:open newrelic
```

## Cost Estimation

### Free Tier

- **Cost**: $0/month
- **Dynos**: 1 free web dyno
- **Hours**: 550-1000 hours/month
- **Sleep**: Yes (after 30 min inactivity)
- **Best for**: Demos, testing, take-home assessments

### Hobby Tier

- **Cost**: $7/month
- **Dynos**: 1 hobby dyno
- **Sleep**: No
- **Best for**: Small production apps, side projects

### Professional Tier

- **Cost**: $25-$250/month
- **Dynos**: Multiple with autoscaling
- **Features**: Metrics, threshold alerts, preboot
- **Best for**: Production applications

## Maintenance

### Update Dependencies

```bash
# Update and deploy
npm update
git add package*.json
git commit -m "chore: update dependencies"
git push heroku main
```

### Backup Database

For PostgreSQL (if you upgrade):

```bash
# Create backup
heroku pg:backups:capture

# Download backup
heroku pg:backups:download
```

## Security Checklist

- ✅ HTTPS enabled automatically
- ✅ CORS configured properly
- ✅ No sensitive data in repository
- ✅ Environment variables for secrets
- ⚠️ SQLite is ephemeral (upgrade to PostgreSQL for production)
- ✅ Helmet.js security headers (if added)

## Support

### Heroku Resources

- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Heroku Status](https://status.heroku.com/)
- [Support Tickets](https://help.heroku.com/)

### Application Resources

- [GitHub Repository](https://github.com/YOUR_USERNAME/budgettier)
- [README](./README.md)
- [API Documentation](./README.md#api-endpoints)

## Quick Reference

```bash
# Deploy
git push heroku main

# View logs
heroku logs --tail

# Restart app
heroku restart

# Open app
heroku open

# Open dashboard
heroku dashboard

# Check status
heroku ps

# View config
heroku config

# Seed database
heroku run npm run --prefix backend seed
```

---

## Success! 🎉

Your Budgettier app should now be live on Heroku!

**Next Steps:**

1. Open your app: `heroku open`
2. Test all features
3. Share the URL for demos
4. Monitor logs for any issues
5. Consider upgrading to PostgreSQL for persistence

---

**Deployment Date**: Run `date` to timestamp  
**Heroku App**: Run `heroku info` to get details  
**Status**: ✅ Production Ready
