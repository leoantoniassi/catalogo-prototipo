import { useEffect } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useFocusTrap(containerRef, active = true) {
  useEffect(() => {
    if (!active) {
      return undefined
    }
    const node = containerRef.current
    if (!node) {
      return undefined
    }

    const previousActiveElement = document.activeElement
    const focusables = Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (element) => element.getAttribute('aria-hidden') !== 'true',
    )

    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      node.focus()
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') {
        return
      }
      const items = Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (element) => element.getAttribute('aria-hidden') !== 'true',
      )
      if (items.length === 0) {
        event.preventDefault()
        node.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', handleKeyDown)
    return () => {
      node.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus()
      }
    }
  }, [active, containerRef])
}
