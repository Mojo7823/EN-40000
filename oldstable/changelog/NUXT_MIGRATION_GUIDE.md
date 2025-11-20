# CRA Tool - Nuxt 3 Migration Guide

## Overview

This document outlines the migration from Vue 3 + Vite (`web/`) to Nuxt 3 (`web-nuxt/`).

## Migration Checklist

### ✅ Completed

1. **Project Setup**
   - [x] Created `nuxt.config.ts` with Nuxt UI 4.2.0
   - [x] Created `package.json` with all dependencies
   - [x] Created `tsconfig.json` for TypeScript
   - [x] Created `.gitignore` and `.env.example`

2. **Root Application**
   - [x] Migrated `App.vue` to `app.vue`
   - [x] Replaced `<router-view>` with `<NuxtPage>`
   - [x] Updated theme logic for Nuxt (process.client checks)
   - [x] Updated API calls to use composable

3. **Styles**
   - [x] Migrated `style.css` to `assets/css/main.css`
   - [x] Migrated `App.css` styles into main.css
   - [x] All CSS custom properties preserved
   - [x] Theme switching preserved

4. **Components**
   - [x] Copied all components from `web/src/components/` to `web-nuxt/components/`
   - [x] Updated `Sidebar.vue` to use `NuxtLink` instead of `RouterLink`
   - [x] Preserved all component styles (scoped CSS)
   - [x] Components are now auto-imported

5. **Pages/Routing**
   - [x] Migrated all views to pages with Nuxt naming convention:
     - `Dashboard.vue` → `pages/index.vue`
     - `CoverPage.vue` → `pages/document/cover.vue`
     - `DocumentInformation.vue` → `pages/document/introduction.vue`
     - etc.
   - [x] All routes follow Nuxt file-based routing

6. **Services & Utils**
   - [x] Copied all services to `web-nuxt/services/`
   - [x] Copied all utils to `web-nuxt/utils/`
   - [x] Created `useApi()` composable for API calls
   - [x] Preserved all business logic

7. **Data & Types**
   - [x] Copied constants, data, and types
   - [x] All TypeScript definitions preserved

8. **Scripts**
   - [x] Created `nuxt_dev_start.sh` for starting servers
   - [x] Created `nuxt_dev_stop.sh` for stopping servers

### 🔄 Needs Testing/Updates

1. **Page Components**
   - [ ] Update all page components to replace imports with Nuxt auto-imports
   - [ ] Replace any `RouterLink` with `NuxtLink` in page files
   - [ ] Replace `axios` API calls with `useApi()` composable
   - [ ] Test all routes for functionality

2. **API Integration**
   - [ ] Test all API endpoints through Nitro proxy
   - [ ] Verify DOCX preview generation works
   - [ ] Test file uploads (cover images)
   - [ ] Test document workspace save/load

3. **Rich Text Editor**
   - [ ] Test TipTap editor in all pages
   - [ ] Verify image upload and resize works
   - [ ] Test table editing
   - [ ] Verify HTML to DOCX conversion

4. **State Management**
   - [ ] Test Pinia stores (auto-imported in Nuxt)
   - [ ] Verify localStorage persistence works
   - [ ] Test workspace subscriptions

5. **Demo Pages**
   - [ ] Test all demo functionality
   - [ ] Verify modals work correctly
   - [ ] Test storage demo
   - [ ] Test XML viewer

## Key Code Changes Required in Pages

### 1. Replace Axios with useApi()

**Before (Vue/Vite):**
```typescript
import api from '@/services/api'

const { data } = await api.get('/components')
```

**After (Nuxt):**
```typescript
const api = useApi()

const data = await api.get('/components')
```

### 2. Replace RouterLink with NuxtLink

**Before:**
```vue
<RouterLink to="/document/cover">Cover</RouterLink>
```

**After:**
```vue
<NuxtLink to="/document/cover">Cover</NuxtLink>
```

### 3. Use Nuxt Auto-imports

**Before:**
```typescript
import { ref, computed, onMounted } from 'vue'
```

**After:**
```typescript
// No import needed - auto-imported in Nuxt
const myRef = ref('')
const myComputed = computed(() => ...)
```

### 4. Client-side Only Code

**Before:**
```typescript
if (typeof window !== 'undefined') {
  // browser code
}
```

**After:**
```typescript
if (process.client) {
  // browser code
}
```

### 5. Environment Variables

**Before:**
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

**After:**
```typescript
const config = useRuntimeConfig()
const apiUrl = config.public.apiBase
```

## File Structure Comparison

### Vue/Vite Structure
```
web/
├── src/
│   ├── main.ts              # App initialization
│   ├── App.vue              # Root component
│   ├── router/index.ts      # Manual routing
│   ├── components/          # Manual imports
│   ├── views/               # Route components
│   ├── services/
│   └── utils/
├── package.json
└── vite.config.ts
```

### Nuxt 3 Structure
```
web-nuxt/
├── app.vue                  # Root component
├── nuxt.config.ts           # Nuxt config
├── components/              # Auto-imported
├── pages/                   # File-based routing
├── composables/             # Auto-imported
├── services/
├── utils/
├── assets/
└── package.json
```

## Route Mapping

| Old Route (Vue Router) | New Route (Nuxt) | File Path |
|------------------------|------------------|-----------|
| `/` | `/` | `pages/index.vue` |
| `/demo/modal` | `/demo/modal` | `pages/demo/modal.vue` |
| `/demo/table` | `/demo/table` | `pages/demo/table.vue` |
| `/demo/editor` | `/demo/editor` | `pages/demo/editor.vue` |
| `/demo/xml-viewer` | `/demo/xml-viewer` | `pages/demo/xml-viewer.vue` |
| `/demo/docx-preview` | `/demo/docx-preview` | `pages/demo/docx-preview.vue` |
| `/demo/storage` | `/demo/storage` | `pages/demo/storage.vue` |
| `/demo/tree` | `/demo/tree` | `pages/demo/tree.vue` |
| `/document/cover` | `/document/cover` | `pages/document/cover.vue` |
| `/document/introduction` | `/document/introduction` | `pages/document/introduction.vue` |
| `/document/purpose-scope` | `/document/purpose-scope` | `pages/document/purpose-scope.vue` |
| `/document/product-identification` | `/document/product-identification` | `pages/document/product-identification.vue` |
| `/document/manufacturer-information` | `/document/manufacturer-information` | `pages/document/manufacturer-information.vue` |
| `/document/preview` | `/document/preview` | `pages/document/preview.vue` |
| `/document/load-save` | `/document/load-save` | `pages/document/load-save.vue` |
| `/document/evidence` | `/document/evidence` | `pages/document/evidence.vue` |
| `/product-overview/description` | `/product-overview/description` | `pages/product-overview/description.vue` |
| `/product-overview/architecture` | `/product-overview/architecture` | `pages/product-overview/architecture.vue` |
| `/product-overview/third-party-components` | `/product-overview/third-party-components` | `pages/product-overview/third-party-components.vue` |
| `/conformance/standards` | `/conformance/standards` | `pages/conformance/standards.vue` |
| `/conformance/regulatory` | `/conformance/regulatory` | `pages/conformance/regulatory.vue` |
| `/conformance/level` | `/conformance/level` | `pages/conformance/level.vue` |
| `/convention/terminology` | `/convention/terminology` | `pages/convention/terminology.vue` |
| `/convention/notation` | `/convention/notation` | `pages/convention/notation.vue` |
| `/risk/general-approach` | `/risk/general-approach` | `pages/risk/general-approach.vue` |
| `/pcontext/intended-purpose` | `/pcontext/intended-purpose` | `pages/pcontext/intended-purpose.vue` |

## API Proxy Configuration

The Nuxt dev server proxies API requests through Nitro:

```typescript
// nuxt.config.ts
nitro: {
  devProxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      prependPath: true
    }
  }
}
```

This means:
- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`
- API calls: `http://localhost:3000/api/*` → `http://127.0.0.1:8000/*`

## Testing Strategy

1. **Start servers:**
   ```bash
   ./nuxt_dev_start.sh
   ```

2. **Test each route:**
   - Navigate to each page
   - Verify UI renders correctly
   - Test all interactions
   - Check browser console for errors

3. **Test features:**
   - Theme switching (light/dark)
   - Rich text editor (all pages with editor)
   - Document preview/download
   - Cover image upload
   - Workspace save/load
   - All demo pages

4. **Test API integration:**
   - Health check endpoint
   - Component CRUD operations
   - Document generation
   - Preview generation

5. **Check logs:**
   ```bash
   tail -f .devserver/backend.log
   tail -f .devserver/nuxt.log
   ```

## Benefits of Nuxt 3

1. **Auto-imports**: No need to manually import components, composables, or Vue APIs
2. **File-based routing**: No need to maintain router configuration
3. **Better DX**: Improved development experience with hot module replacement
4. **SSR Ready**: Can enable server-side rendering if needed
5. **Nitro Server**: Built-in server with powerful features
6. **Type Safety**: Better TypeScript integration out of the box
7. **Performance**: Optimized build and runtime performance
8. **Future-proof**: Active development and long-term support

## Known Limitations

1. **Client-only libraries**: Some libraries (like docx-preview) only work on client-side
   - Solution: Wrap in `process.client` checks or use `<ClientOnly>` component

2. **Dynamic imports**: May need to update some dynamic imports
   - Solution: Use Nuxt's dynamic import syntax

3. **Third-party plugins**: Some Vue plugins may need Nuxt-specific configuration
   - Solution: Create plugins in `plugins/` folder if needed

## Next Steps

1. Install dependencies: `cd web-nuxt && npm install`
2. Start servers: `./nuxt_dev_start.sh`
3. Test all routes systematically
4. Update page components as needed
5. Fix any TypeScript errors
6. Add E2E tests for critical paths
7. Document any issues found
8. Create production build configuration

## Support

For issues or questions:
1. Check `web-nuxt/README.md`
2. Review Nuxt 3 documentation: https://nuxt.com
3. Review Nuxt UI documentation: https://ui.nuxt.com
4. Check the original Vue/Vite implementation in `web/` for reference
