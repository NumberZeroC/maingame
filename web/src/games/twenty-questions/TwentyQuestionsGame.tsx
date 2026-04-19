import { useState } from 'react'
import { useTwentyQuestions } from './useTwentyQuestions'

const CATEGORIES = ['动物', '植物', '物品', '食物', '人物', '地点', '抽象概念']

function TwentyQuestionsGame() {
  const { status, game, message, error, startGame, ask, guess, giveUp, resetGame } = useTwentyQuestions()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'ask' | 'guess'>('ask')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    if (mode === 'ask') {
      await ask(input.trim())
    } else {
      await guess(input.trim())
    }
    setInput('')
  }

  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-gray-100 py-lg px-md flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-md">❓ AI二十问</h1>
          <p className="text-gray-500 mb-lg">
            AI 想一个东西，你通过提问来猜出它是什么！只能问"是/否"问题。
          </p>

          <div className="mb-lg">
            <p className="text-sm text-gray-500 mb-sm">选择类别（可选）</p>
            <div className="flex flex-wrap gap-xs justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? undefined : cat)}
                  className={`px-md py-xs rounded-full text-sm transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-md mb-lg">
            <p className="text-sm text-gray-500">游戏规则</p>
            <ul className="text-left text-sm text-gray-600 mt-sm space-y-xs">
              <li>• 你有 20 次提问机会</li>
              <li>• 只能问"是/否"问题</li>
              <li>• 可以随时猜测答案</li>
              <li>• 用完问题或猜错则失败</li>
            </ul>
          </div>

          <button onClick={() => startGame(selectedCategory)} className="btn btn-primary btn-lg w-full">
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
          <p className="text-gray-500">AI 正在想一个东西...</p>
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
          <div className="p-md bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="text-lg font-semibold">❓ AI二十问</span>
              <span className="px-sm py-xs bg-white/20 rounded text-sm">{game?.category}</span>
            </div>
            <div className="flex items-center gap-md">
              <div className="text-sm">剩余问题</div>
              <div className="text-lg font-bold">{game?.questionsRemaining || 0}</div>
            </div>
          </div>

          <div className="p-lg">
            {message && (
              <div
                className={`p-md rounded-lg mb-lg whitespace-pre-line ${
                  isGameOver
                    ? status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {message}
              </div>
            )}

            {!isGameOver ? (
              <>
                <div className="bg-gray-50 rounded-lg p-md mb-lg text-center">
                  <p className="text-sm text-gray-500">你想的是什么？</p>
                  <p className="text-gray-700 mt-sm">用 {game?.questionsRemaining} 个问题找出答案！</p>
                </div>

                <div className="flex gap-sm mb-md">
                  <button
                    onClick={() => setMode('ask')}
                    className={`flex-1 py-sm rounded-lg text-sm font-medium transition-all ${
                      mode === 'ask' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    提问
                  </button>
                  <button
                    onClick={() => setMode('guess')}
                    className={`flex-1 py-sm rounded-lg text-sm font-medium transition-all ${
                      mode === 'guess' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    猜答案
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mb-lg">
                  <div className="flex gap-sm">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        mode === 'ask' ? '输入是/否问题...' : '输入你的猜测...'
                      }
                      className="input flex-1"
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary btn-md" disabled={!input.trim()}>
                      {mode === 'ask' ? '问' : '猜'}
                    </button>
                  </div>
                </form>

                {game?.questions && game.questions.length > 0 && (
                  <div className="mb-lg">
                    <p className="text-xs text-gray-400 mb-sm">问答历史:</p>
                    <div className="space-y-xs max-h-40 overflow-y-auto">
                      {game.questions.map((q, i) => (
                        <div key={i} className="flex items-start gap-sm text-sm">
                          <span className="text-gray-500">Q{i + 1}:</span>
                          <span className="text-gray-700">{q.question}</span>
                          <span
                            className={`px-xs py-xs rounded text-xs ${
                              q.answer === 'yes'
                                ? 'bg-green-100 text-green-700'
                                : q.answer === 'no'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {q.answer === 'yes' ? '是' : q.answer === 'no' ? '否' : '不确定'}
                          </span>
                        </div>
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
                  {status === 'completed' ? '恭喜猜对了！' : '游戏结束'}
                </p>
                <p className="text-gray-500 mb-lg">
                  {status === 'completed'
                    ? `答案是：${game?.answer}`
                    : `正确答案是：${game?.answer}`}
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

export default TwentyQuestionsGame