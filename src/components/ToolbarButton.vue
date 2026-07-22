<template>
  <button
    class="toolbar-btn"
    :class="variant"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'secondary'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.toolbar-btn {
  border: 1px solid #d6cfc7;
  background: transparent;
  color: #8c7b6b;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toolbar-btn:hover:not(:disabled) {
  background: #d6cfc7;
  color: #fff;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.primary {
  background: #8c7b6b;
  color: #fff;
}

.toolbar-btn.primary:hover:not(:disabled) {
  background: #7a6a5b;
}
</style>
