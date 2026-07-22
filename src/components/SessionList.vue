<template>
  <div class="session-list">
    <div
      v-for="session in sessions"
      :key="session.id"
      class="session-item"
      :class="{ active: currentSessionId === session.id }"
      @click="$emit('switch-session', session.id)"
      @contextmenu.prevent="$emit('show-menu', session.id)"
      @touchstart="$emit('start-long-press', session.id)"
      @touchend="$emit('clear-long-press')"
      @touchmove="$emit('clear-long-press')"
    >
      <div class="session-main">
        <span class="session-title">{{ session.title }}</span>
        <span class="session-actions">
          <span v-if="session.pinned" class="pin-badge">置顶</span>
          <button
            class="delete-session-btn"
            title="删除会话"
            @click.stop="$emit('delete-session', session.id)"
          >
            🗑️
          </button>
        </span>
      </div>

      <div v-if="sessionMenuId === session.id" class="session-menu" @click.stop>
        <button @click="$emit('rename-session', session.id)">重命名</button>
        <button @click="$emit('toggle-pin', session.id)">{{ session.pinned ? '取消置顶' : '置顶' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
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
  }
})

defineEmits([
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
.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
  position: relative;
  padding: 12px 14px;
  border-radius: 8px;
  color: #5c5650;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-item:hover {
  background: rgba(214, 207, 199, 0.2);
}

.session-item.active {
  background: #d6cfc7;
  color: #fff;
  font-weight: 600;
}

.session-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.session-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.pin-badge {
  background: #8c7b6b;
  color: #fff;
  border-radius: 999px;
  padding: 2px 6px;
  font-size: 10px;
}

.delete-session-btn {
  border: none;
  background: transparent;
  color: #8c7b6b;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 2px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.session-item:hover .delete-session-btn,
.session-item.active .delete-session-btn {
  opacity: 1;
  pointer-events: auto;
}

.session-item.active .delete-session-btn {
  color: #fff;
}

.session-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #d6cfc7;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(51, 51, 51, 0.08);
  z-index: 12;
  display: flex;
  flex-direction: column;
  min-width: 110px;
}

.session-menu button {
  border: none;
  background: transparent;
  text-align: left;
  padding: 8px 10px;
  cursor: pointer;
  color: #5c5650;
}

.session-menu button:hover {
  background: #f7f7f8;
}
</style>
