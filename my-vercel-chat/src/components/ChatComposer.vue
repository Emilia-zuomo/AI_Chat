<template>
  <div class="input-area">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      placeholder="输入你的问题..."
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.enter.exact.prevent="$emit('send')"
      @keydown.enter.shift.prevent="handleShiftEnter"
      rows="1"
    ></textarea>

    <ToolbarButton
      class="send-btn"
      variant="primary"
      @click="$emit('send')"
      :disabled="disabled"
    >
      {{ sendLabel }}
    </ToolbarButton>
  </div>
  <p class="hint">Enter 发送 · Shift+Enter 换行</p>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import ToolbarButton from './ToolbarButton.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  sendLabel: {
    type: String,
    default: '发送'
  }
})

const emit = defineEmits(['update:modelValue', 'send'])
const textareaRef = ref(null)

const handleShiftEnter = (event) => {
  event.preventDefault()

  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const nextValue = `${props.modelValue.slice(0, start)}\n${props.modelValue.slice(end)}`

  emit('update:modelValue', nextValue)

  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 1
  })
}
</script>

<style scoped>
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
  height: fit-content;
}

.hint {
  text-align: center;
  font-size: 11px;
  color: #b8b0a6;
  padding: 4px 0 12px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .input-area {
    padding: 12px 16px 6px;
  }
}
</style>
