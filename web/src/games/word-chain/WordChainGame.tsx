import { useState } from 'react'
import { useWordChain } from './useWordChain'

function WordChainGame() {
  const { status, game, message, error, startGame, play, giveUp, resetGame } = useWordChain()
  const [word, setWord] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim()) return
    await play(word.trim())
    setWord('')
  }

  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-gray-100 py-lg px-md flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-md">📝 词语接龙</h1>
          <p className="text-gray-500 mb-lg">
            和 AI 轮流说词语，后一个词的第一个字必须是前一个词的最后一个字！
          </p>
          <div className="bg-gray-50 rounded-lg p-md mb-lg">
            <p className="text-sm text-gray-500">游戏规则</p>
            <ul className="text-left text-sm text-gray-600 mt-sm space-y-xs">
              <li>• 每个词必须是有效的中文词语</li>
              <li>• 后词首字 = 前词末字</li>
              <li>• 词语不能重复使用</li>
              <li>• 接不上则游戏结束</li>
            </ul>
          </div>
          <button onClick={startGame} className="btn btn-primary btn-lg w-full">
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
          <p className="text-gray-500">AI 正在想一个起始词...</p>
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

  const isGameOver = status === 'completed' || status === 'failed'

  return (
    <div className="min-h-screen bg-gray-100 py-lg px-md">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-md bg-gradient-to-r from-green-500 to-teal-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="text-lg font-semibold">📝 词语接龙</span>
            </div>
            <div className="flex items-center gap-md">
              <div className="text-sm">回合: {game?.rounds || 0}</div>
              <div className="text-lg font-bold">{game?.score || 0} 分</div>
            </div>
          </div>

          <div className="p-lg">
            {message && (
              <div
                className={`p-md rounded-lg mb-lg ${
                  isGameOver
                    ? status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {message}
              </div>
            )}

            {!isGameOver ? (
              <>
                <div className="bg-gray-50 rounded-lg p-lg mb-lg text-center">
                  <p className="text-sm text-gray-500 mb-sm">当前词语</p>
                  <p className="text-3xl font-bold text-gray-800">{game?.currentWord}</p>
                  <p className="text-sm text-primary mt-sm">
                    请输入以「{game?.lastChar}」开头的词语
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mb-lg">
                  <div className="flex gap-sm">
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder={`输入以「${game?.lastChar}」开头的词语...`}
                      className="input flex-1"
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary btn-md" disabled={!word.trim()}>
                      接龙
                    </button>
                  </div>
                </form>

                {game?.history && game.history.length > 0 && (
                  <div className="mb-lg">
                    <p className="text-xs text-gray-400 mb-sm">接龙历史:</p>
                    <div className="flex flex-wrap gap-xs max-h-32 overflow-y-auto">
                      {game.history.map((h, i) => (
                        <span
                          key={i}
                          className={`px-sm py-xs rounded text-sm ${
                            h.by === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {h.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-sm">
                  <button onClick={giveUp} className="btn btn-secondary btn-md flex-1">
                    放弃
                  </button>
                  <button onClick={resetGame} className="btn btn-outline btn-md flex-1">
                    重新开始
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-md">{status === 'completed' ? '🎉' : '😢'}</div>
                <p className="text-xl font-bold text-gray-800 mb-sm">
                  {status === 'completed' ? '太棒了！' : '游戏结束'}
                </p>
                <p className="text-gray-500 mb-lg">
                  你完成了 {game?.rounds} 个回合，获得 {game?.score} 分
                </p>
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

export default WordChainGame