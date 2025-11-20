# Nuxt UI Integration Guide

This document explains how Nuxt UI 4.2.0 has been integrated into the Vue 3 CRA Tool project.

## Installation

```bash
npm install @nuxt/ui@latest @iconify/vue --legacy-peer-deps
```

**Note:** The `--legacy-peer-deps` flag is required due to a minor peer dependency conflict with `vue-router` (project uses 4.4.5, Nuxt UI prefers 4.5.0+). This doesn't affect functionality.

## Setup

### 1. Main Entry Point (`web/src/main.ts`)

```typescript
import ui from '@nuxt/ui/vue-plugin'

const app = createApp(App)
app.use(ui)
```

### 2. Vite Configuration (`web/vite.config.ts`)

```typescript
import ui from '@nuxt/ui/vite'

export default defineConfig({
  plugins: [
    vue(),
    ui({
      // Nuxt UI configuration
      icons: {
        chevronDown: 'i-lucide-chevron-down',
        folder: 'i-lucide-folder',
        folderOpen: 'i-lucide-folder-open',
      }
    })
  ]
})
```

## Using the Tree Component

### Basic Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { TreeItem } from '@nuxt/ui'

const items = ref<TreeItem[]>([
  {
    label: 'Documents/',
    defaultExpanded: true,
    children: [
      { label: 'file1.pdf', icon: 'i-lucide-file' },
      { label: 'file2.pdf', icon: 'i-lucide-file' }
    ]
  }
])
</script>

<template>
  <UTree :items="items" />
</template>
```

### TreeItem Interface

```typescript
interface TreeItem {
  label?: string                    // Display text
  icon?: string                     // Leading icon (Iconify)
  trailingIcon?: string            // Trailing icon for parent nodes
  defaultExpanded?: boolean        // Initial expansion state
  disabled?: boolean               // Disable interaction
  slot?: string                    // Custom slot name
  children?: TreeItem[]            // Child nodes
  onToggle?: (e: Event) => void   // Toggle handler
  onSelect?: (e: Event) => void   // Selection handler
  class?: any                      // Custom CSS classes
  ui?: object                      // UI customization
}
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TreeItem[]` | `[]` | Tree data array |
| `modelValue` | `TreeItem \| TreeItem[]` | - | Selected item(s) (v-model) |
| `multiple` | `boolean` | `false` | Allow multiple selection |
| `nested` | `boolean` | `true` | Use nested DOM structure |
| `color` | `string` | `'primary'` | Color theme |
| `size` | `string` | `'md'` | Size (xs, sm, md, lg, xl) |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `expanded` | `string[]` | - | Controlled expansion state |
| `propagateSelect` | `boolean` | `false` | Parent selection affects children |
| `bubbleSelect` | `boolean` | `false` | Child selection affects parents |
| `virtualize` | `boolean \| object` | `false` | Enable virtualization for large lists |

## Component Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@select` | `(e: TreeItemSelectEvent, item: TreeItem)` | Emitted when item is selected |
| `@toggle` | `(e: TreeItemToggleEvent, item: TreeItem)` | Emitted when item is toggled |
| `@update:modelValue` | `TreeItem \| TreeItem[]` | Emitted when selection changes |
| `@update:expanded` | `string[]` | Emitted when expansion changes |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `item-wrapper` | `{ item, index, level, expanded, selected, ... }` | Full item wrapper |
| `item` | `{ item, index, level, expanded, selected, ... }` | Item content |
| `item-leading` | `{ item, index, level, expanded, selected, ... }` | Leading content |
| `item-label` | `{ item, index, level, expanded, selected, ... }` | Label content |
| `item-trailing` | `{ item, index, level, expanded, selected, ... }` | Trailing content |

## Advanced Examples

### Multi-Select with Checkboxes

```vue
<script setup lang="ts">
const selected = ref<TreeItem[]>([])
</script>

<template>
  <UTree 
    v-model="selected"
    :items="items"
    :as="{ link: 'div' }"
    multiple
    propagate-select
    bubble-select
    @select="(e: any) => { if (e.detail.originalEvent.type === 'click') e.preventDefault() }"
  >
    <template #item-leading="{ selected, indeterminate, handleSelect }">
      <UCheckbox
        :model-value="indeterminate ? 'indeterminate' : selected"
        tabindex="-1"
        @change="handleSelect"
        @click.stop
      />
    </template>
  </UTree>
</template>
```

### Controlled Expansion

```vue
<script setup lang="ts">
const expanded = ref<string[]>(['folder1/', 'folder2/'])
</script>

<template>
  <UTree 
    v-model:expanded="expanded"
    :items="items"
    :get-key="(item: TreeItem) => item.label"
  />
</template>
```

### Flat View (for Drag & Drop)

```vue
<template>
  <UTree 
    :items="items"
    :nested="false"
  />
</template>
```

### Virtualization for Large Lists

```vue
<template>
  <UTree 
    :items="largeItemsArray"
    virtualize
    class="h-80"
  />
</template>
```

## Icons

Nuxt UI uses [Iconify](https://iconify.design/) for icons. Common icon sets:

- **Lucide:** `i-lucide-folder`, `i-lucide-file`, `i-lucide-chevron-down`
- **VSCode Icons:** `i-vscode-icons-file-type-vue`, `i-vscode-icons-file-type-typescript`
- **Material Design:** `i-material-symbols-folder`, `i-material-symbols-file`

Browse icons at: https://icones.js.org/

## Demo Page

Visit `/demo/tree` to see interactive examples:

1. **Basic File Tree** - Hierarchical file/folder structure
2. **Organization Tree** - Custom size and color
3. **Multi-Select with Checkboxes** - Checkbox integration
4. **Controlled Expansion** - Programmatic expand/collapse
5. **Flat View** - Non-nested display

## Available Components

While this integration focuses on the Tree component, Nuxt UI provides 100+ components:

- **Forms:** Input, Select, Checkbox, Radio, Textarea, etc.
- **Data Display:** Table, Card, Badge, Avatar, etc.
- **Navigation:** Breadcrumb, Tabs, Pagination, etc.
- **Overlays:** Modal, Drawer, Popover, Tooltip, etc.
- **Feedback:** Toast, Alert, Progress, etc.

Explore: https://ui.nuxt.com/docs/components

## TypeScript Support

Full TypeScript support is included. Import types:

```typescript
import type { 
  TreeItem, 
  TreeItemSelectEvent, 
  TreeItemToggleEvent 
} from '@nuxt/ui'
```

## Styling

Nuxt UI uses Tailwind CSS under the hood. You can customize:

1. **Via Props:** `color`, `size`, `ui`
2. **Via Config:** Configure in `vite.config.ts` under `ui` options
3. **Via CSS Variables:** Override CSS custom properties

## Compatibility

- ✅ Vue 3.x
- ✅ TypeScript
- ✅ Vite
- ✅ Works alongside PrimeVue (both UI libraries coexist)
- ⚠️ Requires `vue-router` 4.4.5+ (minor peer dep warning, but functional)

## Next Steps

1. Visit `/demo/tree` to see examples
2. Read the full docs: https://ui.nuxt.com/docs/components/tree
3. Explore other Nuxt UI components as needed
4. Consider using Nuxt UI for new UI components (modern, well-maintained, great DX)

## Troubleshooting

**Issue:** Component not rendering
- Check that `app.use(ui)` is called in `main.ts`
- Verify Vite plugin is loaded in `vite.config.ts`

**Issue:** Icons not showing
- Icons are loaded dynamically from Iconify CDN
- Use correct icon syntax: `i-{collection}-{icon-name}`
- Check network tab for icon loading

**Issue:** TypeScript errors
- Ensure `@nuxt/ui` types are recognized
- Add to `tsconfig.json` if needed: `"types": ["@nuxt/ui"]`

## Resources

- **Nuxt UI Docs:** https://ui.nuxt.com
- **Tree Component:** https://ui.nuxt.com/docs/components/tree
- **Iconify:** https://iconify.design
- **GitHub:** https://github.com/nuxt/ui
