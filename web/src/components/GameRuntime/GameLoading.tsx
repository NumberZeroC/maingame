import { GameManifest } from '../../sdk'

interface GameLoadingProps {
  manifest: GameManifest
}

function GameLoading({ manifest }: GameLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        {manifest.thumbnail && (
          <img
            src={manifest.thumbnail}
            alt={manifest.name}
            className="w-24 h-24 rounded-lg mb-lg mx-auto object-cover"
          />
        )}
        <h2 className="text-xl font-bold mb-md">{manifest.name}</h2>
        <div className="flex items-center justify-center gap-sm mb-md">
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
        <p className="text-gray-400 text-sm">正在加载游戏资源...</p>
      </div>
    </div>
  )
}

export default GameLoading
