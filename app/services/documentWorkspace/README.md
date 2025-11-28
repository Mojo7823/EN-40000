# Document Workspace Module

Central state management for CRA Tool document data. Handles persistence to localStorage and provides type-safe update functions for all document sections.

## Structure

```
documentWorkspace/
├── index.ts          # Public API - import everything from here
├── types.ts          # TypeScript interfaces for all state shapes
├── constants.ts      # Section keys, ID prefixes, generators
├── defaults.ts       # Default values for each section
├── storage.ts        # localStorage persistence & listeners
├── cloners/          # Deep clone helpers (immutability)
└── updaters/         # State update functions
```

## Usage

```typescript
// All imports come from the main module
import {
  loadDocumentWorkspace,
  updateCoverState,
  updateRiskManagementState,
  type CoverFormState,
} from '~/services/documentWorkspace'

// Load state on mount
const state = loadDocumentWorkspace()

// Update a section (auto-persists)
updateCoverState({ deviceName: 'My Product' })

// Subscribe to changes
const unsubscribe = subscribeDocumentWorkspace((newState) => {
  console.log('State updated:', newState.lastUpdated)
})
```

## Adding a New Risk Management Section

1. **types.ts** - Add interface for the new section state
2. **constants.ts** - Add section key constant
3. **defaults.ts** - Add default state value
4. **cloners/riskManagementCloners.ts** - Add clone function
5. **updaters/riskManagementUpdaters.ts** - Update `updateRiskManagementState()`
6. **index.ts** - Export new types/constants if needed

## Key Patterns

- **Never mutate state directly** - Always use update functions
- **Deep cloning** - All state is cloned before updates to prevent mutations
- **Auto-persistence** - Updates automatically save to localStorage
- **Listeners** - Subscribe to state changes for reactive updates

## Files Overview

| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces |
| `constants.ts` | Section keys, ID generators |
| `defaults.ts` | Initial/empty state values |
| `storage.ts` | Load, save, import/export, listeners |
| `cloners/*.ts` | Deep clone functions per domain |
| `updaters/*.ts` | Patch-based update functions |
