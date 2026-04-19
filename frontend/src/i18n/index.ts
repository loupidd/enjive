/**
 * Lightweight i18n — no heavy library needed for 2 locales.
 * Drop-in replacement structure that can be swapped for vue-i18n
 * later with zero template changes (same t() API).
 *
 * Usage:
 *   import { useI18n } from "@/i18n"
 *   const { t, locale, setLocale } = useI18n()
 *   t("common.save")  → "Save" | "Simpan"
 */
import { ref, computed } from "vue"
import en from "./locales/en"
import id from "./locales/id"

type Locale = "en" | "id"
type Messages = typeof en

// Singleton locale state
const _locale = ref<Locale>(
  (localStorage.getItem("enjive:locale") as Locale) ?? "en"
)

const _messages: Record<Locale, Messages> = { en, id }

function get(obj: any, path: string): string {
  return path.split(".").reduce((o, k) => o?.[k], obj) ?? path
}

export function useI18n() {
  const locale = computed(() => _locale.value)
  const msgs   = computed(() => _messages[_locale.value])

  function t(key: string, vars?: Record<string, string | number>): string {
    let str = get(msgs.value, key)
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v))
      })
    }
    return str
  }

  function setLocale(l: Locale) {
    _locale.value = l
    localStorage.setItem("enjive:locale", l)
    document.documentElement.lang = l
  }

  return { t, locale, setLocale }
}
