<template>
  <aside class="sidebar" :class="{ open: sidebarOpen }">
    <div class="sidebar-header">
      <h2>💬 对话列表</h2>
      <div class="new-chat-wrap">
        <ToolbarButton @click="$emit('create-new-chat')">+ 新对话</ToolbarButton>
      </div>
    </div>

    <SidebarSearch
      :model-value="sessionSearch"
      placeholder="搜索会话..."
      @update:model-value="$emit('update:sessionSearch', $event)"
    />

    <SessionList
      :sessions="sessions"
      :current-session-id="currentSessionId"
      :session-menu-id="sessionMenuId"
      @switch-session="$emit('switch-session', $event)"
      @show-menu="$emit('show-menu', $event)"
      @rename-session="$emit('rename-session', $event)"
      @toggle-pin="$emit('toggle-pin', $event)"
      @delete-session="$emit('delete-session', $event)"
      @start-long-press="$emit('start-long-press', $event)"
      @clear-long-press="$emit('clear-long-press')"
    />
  </aside>
</template>

<script setup>
import ToolbarButton from './ToolbarButton.vue'
import SidebarSearch from './SidebarSearch.vue'
import SessionList from './SessionList.vue'

defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false
  },
  sessions: {
    type: Array,
    required: true
  },
  currentSessionId: {
    type: String,
    default: ''
  },
  sessionMenuId: {
    type: String,
    default: ''
  },
  sessionSearch: {
    type: String,
    default: ''
  }
})

defineEmits([
  'create-new-chat',
  'update:sessionSearch',
  'switch-session',
  'show-menu',
  'rename-session',
  'toggle-pin',
  'delete-session',
  'start-long-press',
  'clear-long-press'
])
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: #f7f7f8;
  border-right: 1px solid #d6cfc7;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 10;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px 16px 12px;
}

.sidebar-header h2 {
  color: #4a4540;
  font-size: 18px;
  margin-bottom: 12px;
}

.new-chat-wrap {
  width: 100%;
}

.new-chat-wrap :deep(.toolbar-btn) {
  width: 100%;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
