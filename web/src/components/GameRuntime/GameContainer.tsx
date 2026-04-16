import { useRef, useEffect, useState, useCallback } from 'react'
import { HostSDK, GameManifest, GameLifecycleStatus, GameResult, GameSDKError } from '../../sdk'
import { useAuthStore } from '../../stores/authStore'
import GameOverlay from './GameOverlay'
import GameLoading from './GameLoading'

interface GameContainerProps {
  gameId: string
  manifest: GameManifest
  onComplete?: (result: GameResult) => void
  onError?: (error: GameSDKError) => void
  onExit?: () => void
}

function GameContainer({ gameId, manifest, onComplete, onError, onExit }: GameContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hostSDKRef = useRef<HostSDK | null>(null)
  const [status, setStatus] = useState<GameLifecycleStatus>('loading')
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [error, setError] = useState<GameSDKError | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const { isAuthenticated } = useAuthStore()
  const userId = isAuthenticated ? 'current-user' : ''

  useEffect(() => {
    if (!iframeRef.current || !isAuthenticated) return

    hostSDKRef.current = new HostSDK({
      gameId,
      userId,
      iframeRef,
      onGameReady: () => setStatus('ready'),
      onGameFinish: (result: GameResult) => {
        setGameResult(result)
        setStatus('finished')
        onComplete?.(result)
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
        setShowExitConfirm(true)
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
  }, [gameId, isAuthenticated, userId, onComplete, onError])

  const handleStart = useCallback(() => {
    hostSDKRef.current?.start()
  }, [])

  const handlePause = useCallback(() => {
    hostSDKRef.current?.pause()
  }, [])

  const handleResume = useCallback(() => {
    hostSDKRef.current?.resume()
  }, [])

  const handleExit = useCallback(() => {
    hostSDKRef.current?.destroy()
    onExit?.()
  }, [onExit])

  const handleReplay = useCallback(() => {
    setGameResult(null)
    setError(null)
    setStatus('loading')
    if (iframeRef.current) {
      iframeRef.current.src = manifest.entry
    }
  }, [manifest.entry])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg">请先登录</p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return <GameLoading manifest={manifest} />
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center bg-gray-800 rounded-2xl p-xl max-w-md">
          <div className="text-4xl mb-md">⚠️</div>
          <p className="text-lg mb-md">{error?.message || '游戏加载失败'}</p>
          <div className="flex gap-md justify-center">
            <button onClick={handleReplay} className="btn btn-primary btn-md">
              重试
            </button>
            <button onClick={handleExit} className="btn btn-secondary btn-md">
              退出
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'finished' && gameResult) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center bg-gray-800 rounded-2xl p-xl max-w-md">
          <div className="text-4xl mb-md">🎉</div>
          <p className="text-lg mb-sm">游戏结束</p>
          {gameResult.score !== undefined && (
            <p className="text-2xl font-bold text-primary mb-md">得分: {gameResult.score}</p>
          )}
          {gameResult.achievements && gameResult.achievements.length > 0 && (
            <div className="mb-md">
              <p className="text-sm text-gray-400 mb-sm">获得成就:</p>
              <div className="flex flex-wrap gap-sm justify-center">
                {gameResult.achievements.map((a: string, i: number) => (
                  <span key={i} className="px-sm py-xs bg-primary/20 rounded text-primary text-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-md justify-center">
            <button onClick={handleReplay} className="btn btn-primary btn-md">
              再玩一次
            </button>
            <button onClick={handleExit} className="btn btn-secondary btn-md">
              返回
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <iframe
        ref={iframeRef}
        src={manifest.entry}
        sandbox="allow-scripts allow-same-origin allow-forms"
        className="w-full h-full absolute inset-0"
        title={manifest.name}
        allow="fullscreen"
      />

      <GameOverlay
        status={status}
        manifest={manifest}
        onPause={handlePause}
        onResume={handleResume}
        onExit={() => setShowExitConfirm(true)}
        showExitConfirm={showExitConfirm}
        onConfirmExit={handleExit}
        onCancelExit={() => setShowExitConfirm(false)}
      />

      {status === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-md">{manifest.name}</h2>
            <button onClick={handleStart} className="btn btn-primary btn-lg">
              开始游戏
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameContainer
