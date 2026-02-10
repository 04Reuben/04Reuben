import { ref, watch } from 'vue'

/**
 * A simple debounce function.
 * @param {Function} fn The function to debounce.
 * @param {number} delay The debounce delay.
 * @returns {Function} The debounced function.
 */
function debounce(fn, delay = 300) {
  let timeoutId = null
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * A composable for handling form drafts saved to localStorage.
 * @param {string} storageKey The key for localStorage.
 * @param {import('vue').Ref | object} formState The reactive form state to watch.
 * @param {object} options Optional settings.
 * @param {number} options.debounceMs Debounce delay for auto-saving.
 */
export function useDraftForm(storageKey, formState, { debounceMs = 800 } = {}) {
  const draftExists = ref(false)

  // Check for existing draft on init
  if (localStorage.getItem(storageKey)) {
    draftExists.value = true
  }

  const saveDraft = debounce(() => {
    try {
      // For reactive objects, we can directly stringify.
      // For refs, we need to access .value
      const dataToSave = formState.value ? formState.value : formState
      localStorage.setItem(storageKey, JSON.stringify(dataToSave))
      draftExists.value = true
    } catch (e) {
      console.error('Failed to save draft:', e)
    }
  }, debounceMs)

  // Watch for changes in the form state and save them
  watch(formState, saveDraft, { deep: true })

  /**
   * Loads the draft from localStorage.
   * @returns {object | null} The parsed draft data or null if not found/invalid.
   */
  function loadDraft() {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch (e) {
      console.error('Failed to parse draft:', e)
      return null
    }
  }

  /**
   * Clears the draft from localStorage.
   */
  function clearDraft() {
    localStorage.removeItem(storageKey)
    draftExists.value = false
  }

  return {
    draftExists,
    loadDraft,
    clearDraft,
  }
}
