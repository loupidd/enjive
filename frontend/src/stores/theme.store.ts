import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref<boolean>(localStorage.getItem('enjive:theme') !== 'light')

  // Apply on init
  applyTheme(isDark.value)

  function applyTheme(dark: boolean) {
    const html = document.documentElement
    if (dark) { html.classList.add('dark'); html.classList.remove('light') }
    else       { html.classList.remove('dark'); html.classList.add('light') }
    localStorage.setItem('enjive:theme', dark ? 'dark' : 'light')
  }

  function toggle() {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
  }

  return { isDark, toggle }
})
