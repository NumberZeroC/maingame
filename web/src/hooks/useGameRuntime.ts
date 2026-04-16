import { useEffect, useRef, useState, useCallback } from 'react'
import { HostSDK, GameManifest, GameLifecycleStatus, GameResult, GameSDKError } from '../sdk'
import { useAuthStore } from '../stores/authStore'
import { gamePreloader } from '../lib/gamePreloader'

interface UseGameRuntimeOptions {
  gameId: string
  manifest: GameManifest
  onComplete?: (result: GameResult) => void
  onError?: (error: GameSDKError) => void
  onExit?: () => void
  preloadEnabled?: boolean
}

interface UseGameRuntimeReturn {
  iframeRef: React.RefObject<HTMLIFrameElement>
  status: GameLifecycleStatus
  result: GameResult | null
  error: GameSDKError | null
  preloadProgress: number
  start: () => void
  pause: () => void
  resume: () => void
  exit: () => void
  replay: () => void
}

function useGameRuntime(options: UseGameRuntimeOptions): UseGameRuntimeReturn {
  const { gameId, manifest, onComplete, onError, onExit, preloadEnabled = true } = options

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hostSDKRef = useRef<HostSDK | null>(null)
  const [status, setStatus] = useState<GameLifecycleStatus>('loading')
  const [result, setResult] = useState<GameResult | null>(null)
  const [error, setError] = useState<GameSDKError | null>(null)
  const [preloadProgress, setPreloadProgress] = useState(0)

  const { isAuthenticated } = useAuthStore()
  const userId = isAuthenticated ? 'current-user' : ''

  useEffect(() => {
    gamePreloader.init()
  }, [])

  useEffect(() => {
    const preloadAssets = manifest.assets?.preload
    if (preloadEnabled && preloadAssets && preloadAssets.length > 0) {
      gamePreloader.preload({
        manifest,
        onProgress: setPreloadProgress,
        onError: (err: Error) => console.warn('[GameRuntime] Preload error:', err),
      })
    } else {
      setPreloadProgress(100)
    }
  }, [manifest, preloadEnabled])

  useEffect(() => {
    if (!iframeRef.current || !isAuthenticated || preloadProgress < 100) return

    hostSDKRef.current = new HostSDK({
      gameId,
      userId,
      iframeRef,
      onGameReady: () => setStatus('ready'),
      onGameFinish: (gameResult: GameResult) => {
        setResult(gameResult)
        setStatus('finished')
        onComplete?.(gameResult)
      },
      onGameError: (err: GameSDKError) => {
        setError(err)
        setStatus('error')
        onError?.(err)
      },
      onLifecycleChange: setStatus,
    })

    hostSDKRef.current.init()

    const handleMessage = (event: MessageEvent) => {
      if (hostSDKRef.current && event.source === iframeRef.current?.contentWindow) {
        hostSDKRef.current.handleMessage(event)
      }
    }
    window.addEventListener('message', handleMessage)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hostSDKRef.current?.pause()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    const handleVisibilityChange = () => {
      if (hostSDKRef.current) {
        if (document.hidden) {
          hostSDKRef.current.pause()
        } else {
          hostSDKRef.current.resume()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      hostSDKRef.current?.destroy()
      hostSDKRef.current = null
    }
  }, [gameId, isAuthenticated, userId, preloadProgress, onComplete, onError])

  const start = useCallback(() => {
    hostSDKRef.current?.start()
  }, [])

  const pause = useCallback(() => {
    hostSDKRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    hostSDKRef.current?.resume()
  }, [])

  const exit = useCallback(() => {
    hostSDKRef.current?.destroy()
    onExit?.()
  }, [onExit])

  const replay = useCallback(() => {
    setResult(null)
    setError(null)
    setStatus('loading')
    setPreloadProgress(0)
    if (iframeRef.current && manifest.entry) {
      iframeRef.current.src = manifest.entry
    }
  }, [manifest.entry])

  return {
    iframeRef,
    status,
    result,
    error,
    preloadProgress,
    start,
    pause,
    resume,
    exit,
    replay,
  }
}

export default useGameRuntime
