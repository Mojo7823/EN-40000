<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        WYSIWYG Editor Demo
      </h1>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Rich Text Editor (TipTap)
        </h2>
        
        <div class="mb-6">
          <ClientOnly fallback-tag="div">
            <RichTextEditor
              v-model="content"
              placeholder="Start typing here..."
              min-height="300px"
            />
          </ClientOnly>
        </div>

        <div class="border-t pt-4 mt-6">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            HTML Output:
          </h3>
          <pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm text-gray-800 dark:text-gray-200">{{ content }}</pre>
        </div>

        <div class="mt-6">
          <UButton @click="clearContent" color="red" variant="soft">
            Clear Content
          </UButton>
          <UButton @click="loadSample" color="primary" variant="soft" class="ml-2">
            Load Sample
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const STORAGE_KEY = 'wysiwyg_demo_content'

// Load content from localStorage on mount
const content = ref('<p>Start typing here...</p>')

onMounted(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      content.value = saved
    }
  }
})

// Watch for content changes and save to localStorage
watch(content, (newContent) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, newContent)
  }
})

function clearContent() {
  content.value = ''
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function loadSample() {
  content.value = `
<h1>Sample Document</h1>
<p>This is a <strong>sample document</strong> with <em>rich formatting</em>.</p>
<h2>Features Include:</h2>
<ul>
  <li>Text formatting (bold, italic, underline, strike)</li>
  <li>Headings (H1-H4)</li>
  <li>Lists (bullet, ordered, task)</li>
  <li>Text alignment and colors</li>
  <li>Tables with resizing</li>
  <li>Image support</li>
</ul>
<h3>Code Example:</h3>
<p><code>const example = "Hello World";</code></p>
<p style="text-align: center">This text is centered</p>
<p><span style="color: #ef4444">Red text</span> and <span style="color: #3b82f6">blue text</span></p>
  `.trim()
}
</script>
