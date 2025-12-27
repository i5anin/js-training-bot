import { computed, ref, watchEffect } from 'vue'

const STORAGE_KEY = 'themeMode'

export function useThemeMode() {
    const mode = ref(getInitialMode())

    const isDark = computed(() => mode.value === 'dark')

    watchEffect(() => {
        document.documentElement.classList.toggle('dark', isDark.value)
        localStorage.setItem(STORAGE_KEY, mode.value)
    })

    const toggle = () => {
        mode.value = isDark.value ? 'light' : 'dark'
    }

    return { mode, isDark, toggle }
}

function getInitialMode() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    return prefersDark ? 'dark' : 'light'
}
