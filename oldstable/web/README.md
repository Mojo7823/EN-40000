# CRA Tool - Nuxt 3 Migration

This is the Nuxt 3 version of the CRA Tool webapp, migrated from the original Vue 3 + Vite application.

## Tech Stack

- **Nuxt 3** (v3.14.159) - Full-stack Vue framework
- **Nuxt UI 4.2.0** - UI component library
- **Vue 3.5+** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **TipTap** - Rich text editor
- **Pinia** - State management (auto-imported in Nuxt)
- **docx-preview** - DOCX file preview

## Project Structure

```
web/
├── app.vue                 # Root application component
├── nuxt.config.ts         # Nuxt configuration
├── assets/
│   └── css/
│       └── main.css       # Global styles with theme variables
├── components/            # Auto-imported components
│   ├── Sidebar.vue
│   ├── RichTextEditor.vue
│   ├── XMLTreeNode.vue
│   └── settings/
├── composables/           # Auto-imported composables
│   └── useApi.ts         # API helper
├── pages/                # File-based routing
│   ├── index.vue         # Dashboard (/)
│   ├── demo/
│   ├── document/
│   ├── product-overview/
│   ├── conformance/
│   ├── convention/
│   ├── risk/
│   └── pcontext/
├── services/             # Business logic services
│   ├── api.ts
│   ├── demoStorage.ts
│   ├── documentWorkspace.ts
│   └── sessionService.ts
├── utils/                # Utility functions
├── constants/            # Constants and configurations
├── data/                 # Sample data
└── types/                # TypeScript type definitions
```

## Key Differences from Vue/Vite Version

1. **File-based Routing**: Pages use Nuxt's automatic routing instead of Vue Router
2. **Auto-imports**: Components, composables, and utilities are auto-imported
3. **NuxtLink**: Uses `<NuxtLink>` instead of `<RouterLink>`
4. **NuxtPage**: Uses `<NuxtPage>` instead of `<router-view>`
5. **API Composable**: Uses `useApi()` composable with `$fetch` instead of axios
6. **Runtime Config**: Uses `useRuntimeConfig()` for environment variables
7. **Server Proxy**: Backend API proxied through Nitro server

## Setup

1. **Install dependencies:**
   ```bash
   cd web
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Start backend server** (from project root):
   ```bash
   cd server
   python run.py
   ```

4. **Start Nuxt development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm test:e2e` - Run Playwright E2E tests

## API Proxy

The Nuxt dev server proxies `/api/*` requests to the backend at `http://127.0.0.1:8000`. This is configured in `nuxt.config.ts`:

```typescript
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

## Routing

Nuxt uses file-based routing. Here's the mapping:

| Route | File |
|-------|------|
| `/` | `pages/index.vue` |
| `/document/cover` | `pages/document/cover.vue` |
| `/document/introduction` | `pages/document/introduction.vue` |
| `/product-overview/description` | `pages/product-overview/description.vue` |
| `/conformance/standards` | `pages/conformance/standards.vue` |
| `/demo/modal` | `pages/demo/modal.vue` |
| etc. | etc. |

## Components

All components in the `components/` folder are auto-imported. No need to manually import them in pages.

## Composables

The `useApi()` composable provides API methods:

```typescript
const api = useApi()

// GET request
const data = await api.get('/components')

// POST request
const result = await api.post('/components', { name: 'Test' })

// PUT request
await api.put('/components/1', { name: 'Updated' })

// DELETE request
await api.delete('/components/1')
```

## Theme

The application supports light/dark theme switching. Theme state is stored in localStorage and applied via CSS classes on the root element:

- Light theme: `.theme-light`
- Dark theme: `.theme-dark`

All theme colors are defined as CSS custom properties in `assets/css/main.css`.

## Migration Status

✅ **Completed:**
- Core Nuxt setup with Nuxt UI 4.2.0
- All components migrated
- All pages migrated and renamed for Nuxt routing
- Services and utilities copied
- Theme system working
- Sidebar navigation updated to use NuxtLink
- API composable created
- Global styles migrated

🔄 **To Update:**
- Page components may need to update imports (from relative to auto-imports)
- Replace `axios` calls with `useApi()` composable
- Update any `RouterLink` references to `NuxtLink` in page components
- Test all routes and functionality

## Notes

- The original Vue/Vite app has been replaced by this Nuxt version
- Backend server must be running on port 8000
- All TipTap editor functionality is preserved
- DOCX preview functionality is preserved
- All demo pages are accessible

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module not found errors:**
- Run `npm install` again
- Delete `node_modules` and `.nuxt` folders, then reinstall

**API connection errors:**
- Ensure backend is running on port 8000
- Check `.env` file has correct API base URL

## Next Steps

1. Test all pages and routes
2. Update page components to use Nuxt patterns
3. Replace remaining `axios` calls with `useApi()`
4. Add Nuxt UI components where appropriate
5. Optimize for production build
