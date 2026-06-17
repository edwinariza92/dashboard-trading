import { useEffect, useRef, useState } from 'react'

type Size = { width: number; height: number }

export default function useSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const logIfZero = (w: number, h: number) => {
      if (w <= 0 || h <= 0) {
        try {
          const cs = window.getComputedStyle(el)
          const parents: Array<{ tag: string; id: string; classes: string; width: number; height: number; display: string; visibility: string }>
            = []
          let p: Element | null = el
          while (p && p.parentElement) {
            const pe = p.parentElement
            const style = window.getComputedStyle(pe)
            const rect = pe.getBoundingClientRect()
            parents.push({
              tag: pe.tagName.toLowerCase(),
              id: pe.id || '',
              classes: pe.className ? String(pe.className) : '',
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              display: style.display,
              visibility: style.visibility,
            })
            p = p.parentElement
          }
          // eslint-disable-next-line no-console
          console.warn('[useSize] container has non-positive size — measured', { width: w, height: h, computedStyle: { display: cs.display, height: cs.height, visibility: cs.visibility }, parentChain: parents })
          try {
            // eslint-disable-next-line no-console
            console.warn('[useSize-json]', JSON.stringify({ width: w, height: h, computedStyle: { display: cs.display, height: cs.height, visibility: cs.visibility }, parentChain: parents }))
          } catch (e) {
            // ignore stringify errors
          }
        } catch (e) {
          // ignore
        }
      }
    }

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        let rect = entry.contentRect
        let w = Math.round(rect.width)
        let h = Math.round(rect.height)
        if (w <= 0) {
          // fallback: find first ancestor with positive width
          let p: Element | null = el
          while (p && p.parentElement) {
            const pr = p.parentElement.getBoundingClientRect()
            if (pr.width > 0) {
              w = Math.round(pr.width)
              break
            }
            p = p.parentElement
          }
        }
        if (h <= 0) {
          const pr = el.getBoundingClientRect()
          if (pr.height > 0) h = Math.round(pr.height)
        }
        logIfZero(w, h)
        setSize({ width: w, height: h })
      }
    })
    ro.observe(el)
    // set initial size
    let rect = el.getBoundingClientRect()
    let w0 = Math.round(rect.width)
    let h0 = Math.round(rect.height)
    if (w0 <= 0) {
      let p: Element | null = el
      while (p && p.parentElement) {
        const pr = p.parentElement.getBoundingClientRect()
        if (pr.width > 0) {
          w0 = Math.round(pr.width)
          break
        }
        p = p.parentElement
      }
    }
    logIfZero(w0, h0)
    setSize({ width: w0, height: h0 })
    return () => ro.disconnect()
  }, [ref.current])

  return [ref, size] as const
}
