<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'

const editor = useEditor({
  content: '<p>Start typing...</p>',
  extensions: [
    StarterKit,
    Highlight,
    Typography,
  ],
  editorProps: {
    attributes: {
      class: 'prose dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none'
    }
  }
})

// Clean up
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Tiptap Editor Demo</h1>
    
    <div class="border rounded-lg overflow-hidden dark:border-gray-700" v-if="editor">
      <!-- Toolbar -->
      <div class="bg-gray-100 dark:bg-gray-800 p-2 flex flex-wrap gap-1 border-b dark:border-gray-700">
        <UButton 
          icon="i-heroicons-bold" 
          color="gray" 
          variant="ghost" 
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()" 
        />
        <UButton 
          icon="i-heroicons-italic" 
          color="gray" 
          variant="ghost" 
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()" 
        />
        <UButton 
          icon="i-heroicons-strikethrough" 
          color="gray" 
          variant="ghost" 
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()" 
        />
        
        <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        
        <UButton 
          icon="i-heroicons-h1" 
          color="gray" 
          variant="ghost" 
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 1 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" 
        />
        <UButton 
          icon="i-heroicons-h2" 
          color="gray" 
          variant="ghost" 
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" 
        />
        
        <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <UButton 
          icon="i-heroicons-list-bullet" 
          color="gray" 
          variant="ghost" 
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()" 
        />
        <UButton 
          icon="i-heroicons-numbered-list" 
          color="gray" 
          variant="ghost" 
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()" 
        />
        
        <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        
        <UButton 
          icon="i-heroicons-arrow-uturn-left" 
          color="gray" 
          variant="ghost" 
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().chain().focus().undo().run()"
        />
        <UButton 
          icon="i-heroicons-arrow-uturn-right" 
          color="gray" 
          variant="ghost" 
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().chain().focus().redo().run()"
        />
      </div>

      <!-- Editor Content -->
      <editor-content :editor="editor" />
    </div>

    <div class="mt-4" v-if="editor">
      <h2 class="text-lg font-semibold mb-2">HTML Output:</h2>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">{{ editor.getHTML() }}</pre>
    </div>
  </div>
</template>
