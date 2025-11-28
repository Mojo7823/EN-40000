// ============================================================================
// BACKWARD COMPATIBILITY LAYER
// ============================================================================
// This file re-exports everything from the modularized documentWorkspace folder.
// All imports from 'services/documentWorkspace' will continue to work.
// 
// The actual implementation is now in:
//   app/services/documentWorkspace/
//     ├── index.ts          - Main exports
//     ├── types.ts          - TypeScript interfaces
//     ├── constants.ts      - Section keys, ID generators
//     ├── defaults.ts       - Default state values
//     ├── storage.ts        - Persistence & listeners
//     ├── cloners/          - Deep clone helpers
//     └── updaters/         - State update functions
// ============================================================================

export * from './documentWorkspace/index'
