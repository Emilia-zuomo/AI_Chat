<template>
  <div class="sidebar-search">
    <input
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      class="search-input"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '搜索会话...'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
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
</style>
