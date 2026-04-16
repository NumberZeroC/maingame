import { useState } from 'react'
import { useDrawGuess } from './useDrawGuess'
import ResultScreen from './ResultScreen'
import { GameCategory } from '../../services/drawGuessService'

const CATEGORIES: { key: GameCategory; label: string; icon: string }[] = [
  { key: 'animals', label: '动物', icon: '🐾' },
  { key: 'plants', label: '植物', icon: '🌿' },
  { key: 'objects', label: '物品', icon: '📦' },
  { key: 'food', label: '食物', icon: '🍜' },
  { key: 'nature', label: '自然', icon: '🌈' },
]

function DrawGuessGame() {
  const { status, game, timeRemaining, message, error, startGame, submitGuess, resetGame } =
    useDrawGuess()
  const [guess, setGuess] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | undefined>()

  const handleStartGame = (category?: GameCategory) => {
    setSelectedCategory(category)
    startGame(category)
  }

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guess.trim()) return

    try {
      await submitGuess(guess.trim())
      setGuess('')
    } catch {
      setGuess('')
    }
  }

  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-gray-100 py-lg px-md flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-md">AI 画图猜词</h1>
          <p className="text-gray-500 mb-lg">AI 会生成一幅图像，你需要在 60 秒内猜出它是什么</p>

          <div className="mb-lg">
            <p className="text-sm text-gray-500 mb-md">选择一个分类（可选）</p>
            <div className="grid grid-cols-5 gap-sm">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleStartGame(cat.key)}
                  className={`p-md rounded-lg text-center transition-all ${
                    selectedCategory === cat.key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-xs">{cat.icon}</div>
                  <div className="text-xs">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => handleStartGame()} className="btn btn-primary btn-lg w-full">
            开始游戏
          </button>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-md mx-auto"></div>
          <p className="text-gray-500">AI 正在生成图像...</p>
        </div>
      </div>
    )
  }

  if (status === 'success' || status === 'timeout') {
    return <ResultScreen game={game!} status={status} onReplay={resetGame} />
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-card p-xl max-w-md">
          <div className="text-4xl mb-md">❌</div>
          <p className="text-gray-700 mb-lg">{error}</p>
          <button onClick={resetGame} className="btn btn-primary btn-md">
            重新开始
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-lg px-md">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-md bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="text-lg font-semibold">AI 画图猜词</span>
              {game?.category && (
                <span className="px-sm py-xs bg-white/20 rounded text-sm">
                  {CATEGORIES.find((c) => c.key === game.category)?.icon}{' '}
                  {CATEGORIES.find((c) => c.key === game.category)?.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-sm">
              <div className={`text-2xl font-bold ${timeRemaining <= 10 ? 'animate-pulse' : ''}`}>
                {timeRemaining}s
              </div>
            </div>
          </div>

          <div className="p-lg">
            <div className="relative mb-lg">
              <img
                src={game?.imageUrl}
                alt="AI Generated Image"
                className="w-full h-64 object-contain rounded-lg bg-gray-50"
              />
            </div>

            <form onSubmit={handleSubmitGuess} className="mb-md">
              <div className="flex gap-sm">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="输入你的猜测..."
                  className="input flex-1"
                  autoFocus
                  disabled={status !== 'playing'}
                />
                <button type="submit" className="btn btn-primary btn-md" disabled={!guess.trim()}>
                  猜
                </button>
              </div>
            </form>

            {message && (
              <div
                className={`p-md rounded-lg mb-md ${
                  game?.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                已猜次数: <span className="font-semibold text-gray-700">{game?.attempts || 0}</span>
              </div>
              <button
                onClick={() => {
                  resetGame()
                }}
                className="text-primary hover:underline"
              >
                放弃
              </button>
            </div>

            {game?.guesses && game.guesses.length > 0 && (
              <div className="mt-md pt-md border-t border-gray-200">
                <p className="text-xs text-gray-400 mb-sm">历史猜测:</p>
                <div className="flex flex-wrap gap-xs">
                  {game.guesses.slice(-5).map((g: string, i: number) => (
                    <span key={i} className="px-sm py-xs bg-gray-100 rounded text-sm text-gray-600">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrawGuessGame
