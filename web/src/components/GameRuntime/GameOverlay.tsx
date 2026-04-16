import { GameLifecycleStatus, GameManifest } from '../../sdk'

interface GameOverlayProps {
  status: GameLifecycleStatus
  manifest: GameManifest
  onPause: () => void
  onResume: () => void
  onExit: () => void
  showExitConfirm: boolean
  onConfirmExit: () => void
  onCancelExit: () => void
}

function GameOverlay({
  status,
  manifest,
  onPause,
  onResume,
  onExit,
  showExitConfirm,
  onConfirmExit,
  onCancelExit,
}: GameOverlayProps) {
  if (status !== 'playing' && status !== 'paused') {
    return null
  }

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-sm bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-sm">
            <span className="text-sm font-medium">{manifest.name}</span>
            {status === 'paused' && (
              <span className="px-xs py-xs bg-yellow-500/20 rounded text-yellow-400 text-xs">
                已暂停
              </span>
            )}
          </div>
          <div className="flex items-center gap-sm">
            {status === 'playing' && (
              <button
                onClick={onPause}
                className="px-sm py-xs bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
              >
                暂停
              </button>
            )}
            {status === 'paused' && (
              <button
                onClick={onResume}
                className="px-sm py-xs bg-primary hover:bg-primary/80 rounded text-sm transition-colors"
              >
                继续
              </button>
            )}
            <button
              onClick={onExit}
              className="px-sm py-xs bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 text-sm transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </div>

      {status === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-center text-white">
            <div className="text-4xl mb-md">⏸️</div>
            <p className="text-lg mb-md">游戏已暂停</p>
            <button onClick={onResume} className="btn btn-primary btn-md">
              继续游戏
            </button>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
          <div className="bg-gray-800 rounded-2xl p-xl max-w-sm text-center">
            <div className="text-4xl mb-md text-yellow-400">⚠️</div>
            <p className="text-white text-lg mb-md">确定要退出游戏吗？</p>
            <p className="text-gray-400 text-sm mb-lg">当前进度可能会丢失</p>
            <div className="flex gap-md justify-center">
              <button onClick={onConfirmExit} className="btn btn-danger btn-md">
                退出
              </button>
              <button onClick={onCancelExit} className="btn btn-secondary btn-md">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GameOverlay
