import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Loader2, Sparkles } from 'lucide-react'
import { analyzeScreenshot, fileToBase64 } from '../../lib/gemini'
import type { GeminiTradeData } from '../../lib/gemini'

interface Props {
  onAnalysisComplete: (data: GeminiTradeData) => void
}

export default function ScreenshotUploader({ onAnalysisComplete }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen')
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!preview || loading) return

    setLoading(true)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(preview, { signal: controller.signal })
      const blob = await response.blob()
      const file = new File([blob], 'screenshot.png', { type: blob.type })
      const { base64, mimeType } = await fileToBase64(file)
      const data = await analyzeScreenshot(base64, mimeType)
      if (mountedRef.current && !controller.signal.aborted) {
        onAnalysisComplete(data)
      }
    } catch (err) {
      if (mountedRef.current && !controller.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Error al analizar el screenshot')
      }
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [preview, loading, onAnalysisComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const clearPreview = () => {
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm text-neutral-400 mb-1">
        <Sparkles className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
        Screenshot Analysis (AI)
      </label>

      <div className={preview ? 'hidden' : undefined}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-700 hover:border-neutral-600'}
          `}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-500" />
          <p className="text-sm text-neutral-400">
            Arrastra un screenshot aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            PNG, JPG, WEBP (máx 20MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      </div>

      <div className={!preview ? 'hidden' : 'relative'}>
        <img
          src={preview ?? undefined}
          alt="Screenshot preview"
          className="w-full max-h-48 object-contain rounded-lg border border-neutral-700"
        />
        <button
          type="button"
          onClick={clearPreview}
          className="absolute top-2 right-2 p-1 bg-neutral-900/80 rounded-full hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !preview}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
          ${!preview ? 'hidden' : ''}
          ${loading
            ? 'bg-purple-600/50 text-white/70 cursor-wait'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
          }
        `}
      >
        <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : 'hidden'}`} />
        <Sparkles className={`w-4 h-4 ${loading ? 'hidden' : ''}`} />
        {loading ? 'Analizando con Gemini...' : 'Analizar con IA'}
      </button>
    </div>
  )
}
