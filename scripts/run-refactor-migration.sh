#!/bin/bash

# ============================================
# Automated Refactor Migration Script
# ============================================
# This script automates the migration from Phase 3 to Spec-compliant schema
# 
# Usage: ./scripts/run-refactor-migration.sh [--dry-run] [--skip-backup]
#
# Flags:
#   --dry-run: Test migration without committing changes
#   --skip-backup: Skip database backup (NOT RECOMMENDED)
#
# ============================================

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
SKIP_BACKUP=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
  esac
done

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Wedding Platform - Refactor Migration${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  DRY RUN MODE - No changes will be committed${NC}"
  echo ""
fi

# Step 1: Check prerequisites
echo -e "${BLUE}[1/9]${NC} Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
  exit 1
fi

if ! command -v npx &> /dev/null; then
  echo -e "${RED}❌ npx not found. Please install npm first.${NC}"
  exit 1
fi

if [ ! -f ".env" ]; then
  echo -e "${RED}❌ .env file not found. Please create one first.${NC}"
  exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
  echo -e "${RED}❌ DATABASE_URL not set in .env file.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Step 2: Backup database
if [ "$SKIP_BACKUP" = false ]; then
  echo -e "${BLUE}[2/9]${NC} Creating database backup..."
  
  BACKUP_DIR="backups"
  mkdir -p "$BACKUP_DIR"
  
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_FILE="${BACKUP_DIR}/backup_before_refactor_${TIMESTAMP}.sql"
  
  # Extract database URL
  DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2-)
  
  if command -v pg_dump &> /dev/null; then
    echo "Creating PostgreSQL backup..."
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
  else
    echo -e "${YELLOW}⚠️  pg_dump not found. Skipping backup.${NC}"
    echo -e "${YELLOW}   Please create a manual backup before continuing.${NC}"
    read -p "Continue without backup? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${RED}Migration cancelled.${NC}"
      exit 1
    fi
  fi
else
  echo -e "${YELLOW}[2/9] Skipping database backup (--skip-backup flag)${NC}"
fi
echo ""

# Step 3: Copy refactored schema
echo -e "${BLUE}[3/9]${NC} Applying new schema..."

if [ ! -f "prisma/schema-refactored.prisma" ]; then
  echo -e "${RED}❌ Refactored schema not found at prisma/schema-refactored.prisma${NC}"
  exit 1
fi

# Backup current schema
cp prisma/schema.prisma prisma/schema.backup.prisma
echo -e "${GREEN}✓ Current schema backed up to prisma/schema.backup.prisma${NC}"

# Copy refactored schema
cp prisma/schema-refactored.prisma prisma/schema.prisma
echo -e "${GREEN}✓ New schema applied${NC}"
echo ""

# Step 4: Create Prisma migration
echo -e "${BLUE}[4/9]${NC} Creating Prisma migration..."

if [ "$DRY_RUN" = true ]; then
  npx prisma migrate dev --name refactor_to_spec --create-only
  echo -e "${YELLOW}⚠️  Migration created but not applied (dry run mode)${NC}"
else
  npx prisma migrate dev --name refactor_to_spec
  echo -e "${GREEN}✓ Prisma migration applied${NC}"
fi
echo ""

# Step 5: Generate Prisma Client
echo -e "${BLUE}[5/9]${NC} Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Step 6: Run data migration
echo -e "${BLUE}[6/9]${NC} Running data migration..."

if [ ! -f "prisma/migrations/data-migration.sql" ]; then
  echo -e "${RED}❌ Data migration script not found${NC}"
  exit 1
fi

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  Would run data migration (skipped in dry run mode)${NC}"
else
  echo "Applying data migration..."
  npx prisma db execute --file prisma/migrations/data-migration.sql --schema prisma/schema.prisma
  echo -e "${GREEN}✓ Data migration completed${NC}"
fi
echo ""

# Step 7: Verify migration
echo -e "${BLUE}[7/9]${NC} Verifying migration..."

echo "Running verification queries..."
npx prisma db execute --stdin --schema prisma/schema.prisma <<EOF
SELECT 
  'Addresses' as table_name, 
  COUNT(*)::text as count 
FROM "Address"
UNION ALL
SELECT 'Campaigns', COUNT(*)::text FROM "Campaign"
UNION ALL
SELECT 'RSVP Questions', COUNT(*)::text FROM "RSVPQuestion"
UNION ALL
SELECT 'RSVP Responses', COUNT(*)::text FROM "RSVPResponse";
EOF

echo -e "${GREEN}✓ Verification completed${NC}"
echo ""

# Step 8: Update TypeScript types
echo -e "${BLUE}[8/9]${NC} Checking TypeScript compilation..."
npm run type-check || echo -e "${YELLOW}⚠️  Type errors found. Will need to update code.${NC}"
echo ""

# Step 9: Summary
echo -e "${BLUE}[9/9]${NC} Migration summary:"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Dry run completed. No changes were committed.${NC}"
  echo ""
  echo "To run the actual migration:"
  echo "  ./scripts/run-refactor-migration.sh"
else
  echo -e "${GREEN}✓ Schema migration completed${NC}"
  echo -e "${GREEN}✓ Data migration completed${NC}"
  echo -e "${GREEN}✓ Prisma Client regenerated${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "  1. Update API routes to use new models"
  echo "  2. Update components to use new models"
  echo "  3. Run tests: npm test"
  echo "  4. Start dev server: npm run dev"
  echo "  5. Verify functionality manually"
  echo ""
  echo -e "${YELLOW}Rollback:${NC}"
  echo "  If issues arise, restore from: $BACKUP_FILE"
  echo "  And revert schema: cp prisma/schema.backup.prisma prisma/schema.prisma"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Migration process complete!${NC}"
echo -e "${BLUE}============================================${NC}"

