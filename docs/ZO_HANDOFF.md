# Zo Workspace Deployment Handoff for Codex

## Task Overview

Automate deployment of the local codebase to the Zo workspace, ensuring all dependencies and environment variables are set up exactly as on the local machine.

## Repository Information

- **GitHub Repository:** https://github.com/Odiabackend099/shopwithin-dropship-os
- **Branch:** main
- **Local Path:** `/Users/mac/Desktop/Risewithin Shopify/dropship-os`

## Deployment Scripts

The following scripts have been created to automate the Zo workspace setup:

### 1. Environment Setup Script
**File:** `scripts/zo-env-setup.sh`
**Purpose:** Securely sets up environment variables template
**Usage:** `bash scripts/zo-env-setup.sh`

This script:
- Creates a `.env` file with placeholder values
- Lists all required environment variables
- Warns about security (never commit actual secrets)
- Provides instructions for setting actual values

### 2. Deployment Script
**File:** `scripts/zo-deploy.sh`
**Purpose:** Automated deployment to Zo workspace
**Usage:** `bash scripts/zo-deploy.sh`

This script:
- Clones or updates the repository
- Installs system dependencies (Node.js, pnpm)
- Installs project dependencies
- Sets up environment variables
- Builds the project
- Runs database migrations
- Runs validation tests
- Provides instructions for starting the system

### 3. Validation Script
**File:** `scripts/zo-validate.sh`
**Purpose:** Validates that the system runs identically to local environment
**Usage:** `bash scripts/zo-validate.sh`

This script validates:
- Node.js and pnpm installation
- Project structure
- Package installation
- Core package build
- Operator skills functionality
- Environment variables
- Documentation presence
- API build (if applicable)
- UGC Engine build (if applicable)

## Instructions for Zo Agent

### Step 1: Clone Repository
```bash
git clone https://github.com/Odiabackend099/shopwithin-dropship-os.git
cd shopwithin-dropship-os
```

### Step 2: Run Deployment Script
```bash
bash scripts/zo-deploy.sh
```

This will:
- Install all dependencies
- Build the project
- Run validation tests
- Set up the workspace

### Step 3: Configure Environment Variables
The deployment script will create a `.env` file with placeholder values. You must replace these with actual credentials:

```bash
# Edit .env file and replace placeholder values
nano .env
```

Required environment variables:
- `OPENAI_API_KEY` - OpenAI API key for AI content generation
- `GROQ_API_KEY` - Groq API key for fast inference
- `FLOW_AI_API_KEY` - Flow AI API key for video generation
- `SHOPIFY_ACCESS_TOKEN` - Shopify access token
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

**IMPORTANT:** Never commit actual secrets to the repository. The `.env` file should be added to `.gitignore`.

### Step 4: Run Validation
```bash
bash scripts/zo-validate.sh
```

This will verify that:
- All dependencies are installed
- The project builds successfully
- Operator skills run correctly
- The system is ready for use

### Step 5: Start the System
```bash
# Start the API server
pnpm dev

# Or run operator skills
pnpm operator:daily --dry-run
```

## What Success Looks Like

When the deployment is complete and validated, you should have:

1. **Repository Cloned:** The entire codebase is in the Zo workspace
2. **Dependencies Installed:** All npm packages are installed
3. **Project Builds:** `pnpm build` completes successfully
4. **Validation Passes:** All tests in `zo-validate.sh` pass
5. **Environment Configured:** `.env` file exists with actual values
6. **System Runs:** API server responds, operator skills execute
7. **No Configuration Gaps:** Order flow works end-to-end

## Security Constraints

- **No Hardcoded Secrets:** Environment variables are never committed to the repository
- **Secure Storage:** Use Zo's secure environment variable storage if available
- **Access Control:** Ensure only authorized agents can access sensitive credentials
- **Audit Trail:** Log all environment variable access

## Troubleshooting

### Issue: Dependencies Not Installing
**Solution:** Ensure Node.js 20+ is installed and pnpm is available globally

### Issue: Build Fails
**Solution:** Check that all environment variables are set correctly, especially database and API keys

### Issue: Validation Fails
**Solution:** Run `pnpm install` to ensure all dependencies are installed, then check project structure

### Issue: Environment Variables Missing
**Solution:** Run `bash scripts/zo-env-setup.sh` to create the template, then fill in actual values

## Next Steps After Deployment

Once the Zo workspace is validated and running:

1. **Test Operator Skills:** Run `pnpm operator:daily --dry-run` to test the full workflow
2. **Test API Endpoints:** Verify that the API server responds correctly
3. **Test Order Flow:** Ensure the order routing and tracking sync works
4. **Monitor Logs:** Check that all services start without errors
5. **Scale Testing:** Verify the system can handle expected load

## Contact Information

If you encounter issues during deployment:
- Check the validation script output for specific errors
- Review the logs in the Zo workspace
- Consult the main documentation in `docs/OPERATOR_GUIDE.md`
- Refer to skill documentation in `docs/SKILLS/`

## Repository Status

- **Status:** Ready for Zo deployment
- **Last Commit:** Initial commit with AI Commerce Operator
- **Branch:** main
- **Scripts:** All deployment scripts are executable and tested
