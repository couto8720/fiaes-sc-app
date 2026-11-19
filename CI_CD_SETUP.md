# CI/CD Pipeline Setup - Fiães SC

## Overview

This document explains the CI/CD pipeline setup using GitHub Actions and Vercel.

## Pipeline Stages

### 1. **Test & Build** (Runs on every push/PR)
- ✅ Install dependencies
- ✅ Lint code (ESLint)
- ✅ Type check (TypeScript)
- ✅ Build Next.js app
- ✅ Upload artifacts

### 2. **Security Scan** (Runs on every push/PR)
- ✅ Dependency vulnerability scanning (`npm audit`)
- ✅ Continues on warnings (doesn't block merge)

### 3. **Preview Deployment** (Runs on Pull Requests)
- ✅ Automatic deployment to Vercel preview environment
- ✅ Each PR gets a unique preview URL
- ✅ Optional (requires Vercel secrets)

### 4. **Production Deployment** (Runs on main branch push)
- ✅ Automatic deployment to production on Vercel
- ✅ Only after all tests pass
- ✅ Optional (requires Vercel secrets)

## Setup Instructions

### Prerequisites
- GitHub repository connected
- Node.js 18+ installed locally
- npm or yarn package manager

### Step 1: Configure GitHub Secrets

Add these secrets to your GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### Optional: Vercel Integration
If you want automatic deployment to Vercel:

```
VERCEL_TOKEN: <Your Vercel authentication token>
VERCEL_PROJECT_ID: <Your Vercel project ID>
```

**How to get these:**
1. Go to https://vercel.com/account/tokens
2. Create a new token (name: "GitHub Actions")
3. Copy the token value as `VERCEL_TOKEN`
4. Go to your Vercel project settings
5. Copy the Project ID as `VERCEL_PROJECT_ID`

### Step 2: Update Environment Variables

#### In your repository root (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=https://fiaes.pt
ENCRYPTION_KEY=<64-char-hex-key>
SENDGRID_API_KEY=SG.xxx
```

#### In Vercel Project Settings (if deploying to Vercel)
Add the same environment variables in Vercel Dashboard:
- Production environment variables
- Preview environment variables (if different)

### Step 3: Configure Branch Protection Rules (Optional)

Protect main branch from direct pushes:

1. Go to `Settings > Branches > Branch protection rules`
2. Add rule for `main` branch
3. Require status checks to pass before merging:
   - `test` job must pass
   - `security-scan` job must pass
4. Require PR review (optional)

### Step 4: Local Development

Before pushing, run locally:

```bash
# Install dependencies
npm install

# Lint code
npm run lint

# Type check
npm run type-check

# Build
npm run build

# Start dev server
npm run dev
```

## GitHub Actions Workflow Files

Located in `.github/workflows/`:

- **test-and-build.yml** - Main CI pipeline (test, build, deploy)

## Monitoring Pipeline

### View Pipeline Status
1. Go to your GitHub repository
2. Click on "Actions" tab
3. See all workflow runs with status

### View Logs
1. Click on a workflow run
2. Click on a job to see logs
3. Check for errors or warnings

### Deploy Preview
When you create a PR:
1. Pipeline runs automatically
2. If configured, preview deploys to Vercel
3. A preview URL comment is added to the PR
4. Click the URL to test changes

## Common Issues & Solutions

### Build Fails Locally but Passes in CI
- Check Node.js version: `node -v` (must be 18+)
- Clear cache: `rm -rf .next node_modules && npm install`
- Check environment variables are set

### Type Check Fails
- Run locally: `npm run type-check`
- Check TypeScript errors
- Fix types before committing

### Lint Fails
- Run locally: `npm run lint`
- Auto-fix: `npm run lint -- --fix`
- Fix remaining issues manually

### Deployment Fails
- Check Vercel secrets are configured correctly
- Review Vercel project settings
- Check environment variables in Vercel Dashboard
- Review Vercel deployment logs

## Disabling Pipeline Checks

To skip CI/CD for a specific commit:
```bash
git commit -m "Quick hotfix [skip ci]"
git push
```

**Note:** This is not recommended for production code.

## Next Steps

1. ✅ Configure GitHub secrets (optional for auto-deploy)
2. ✅ Test pipeline with a small PR
3. ✅ Monitor deployments in GitHub Actions
4. ✅ Set up branch protection if needed

## Support

For CI/CD issues:
- Email: admin@fiaes.pt
- Check GitHub Actions logs for error details
- Verify environment variables are set correctly

## Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [.github/workflows/test-and-build.yml](.github/workflows/test-and-build.yml) - Workflow configuration
