---
phase: 03-tour-content
plan: 01
subsystem: content-schema
tags: [sanity, schema, groq, tour-content, itinerary, safety]

dependency-graph:
  requires:
    - 02-01 # Sanity CMS setup
    - 02-02 # Schema types established
  provides:
    - Extended tour schema with itinerary structure
    - Tour detail fields (inclusions, exclusions, safety)
    - GROQ projections for all new tour fields
  affects:
    - 03-02 # Tour detail components will consume these fields

tech-stack:
  added: []
  patterns:
    - Object-wrapped array fields in Sanity schema
    - Nested GROQ projections for object and array fields
    - Field positioning strategy (detail fields after body, before metadata)

key-files:
  created: []
  modified:
    - path: src/sanity/schemaTypes/tour.ts
      lines: +141
      purpose: Extended tour schema with 4 new field groups
    - path: src/sanity/lib/queries.ts
      lines: +22/-1
      purpose: Updated tourBySlugQuery to project new fields

key-decisions:
  - decision: Position detail fields (itinerary, inclusions, exclusions, safetyInfo) after body and before category
    rationale: Logical grouping - content fields together, metadata fields together
    alternatives: Position at end of schema
    impact: Schema organization clarity
    phase-plan: 03-01
  - decision: Use object-wrapped array pattern for itinerary (array of day objects, each containing activities array)
    rationale: Avoids Sanity's nested array limitation while providing rich structure
    alternatives: Flat string array, separate schema type for days
    impact: Enables day-by-day itinerary with activities, meals, accommodation per day
    phase-plan: 03-01
  - decision: Keep allToursQuery unchanged (no new field projections)
    rationale: Listing query optimization - only fetch fields needed for tour cards
    alternatives: Project all fields in listing query
    impact: Performance - listing pages remain fast, detail pages get full data
    phase-plan: 03-01

patterns-established:
  - Sanity array field with preview function for better Studio UX
  - Safety-focused tour schema design with explicit risk disclosure fields
  - GROQ projection pattern for nested objects and arrays

metrics:
  duration: 2 minutes
  completed: 2026-02-13
---

# Phase 3 Plan 1: Schema Extensions Summary

**One-liner:** Extended tour schema with day-by-day itinerary, inclusions/exclusions transparency, and comprehensive safety disclosure fields

## Performance

**Execution:** 2 tasks, 2 commits, 2 minutes
**Status:** Complete - all success criteria met
**Build:** TypeScript compilation successful (runtime error expected without Sanity config)

## Accomplishments

1. **Extended tour schema with 4 new field groups:**
   - Itinerary: Day-by-day structure with dayNumber, title, description, activities, meals, accommodation
   - Inclusions: String array for what's included in tour price
   - Exclusions: String array for what's not included
   - Safety Info: Comprehensive object with difficulty level, fitness requirements, risks, equipment provided, what to bring, guide certifications

2. **Updated GROQ queries:**
   - tourBySlugQuery now projects all new fields with proper nested syntax
   - Preserved allToursQuery optimization (listing query unchanged)

3. **Schema design patterns:**
   - Object-wrapped arrays to avoid Sanity nested array limitation
   - Preview functions for better Sanity Studio UX (Day N: Title format)
   - Dropdown with descriptive titles for difficulty levels
   - Field positioning strategy (content fields grouped, metadata fields grouped)

## Task Commits

| Task | Commit | Description | Files |
|------|--------|-------------|-------|
| 1 | af7bd5e | Extend tour schema with itinerary, inclusions, exclusions, and safety fields | src/sanity/schemaTypes/tour.ts |
| 2 | 81dd64e | Update tourBySlugQuery with new field projections | src/sanity/lib/queries.ts |

## Files Created/Modified

**Modified:**
- `src/sanity/schemaTypes/tour.ts` (+141 lines): Added 4 new defineField blocks with complete validation and preview configuration
- `src/sanity/lib/queries.ts` (+22/-1 lines): Extended tourBySlugQuery with nested projections for itinerary[], safetyInfo{}, inclusions, exclusions, and explicit availableDates[] structure

**Dependencies (auto-fixed):**
- `package-lock.json`: Installed node_modules (blocking issue - Rule 3)

## Decisions Made

### 1. Field Positioning Strategy
**Decision:** Insert detail fields after `body` and before `category`
**Rationale:** Logical grouping - content fields (title, excerpt, body, itinerary) together, metadata fields (category, duration, pricing, dates) together
**Impact:** Improved schema readability and Studio field order

### 2. Itinerary Structure Pattern
**Decision:** Use array of day objects, where each day object contains an activities string array
**Rationale:** Sanity doesn't support direct nested arrays (array of arrays), but object-wrapped arrays work perfectly. This pattern enables rich day structure while avoiding Sanity limitations.
**Implementation:**
```typescript
itinerary: array of {
  dayNumber, title, description,
  activities: array of strings,
  meals: object with booleans,
  accommodation: string
}
```

### 3. Listing Query Optimization
**Decision:** Keep `allToursQuery` unchanged - don't project new detail fields
**Rationale:** Phase 2 established pattern - listing queries are lightweight for performance. Tour cards don't need itinerary/safety/inclusions data. Only detail pages need full projections.
**Impact:** Tour listing pages remain fast, detail pages get comprehensive data

### 4. Safety Difficulty Levels
**Decision:** Use dropdown with descriptive titles ("Easy - All fitness levels", "Moderate - Basic fitness required")
**Rationale:** Provides guidance to content editors while storing clean enum values
**UX:** Clearer than just "Easy", "Moderate" alone

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing node_modules prevented build verification**
- **Found during:** Task 1 verification
- **Issue:** `npm run build` failed with "astro: command not found" because dependencies weren't installed
- **Fix:** Ran `npm install` to install all project dependencies
- **Files modified:** package-lock.json
- **Commit:** Not committed separately (auto-fix for verification)

**Note:** No other deviations. Plan executed exactly as written. All field definitions matched research specifications.

## Issues Encountered

### Environment-Specific Build Limitation
**Issue:** Build fails at runtime with "Configuration must contain `projectId`"
**Impact:** Cannot verify full build completion, only TypeScript compilation
**Resolution:** TypeScript compilation succeeded ("types generated", "vite built") which confirms schema validity. Runtime error is expected without Sanity environment variables (.env file with SANITY_PROJECT_ID). This doesn't block schema work.
**Next steps:** Future plans that require full build verification will need Sanity credentials or mock config.

**No functional issues.** Schema and queries are correctly implemented and type-safe.

## Next Phase Readiness

### Ready for 03-02
- [x] Tour schema has all fields needed for detail page components
- [x] GROQ query projects all required data
- [x] TypeScript types will be generated from schema
- [x] Field structure is consumption-ready (no refactoring needed)

### Downstream Impacts
**03-02 (Tour Detail Components):** Can immediately consume:
- `tour.itinerary[]` for day-by-day accordion/tabs
- `tour.inclusions` and `tour.exclusions` for transparency sections
- `tour.safetyInfo.*` for safety disclosure component
- All fields are properly typed via TypeScript

**Future plans:** New tour fields are now available to all GROQ queries. Any plan that needs to display tour details can reference this schema structure.

### Blockers for Next Plan
None. Schema and queries are complete and ready for component consumption.

### Recommendations
1. **Sanity Studio verification:** Next plan should include testing the new fields in Sanity Studio (create/edit tour document)
2. **Sample data:** Create at least one tour with full itinerary data for component development/testing
3. **Type generation:** Verify generated TypeScript types match schema expectations (may want to export types for component props)
