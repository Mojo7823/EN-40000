# 🌲 Nuxt UI Tree Component - Quick Reference

## 🚀 Quick Start

```bash
# Start servers
./dev_start.sh

# Visit demo
http://127.0.0.1:5173/demo/tree
```

## 💻 Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { TreeItem } from '@nuxt/ui'

const items = ref<TreeItem[]>([
  {
    label: 'Folder',
    defaultExpanded: true,
    children: [
      { label: 'File.txt', icon: 'i-lucide-file' }
    ]
  }
])
</script>

<template>
  <UTree :items="items" />
</template>
```

## 📋 Common Props

```vue
<UTree 
  :items="items"
  v-model="selected"
  multiple
  color="primary"
  size="md"
  :nested="true"
  :disabled="false"
/>
```

## 🎨 Popular Icons

```typescript
icon: 'i-lucide-folder'        // Folder
icon: 'i-lucide-folder-open'   // Open folder
icon: 'i-lucide-file'          // File
icon: 'i-lucide-file-text'     // Text file
icon: 'i-lucide-image'         // Image file
icon: 'i-vscode-icons-file-type-vue'        // Vue file
icon: 'i-vscode-icons-file-type-typescript' // TS file
icon: 'i-vscode-icons-file-type-python'     // Python file
```

**Find more:** https://icones.js.org/

## 🎯 Events

```vue
<UTree 
  @select="(e, item) => console.log('Selected:', item)"
  @toggle="(e, item) => console.log('Toggled:', item)"
/>
```

## 📦 TreeItem Interface

```typescript
interface TreeItem {
  label?: string
  icon?: string
  trailingIcon?: string
  defaultExpanded?: boolean
  disabled?: boolean
  children?: TreeItem[]
  onToggle?: (e: Event) => void
  onSelect?: (e: Event) => void
}
```

## ✅ Multi-Select Template

```vue
<UTree 
  v-model="selected"
  :items="items"
  :as="{ link: 'div' }"
  multiple
  propagate-select
  bubble-select
>
  <template #item-leading="{ selected, indeterminate, handleSelect }">
    <UCheckbox
      :model-value="indeterminate ? 'indeterminate' : selected"
      @change="handleSelect"
    />
  </template>
</UTree>
```

## 🔧 Controlled Expansion

```vue
<script setup>
const expanded = ref(['folder1/', 'folder2/'])
</script>

<template>
  <UTree 
    v-model:expanded="expanded"
    :items="items"
    :get-key="item => item.label"
  />
</template>
```

## 📖 Documentation

- **Demo:** `/demo/tree`
- **Guide:** `web/NUXT_UI_INTEGRATION.md`
- **Full Summary:** `NUXT_UI_COMPLETE_INTEGRATION_SUMMARY.md`
- **Official Docs:** https://ui.nuxt.com/docs/components/tree

## 🐛 Troubleshooting

**dev_start.sh fails?**
- Already fixed with `--legacy-peer-deps`
- Or: `cd web && npm install --legacy-peer-deps`

**Icons not showing?**
- Check network (loads from CDN)
- Use correct format: `i-{collection}-{icon}`

**Component not rendering?**
- Restart dev server
- Clear cache: `rm -rf web/node_modules/.vite`

## 📞 Help

- Issues? Check `NUXT_UI_COMPLETE_INTEGRATION_SUMMARY.md`
- Docs: https://ui.nuxt.com
- Icons: https://icones.js.org/

---

**Ready to use!** 🎉 Just import the `TreeItem` type and use `<UTree>`.
