# Startup Script

The startup script automates the setup and launch of the wedding platform development environment.

## Quick Start

### Option 1: Using the Startup Script (Recommended)

```bash
# Run the full setup and start script
npm run startup

# Or directly:
./scripts/startup.sh
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Setup database (update .env first!)
npx prisma db push

# Start dev server
npm run dev
```

## What the Startup Script Does

1. **Checks Prerequisites**
   - Verifies Node.js 18+ is installed
   - Checks for npm

2. **Installs Dependencies**
   - Runs `npm install` if needed

3. **Environment Setup**
   - Creates `.env` file with template if missing
   - Generates secure `NEXTAUTH_SECRET`
   - Prompts you to update `DATABASE_URL`

4. **Database Setup**
   - Generates Prisma client
   - Pushes database schema or runs migrations
   - Optionally seeds database with sample data

5. **Starts Development Server**
   - Launches Next.js dev server with Turbopack
   - Opens at http://localhost:3000

## Prerequisites

Before running the startup script, make sure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL Database** - Local or cloud (Neon, Supabase, etc.)
- **Git** (for cloning)

## Environment Variables

The script will create a `.env` file if it doesn't exist. You'll need to update:

- `DATABASE_URL` - Your PostgreSQL connection string
- Optional: OAuth, Email, AWS credentials

See `ENV_SETUP.md` for detailed environment variable documentation.

## Troubleshooting

### Script fails on database setup

If the database setup fails:
1. Verify your `DATABASE_URL` in `.env` is correct
2. Ensure your database is running and accessible
3. Run manually: `npx prisma db push` or `npx prisma migrate dev`

### Port 3000 already in use

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Prisma client not found

```bash
npx prisma generate
```

## Windows Users

If you're on Windows and the bash script doesn't work:

1. Use WSL (Windows Subsystem for Linux)
2. Or use Git Bash
3. Or run the manual setup steps above

## Next Steps After Startup

1. **Create a Wedding Record**
   - Visit http://localhost:3000/admin
   - Or use Prisma Studio: `npx prisma studio`

2. **Add Test Data**
   - Run seed script: `npm run seed`
   - Or manually add via Prisma Studio

3. **View Your Site**
   - Public site: http://localhost:3000/[your-slug]
   - Admin: http://localhost:3000/admin
