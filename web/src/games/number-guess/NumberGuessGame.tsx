import { useState } from 'react'
import { useNumberGuess } from './useNumberGuess'

function NumberGuessGame() {
  const { status, game, message, error, startGame, makeGuess, giveUp, resetGame } = useNumberGuess()
  const [guess, setGuess] = useState('')
  const [range, setRange] = useState({ min: 1, max: 100 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(guess, 10)
    if (isNaN(num)) return
    await makeGuess(num)
    setGuess('')
  }

  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-gray-100 py-lg px-md flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-md">🎯 猜数字</h1>
          <p className="text-gray-500 mb-lg">AI 想一个数字，你来猜！每次猜测都会提示"大了"或"小了"</p>

          <div className="flex gap-md mb-lg justify-center">
            <div>
              <label className="block text-sm text-gray-500 mb-xs">最小值</label>
              <input
                type="number"
                value={range.min}
                onChange={(e) => setRange({ ...range, min: parseInt(e.target.value) || 1 })}
                className="input w-24 text-center"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-xs">最大值</label>
              <input
                type="number"
                value={range.max}
                onChange={(e) => setRange({ ...range, max: parseInt(e.target.value) || 100 })}
                className="input w-24 text-center"
              />
            </div>
          </div>

          <button
            onClick={() => startGame(range.min, range.max)}
            className="btn btn-primary btn-lg w-full"
          >
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
          <p className="text-gray-500">AI 正在想数字...</p>
        </div>
      </div>
    )
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

  const isGameOver = status === 'completed'

  return (
    <div className="min-h-screen bg-gray-100 py-lg px-md">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-md bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="text-lg font-semibold">🎯 猜数字</span>
            </div>
            <div className="flex items-center gap-md">
              <div className="text-sm">
                范围: {game?.minRange}-{game?.maxRange}
              </div>
              <div className="text-lg font-bold">{game?.attempts || 0} 次</div>
            </div>
          </div>

          <div className="p-lg">
            {message && (
              <div
                className={`p-md rounded-lg mb-lg text-center ${
                  isGameOver ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {message}
              </div>
            )}

            {!isGameOver ? (
              <>
                <form onSubmit={handleSubmit} className="mb-lg">
                  <div className="flex gap-sm">
                    <input
                      type="number"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="输入你的猜测..."
                      className="input flex-1"
                      autoFocus
                      min={game?.minRange}
                      max={game?.maxRange}
                    />
                    <button type="submit" className="btn btn-primary btn-md" disabled={!guess}>
                      猜
                    </button>
                  </div>
                </form>

                {game?.guesses && game.guesses.length > 0 && (
                  <div className="mb-lg">
                    <p className="text-xs text-gray-400 mb-sm">历史记录:</p>
                    <div className="flex flex-wrap gap-xs max-h-40 overflow-y-auto">
                      {game.guesses.map((g, i) => (
                        <span
                          key={i}
                          className={`px-sm py-xs rounded text-sm ${
                            g.result === 'higher'
                              ? 'bg-red-100 text-red-700'
                              : g.result === 'lower'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {g.value}{' '}
                          {g.result === 'higher' ? '↑太小' : g.result === 'lower' ? '↓太大' : '✓'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-sm">
                  <button onClick={giveUp} className="btn btn-secondary btn-md flex-1">
                    放弃查看答案
                  </button>
                  <button onClick={resetGame} className="btn btn-outline btn-md flex-1">
                    重新开始
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-md">🎉</div>
                <p className="text-xl font-bold text-gray-800 mb-sm">猜对了！</p>
                <p className="text-gray-500 mb-lg">
                  答案是 <span className="font-bold text-primary">{game?.targetNumber}</span>，
                  你用了 {game?.attempts} 次猜测
                </p>
                <p className="text-2xl font-bold text-primary mb-lg">得分: {game?.score}</p>
                <button onClick={resetGame} className="btn btn-primary btn-lg">
                  再玩一次
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NumberGuessGame