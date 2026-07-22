<template>
  <header class="chat-header">
    <button class="menu-btn" @click="$emit('toggle-sidebar')">☰</button>
    <div class="chat-title-wrap">
      <h1>{{ title }}</h1>
      <p class="subtitle">温暖 · 专注 · 极简</p>
    </div>

    <div class="header-actions">
      <ToolbarButton @click="$emit('export-markdown')">导出 Markdown</ToolbarButton>
      <ToolbarButton @click="$emit('export-pdf')">导出 PDF</ToolbarButton>
      <ToolbarButton @click="$emit('copy-share-link')">分享链接</ToolbarButton>
    </div>
  </header>
</template>

<script setup>
import ToolbarButton from './ToolbarButton.vue'

defineProps({
  title: {
    type: String,
    default: 'AI 助手'
  }
})

defineEmits([
  'toggle-sidebar',
  'export-markdown',
  'export-pdf',
  'copy-share-link'
])
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #d6cfc7;
  flex-shrink: 0;
}

.chat-title-wrap {
  flex: 1;
}

.menu-btn {
  display: none;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #4a4540;
}

.chat-header h1 {
  color: #4a4540;
  font-size: 18px;
}

.subtitle {
  color: #a89f95;
  font-size: 12px;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .chat-header {
    flex-wrap: wrap;
    padding: 14px 16px;
  }

  .menu-btn {
    display: block;
  }

  .header-actions {
    width: 100%;
  }
}
</style>
