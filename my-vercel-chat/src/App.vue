<template>
  <div class="chat-wrapper">
    <ChatSidebar
      :sidebar-open="sidebarOpen"
      :sessions="filteredSessions"
      :current-session-id="currentSessionId"
      :session-menu-id="sessionMenuId"
      :session-search="sessionSearch"
      @update:session-search="sessionSearch = $event"
      @create-new-chat="createNewChat"
      @switch-session="switchSession"
      @show-menu="showSessionMenu"
      @rename-session="renameSession"
      @toggle-pin="togglePin"
      @delete-session="deleteSession"
      @start-long-press="startLongPress"
      @clear-long-press="clearLongPress"
    />

    <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false"></div>

    <main class="chat-main">
      <ChatHeader
        :title="activeSession?.title || 'AI 助手'"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
        @export-markdown="exportMarkdown"
        @export-pdf="exportPdf"
        @copy-share-link="copyShareLink"
      />

      <MessageList ref="messageListRef" :messages="messages" :loading="loading" />

      <ChatComposer
        v-model="inputText"
        :disabled="!inputText.trim() || loading || readonlyMode"
        :send-label="readonlyMode ? '只读模式' : '发送'"
        @send="sendMessage"
      />
    </main>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatHeader from './components/ChatHeader.vue'
import MessageList from './components/MessageList.vue'
import ChatComposer from './components/ChatComposer.vue'
import { useChatApp } from './composables/useChatApp'

const messageListRef = ref(null)

const {
  sidebarOpen,
  currentSessionId,
  inputText,
  loading,
  sessionSearch,
  sessionMenuId,
  readonlyMode,
  activeSession,
  filteredSessions,
  messages,
  createNewChat,
  switchSession,
  showSessionMenu,
  startLongPress,
  clearLongPress,
  renameSession,
  togglePin,
  deleteSession,
  exportMarkdown,
  exportPdf,
  copyShareLink,
  sendMessage,
  insertNewLine
} = useChatApp({
  scrollToBottom: (smooth = true) => {
    nextTick(() => {
      messageListRef.value?.scrollToBottom?.(smooth)
    })
  }
})

</script>

<style scoped>
/* ===== 全局重置 ===== */
* { margin: 0; padding: 0; box-sizing: border-box; }

:deep(.toolbar-btn) {
  font-family: inherit;
}

.chat-wrapper {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ===== 侧边栏 ===== */
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

.new-chat-btn {
  width: 100%;
  border: 1px solid #d6cfc7;
  background: transparent;
  color: #8c7b6b;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-chat-btn:hover {
  background: #d6cfc7;
  color: #fff;
}

.sidebar-search {
  padding: 0 12px 10px;
}

.search-input {
  width: 100%;
  border: 1px solid #d6cfc7;
  background: transparent;
  color: #8c7b6b;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #8c7b6b;
  background: #ffffff;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
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

/* ===== 主聊天区 ===== */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

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

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  border: 1px solid #d6cfc7;
  background: transparent;
  color: #8c7b6b;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #d6cfc7;
  color: #fff;
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

/* ===== 消息列表 ===== */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f7f7f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  border: 1px solid #d6cfc7;
}

.bubble {
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.user .bubble {
  background: #d6cfc7;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.assistant .bubble {
  background: #f7f7f8;
  color: #333;
  border: 1px solid rgba(214, 207, 199, 0.3);
  border-bottom-left-radius: 4px;
}

.typing {
  color: #a89f95;
  font-style: italic;
}

/* ===== 输入区 ===== */
.input-area {
  padding: 16px 24px 8px;
  border-top: 1px solid #d6cfc7;
  background: #ffffff;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-shrink: 0;
}

.input-area textarea {
  flex: 1;
  border: 1px solid #d6cfc7;
  background: #fafaf9;
  color: #333;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  max-height: 120px;
  transition: border-color 0.2s;
}

.input-area textarea:focus {
  border-color: #8c7b6b;
}

.send-btn {
  background: #8c7b6b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  height: fit-content;
}

.send-btn:hover:not(:disabled) {
  background: #7a6a5b;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint {
  text-align: center;
  font-size: 11px;
  color: #b8b0a6;
  padding: 4px 0 12px;
  flex-shrink: 0;
}

/* ===== 代码块样式 ===== */
.markdown-body :deep(pre) {
  position: relative;
  margin: 12px 0 !important;
  padding: 40px 16px 16px !important;
  background: #282c34 !important;
  border-radius: 10px !important;
  border: 1px solid #d6cfc7 !important;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  color: #abb2bf !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace !important;
  font-size: 13px !important;
  line-height: 1.6 !important;
  background: transparent !important;
  padding: 0 !important;
}

.markdown-body :deep(code:not(pre code)) {
  background: rgba(214, 207, 199, 0.25);
  color: #6b5d50;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.code-header {
  position: absolute;
  top: 0; left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: transparent !important;
  border: none !important;
}

.code-lang {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'JetBrains Mono', monospace;
  user-select: none;
}

.code-copy-btn {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.code-copy-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* ===== 滚动条美化 ===== */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: #d6cfc7; border-radius: 3px; }
::-webkit-scrollbar-track { background: transparent; }

/* ===== 移动端适配 ===== */
.overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 5;
  }
  .menu-btn {
    display: block;
  }
  .message {
    max-width: 90%;
  }
  .chat-header {
    padding: 14px 16px;
  }
  .messages-container {
    padding: 16px;
  }
  .input-area {
    padding: 12px 16px 6px;
  }
}
</style>