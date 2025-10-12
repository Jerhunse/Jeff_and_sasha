# Refactor Roadmap: Spec-Compliant Architecture

## Overview

This document outlines the complete refactoring roadmap to transform the Phase 3 implementation into the specification-compliant architecture, then complete all remaining sprints.

## Current Status

### ✅ Completed
- ✅ New Prisma schema created (`schema-refactored.prisma`)
- ✅ Data migration SQL script created
- ✅ Automated migration shell script
- ✅ Migration documentation

### 🔄 In Progress
- 🔄 API route updates
- 🔄 Component updates

### ⏳ Pending
- Sprint 1-3 missing features
- Sprint 6-8 implementation

## Phase 1: Core Refactoring (Est. 16-20 hours)

### Step 1: Run Schema Migration (2-3 hours)
**Status**: Ready to execute

**Actions**:
```bash
# Test migration
./scripts/run-refactor-migration.sh --dry-run

# Run actual migration
./scripts/run-refactor-migration.sh
```

**Deliverables**:
- ✅ New database schema applied
- ✅ Data migrated to new structure
- ✅ Prisma Client regenerated
- ✅ Backup created

### Step 2: Update Core APIs (6-8 hours)
**Status**: Pending

**Files to Update**:

#### Invitation APIs
- [ ] `app/api/admin/invitations/send/route.ts`
  - Update to create Campaign
  - Link Invitations to Campaign
  - Use new status enums

- [ ] `app/api/admin/invitations/track/route.ts`
  - Update field names (openedAt, deliveredAt)
  - Update status transitions

- [ ] `app/api/admin/invitations/export/route.ts`
  - Update query to use Campaign
  - Include new fields

#### RSVP APIs
- [ ] `app/api/rsvp/[code]/route.ts`
  - Fetch RSVPQuestions dynamically
  - Create RSVPResponse instead of updating Guest
  - Handle answersJSON structure
  - Support per-event responses

- [ ] `app/api/admin/rsvp-questions/route.ts` (NEW)
  - CRUD operations for RSVPQuestion
  - Validation and ordering

#### Guest APIs
- [ ] Update all references to `weddingId` → `coupleId`
- [ ] Update address handling
- [ ] Update `inviteCode` → `inviteToken`

### Step 3: Update Components (4-6 hours)
**Status**: Pending

#### RSVP Components
- [ ] `components/rsvp/rsvp-form.tsx`
  - Fetch questions from API
  - Render questions dynamically based on type
  - Build answersJSON from form
  - Handle plus-one responses

#### Admin Components
- [ ] `components/admin/invitation-tracker.tsx`
  - Update to show Campaign-level stats
  - Update status badges
  - Handle new field names

- [ ] `components/admin/send-invitations-dialog.tsx`
  - Create Campaign on send
  - Link invitations to campaign

- [ ] `components/admin/rsvp-question-builder.tsx` (NEW)
  - Visual question builder
  - Question type selector
  - Options management
  - Conditional logic builder

### Step 4: Update Pages (2-3 hours)
**Status**: Pending

- [ ] `app/(admin)/admin/invitations/page.tsx`
  - Update queries for Campaign model
  - Update statistics calculations

- [ ] `app/(admin)/admin/rsvp/page.tsx` (NEW)
  - Create RSVP management page
  - Show responses by event
  - Question builder interface

- [ ] `app/(public)/rsvp/[code]/page.tsx`
  - Update to pass questions to form
  - Handle event selection if multiple events

- [ ] Update all page references: `wedding` → `couple`

## Phase 2: Sprint 1-3 Completion (Est. 12-16 hours)

### Sprint 2 Missing Features (6-8 hours)

#### Visual Page Builder (4-5 hours)
- [ ] `components/admin/page-builder/section-editor.tsx`
  - Drag-and-drop section ordering
  - Live preview
  - Section type selector

- [ ] `components/admin/page-builder/section-types/`
  - Hero section editor
  - Gallery grid editor
  - Two-column editor
  - FAQ accordion editor
  - Map block editor
  - Registry showcase editor

#### Media Library (2-3 hours)
- [ ] `app/(admin)/admin/media/page.tsx`
  - Grid view with thumbnails
  - Upload interface
  - Tag management
  - Search and filter

- [ ] `components/admin/media-picker.tsx`
  - Modal selector
  - Integration with page builder

#### Theme Management UI (1-2 hours)
- [ ] `app/(admin)/admin/settings/theme/page.tsx`
  - Color picker for primary/secondary/accent
  - Font selector (Google Fonts integration)
  - Corner radius slider
  - Live preview

### Sprint 3 Missing Features (6-8 hours)

#### Google Contacts Import (3-4 hours)
- [ ] `app/api/admin/guests/import/google/route.ts`
  - OAuth flow for Google
  - Fetch contacts
  - Map to guest fields
  - Handle conflicts

- [ ] `app/(admin)/admin/guests/import/google/page.tsx`
  - Authorization button
  - Contact selector
  - Preview and confirm

#### Enhanced Dedupe Tools (3-4 hours)
- [ ] `components/admin/dedupe-wizard.tsx`
  - Fuzzy matching algorithm
  - Side-by-side comparison
  - Bulk merge operations
  - Undo capability

- [ ] `app/api/admin/guests/dedupe/route.ts`
  - Find duplicate candidates
  - Merge guests
  - Update relations

## Phase 3: Sprint 6 - Seating (Est. 10-12 hours)

### Database (Already in schema)
- ✅ SeatingChart model
- ✅ Table model with x/y positioning
- ✅ Seat model

### Features to Implement

#### Drag-and-Drop Canvas (6-7 hours)
- [ ] `components/admin/seating/seating-canvas.tsx`
  - React DnD or similar for drag-drop
  - Table positioning
  - Zoom/pan controls
  - Grid snapping

- [ ] `components/admin/seating/table-component.tsx`
  - Visual table with seats
  - Shape rendering (round, rectangle)
  - Capacity indicator
  - Guest avatars

#### Guest Assignment (2-3 hours)
- [ ] `components/admin/seating/guest-sidebar.tsx`
  - Searchable guest list
  - Dietary flags
  - Drag guests to tables

- [ ] `components/admin/seating/conflict-detector.tsx`
  - Detect over-capacity
  - Highlight dietary needs
  - Show household separation

#### Exports (2 hours)
- [ ] `app/api/admin/seating/export/route.ts`
  - CSV export (table, seat, guest name)
  - PDF export with visual layout
  - Check-in list per table

## Phase 4: Sprint 7 - Messaging & Guest Portal (Est. 12-14 hours)

### Segmented Messaging (6-7 hours)

- [ ] `app/(admin)/admin/messages/page.tsx`
  - Message list
  - Composer interface
  - Schedule selector

- [ ] `components/admin/message-composer.tsx`
  - Rich text editor
  - Segment builder (tags, status, RSVP)
  - Template variables
  - Preview

- [ ] `app/api/admin/messages/send/route.ts`
  - Evaluate segment rules
  - Queue messages
  - Track delivery

### Guest Portal (4-5 hours)

- [ ] `app/(public)/portal/[token]/page.tsx`
  - Magic link authentication
  - Profile view/edit
  - RSVP history
  - Ability to update RSVP

- [ ] `app/api/portal/[token]/route.ts`
  - Validate token
  - Update guest info
  - Update RSVP responses

### Hotel Blocks UI (2 hours)

- [ ] `app/(admin)/admin/hotels/page.tsx`
  - CRUD for hotel blocks
  - Map integration
  - Booking code management

## Phase 5: Sprint 8 - Analytics & Launch (Est. 10-12 hours)

### Analytics Dashboard (6-7 hours)

- [ ] `app/(admin)/admin/overview/page.tsx`
  - KPI tiles (guests, groups, replied, pending)
  - RSVP trend chart (Chart.js or Recharts)
  - Meal count breakdown
  - Song request word cloud
  - Recent activity feed

- [ ] `components/admin/charts/`
  - RSVPTrendChart
  - MealDistributionChart
  - AttendanceByTagChart
  - CampaignPerformanceChart

### Performance Optimization (2-3 hours)

- [ ] Image optimization (Next/Image)
- [ ] Code splitting
- [ ] Database query optimization
- [ ] Caching strategy
- [ ] Bundle size analysis

### Launch Preparation (2 hours)

- [ ] Domain mapping documentation
- [ ] Environment variables checklist
- [ ] Deployment guide (Vercel)
- [ ] Monitoring setup (Sentry)
- [ ] Backup automation

## Testing Strategy

### Unit Tests (Throughout)
- [ ] RSVP question logic
- [ ] Campaign creation
- [ ] Segment evaluation
- [ ] Address normalization
- [ ] Dedupe matching

### Integration Tests
- [ ] Full RSVP flow
- [ ] Invitation sending
- [ ] Guest import
- [ ] Seating assignment

### E2E Tests (Playwright)
- [ ] Guest RSVP journey
- [ ] Admin invitation workflow
- [ ] Guest portal access
- [ ] Message composition and send

## Timeline Summary

| Phase | Description | Hours | Priority |
|-------|-------------|-------|----------|
| **Phase 1** | Core Refactoring | 16-20 | 🔴 Critical |
| **Phase 2** | Sprint 1-3 Completion | 12-16 | 🔴 Critical |
| **Phase 3** | Sprint 6 - Seating | 10-12 | 🟡 High |
| **Phase 4** | Sprint 7 - Messaging | 12-14 | 🟡 High |
| **Phase 5** | Sprint 8 - Analytics | 10-12 | 🟢 Medium |
| **Testing** | Comprehensive Testing | 8-10 | 🔴 Critical |
| **Total** | | **68-84 hours** | |

## Daily Plan (Assuming 6-8 hour days)

### Week 1: Core Refactoring
- **Day 1**: Run migration, verify data
- **Day 2**: Update invitation APIs
- **Day 3**: Update RSVP APIs, create question builder API
- **Day 4**: Update components (RSVP form, invitation tracker)
- **Day 5**: Testing and bug fixes

### Week 2: Sprint 2-3 Completion
- **Day 6**: Visual page builder
- **Day 7**: Media library
- **Day 8**: Theme management UI
- **Day 9**: Google Contacts import
- **Day 10**: Dedupe tools

### Week 3: Seating & Messaging
- **Day 11**: Seating canvas (drag-drop)
- **Day 12**: Guest assignment and conflict detection
- **Day 13**: Seating exports (CSV/PDF)
- **Day 14**: Message composer
- **Day 15**: Guest portal

### Week 4: Analytics & Launch
- **Day 16**: Analytics dashboard
- **Day 17**: Charts and visualizations
- **Day 18**: Performance optimization
- **Day 19**: Testing (unit + integration)
- **Day 20**: E2E tests, documentation, launch prep

## Success Criteria

### Phase 1 Complete When:
- ✅ All migrations run successfully
- ✅ All APIs use new models
- ✅ All components work with new schema
- ✅ No TypeScript errors
- ✅ Existing features still work

### Sprint 2 Complete When:
- ✅ Visual page builder functional
- ✅ Media library with tags
- ✅ Theme changes apply in real-time
- ✅ All section types supported

### Sprint 3 Complete When:
- ✅ Google Contacts import works
- ✅ Dedupe wizard finds and merges duplicates
- ✅ No data loss in merges

### Sprint 6 Complete When:
- ✅ Drag-drop seating works smoothly
- ✅ Capacity and conflicts detected
- ✅ Exports generate correctly

### Sprint 7 Complete When:
- ✅ Messages send to correct segments
- ✅ Guest portal allows RSVP updates
- ✅ Hotel blocks display on public site

### Sprint 8 Complete When:
- ✅ Dashboard shows real-time stats
- ✅ Charts render correctly
- ✅ Performance metrics green (Lighthouse >90)
- ✅ Production deployment successful

## Risk Mitigation

### High Risk Areas:
1. **Data Migration**: Comprehensive backups, rollback plan
2. **Breaking Changes**: Incremental updates, feature flags
3. **Performance**: Load testing, query optimization
4. **User Experience**: Beta testing with real couples

### Mitigation Strategies:
- ✅ Automated migration script with dry-run
- ✅ Comprehensive backup before each phase
- ✅ Feature flags for new functionality
- ✅ Staged rollout (dev → staging → production)
- ✅ Monitoring and alerting from day 1

## Next Immediate Steps

1. **Review Migration Plan**: Ensure understanding of data transformations
2. **Run Test Migration**: Execute with `--dry-run` flag
3. **Backup Production**: If this will affect production data
4. **Execute Migration**: Run the actual migration
5. **Begin API Updates**: Start with invitation APIs
6. **Update Components**: Follow with RSVP form
7. **Test Thoroughly**: Verify each change

## Questions to Answer

Before proceeding:
- [ ] Is production data at risk? (If yes, backup first)
- [ ] Are we comfortable with breaking changes?
- [ ] Do we want to ship refactor before new features?
- [ ] What's the timeline pressure?
- [ ] Should we use feature flags?

---

**Ready to Begin?** 🚀

Execute: `./scripts/run-refactor-migration.sh`

**Status**: Awaiting your approval to proceed with migration.

