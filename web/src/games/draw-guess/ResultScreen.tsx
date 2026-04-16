import { DrawGuessGame } from '../../services/drawGuessService'
import { GameStatus } from './useDrawGuess'

interface ResultScreenProps {
  game: DrawGuessGame
  status: GameStatus
  onReplay: () => void
}

function ResultScreen({ game, status, onReplay }: ResultScreenProps) {
  const isSuccess = status === 'success'
  const isTimeout = status === 'timeout'

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      animals: '🐾 动物',
      plants: '🌿 植物',
      objects: '📦 物品',
      food: '🍜 食物',
      nature: '🌈 自然',
    }
    return categories[category] || category
  }

  return (
    <div className="min-h-screen bg-gray-100 py-lg px-md flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card overflow-hidden">
        <div
          className={`p-lg text-center ${
            isSuccess
              ? 'bg-gradient-to-r from-green-400 to-green-600'
              : 'bg-gradient-to-r from-gray-400 to-gray-600'
          } text-white`}
        >
          <div className="text-5xl mb-md">{isSuccess ? '🎉' : isTimeout ? '⏰' : '❌'}</div>
          <h1 className="text-2xl font-bold mb-sm">
            {isSuccess ? '恭喜猜对了！' : isTimeout ? '时间结束' : '游戏结束'}
          </h1>
          <p className="text-white/80">{isSuccess ? '你成功猜出了这个词' : '下次再努力吧'}</p>
        </div>

        <div className="p-lg">
          <div className="mb-lg">
            <img
              src={game.imageUrl}
              alt="AI Generated Image"
              className="w-full h-48 object-contain rounded-lg bg-gray-50 mb-md"
            />
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-xs">答案</p>
              <p className="text-xl font-bold text-gray-900">{game.word}</p>
              <p className="text-sm text-gray-500 mt-xs">{getCategoryLabel(game.category)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-md mb-lg text-center">
            <div className="p-md bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-xs">得分</p>
              <p className="text-2xl font-bold text-primary">{game.score}</p>
            </div>
            <div className="p-md bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-xs">尝试次数</p>
              <p className="text-2xl font-bold text-gray-700">{game.attempts}</p>
            </div>
            <div className="p-md bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-xs">用时</p>
              <p className="text-2xl font-bold text-gray-700">
                {game.timeLimit - game.timeRemaining}s
              </p>
            </div>
          </div>

          {game.guesses && game.guesses.length > 0 && (
            <div className="mb-lg">
              <p className="text-sm text-gray-400 mb-sm">你的猜测:</p>
              <div className="flex flex-wrap gap-xs">
                {game.guesses.map((g, i) => (
                  <span
                    key={i}
                    className={`px-sm py-xs rounded text-sm ${
                      g.toLowerCase() === game.word.toLowerCase()
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-md">
            <button onClick={onReplay} className="btn btn-primary btn-lg flex-1">
              再玩一次
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultScreen
