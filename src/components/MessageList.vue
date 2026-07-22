<template>
  <div class="messages-container" ref="messagesRef">
    <div
      v-for="(msg, idx) in messages"
      :key="`${msg.role}-${idx}-${msg.content.length}`"
      class="message"
      :class="msg.role"
    >
      <div class="avatar">{{ msg.role === 'user' ? '🧑' : '🤖' }}</div>
      <div class="bubble">
        <div
          v-if="msg.role === 'assistant'"
          class="markdown-body"
          v-html="parseMarkdown(msg.content)"
        ></div>
        <div v-else>{{ msg.content }}</div>
        <span
          v-if="loading && idx === messages.length - 1 && msg.role === 'assistant'"
          class="cursor"
        >▊</span>
      </div>
    </div>

    <div v-if="loading" class="stream-status">
      <span class="stream-dot"></span>
      AI 正在生成...
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

marked.setOptions({
  breaks: true,
  gfm: true
})

const messagesRef = ref(null)
let pendingScrollFrame = 0

const parseMarkdown = (content) => {
  if (!content) return ''
  return marked.parse(content)
}

const scrollToBottom = (smooth = true) => {
  const container = messagesRef.value
  if (!container) return

  if (pendingScrollFrame) {
    cancelAnimationFrame(pendingScrollFrame)
  }

  pendingScrollFrame = window.requestAnimationFrame(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
  })
}

watch(
  () => props.messages,
  () => {
    if (props.loading) {
      nextTick(() => scrollToBottom(true))
    }
  },
  { deep: true, flush: 'post' }
)

watch(
  () => props.loading,
  (isLoading) => {
    if (isLoading) {
      nextTick(() => scrollToBottom(true))
    }
  },
  { flush: 'post' }
)

defineExpose({ scrollToBottom })
</script>

<style scoped>
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

.cursor {
  display: inline-block;
  color: #8c7b6b;
  font-weight: 700;
  animation: blink 1s steps(1, end) infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  50.1%, 100% { opacity: 0; }
}

.stream-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 48px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f7f7f8;
  color: #8c7b6b;
  font-size: 12px;
  border: 1px solid rgba(214, 207, 199, 0.5);
  width: fit-content;
}

.stream-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8c7b6b;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.5; }
}

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
</style>
