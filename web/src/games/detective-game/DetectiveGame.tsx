import { useState } from 'react'
import { useDetectiveGame } from './useDetectiveGame'

function DetectiveGameComponent() {
  const {
    status,
    game,
    selectedSuspect,
    message,
    error,
    startGame,
    selectSuspect,
    questionSuspect,
    investigateClue,
    makeDeduction,
    accuse,
    giveUp,
    resetGame,
  } = useDetectiveGame()

  const [question, setQuestion] = useState('')
  const [deduction, setDeduction] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [showAccuseModal, setShowAccuseModal] = useState(false)
  const [accuseSuspectId, setAccuseSuspectId] = useState<string | null>(null)

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSuspect || !question.trim()) return
    await questionSuspect(selectedSuspect.id, question.trim())
    setQuestion('')
  }

  const handleInvestigate = async (clueId: string) => {
    await investigateClue(clueId)
  }

  const handleDeductionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deduction.trim()) return
    await makeDeduction(deduction.trim())
    setDeduction('')
  }

  const handleAccuse = async () => {
    if (!accuseSuspectId || !reasoning.trim()) return
    await accuse(accuseSuspectId, reasoning.trim())
    setShowAccuseModal(false)
    setReasoning('')
    setAccuseSuspectId(null)
  }

  const getQuestionsRemaining = (suspectId: string): number => {
    const conversation = game?.conversations.find((c) => c.suspectId === suspectId)
    const asked = conversation?.messages.filter((m) => m.role === 'user').length || 0
    return game?.maxQuestionsPerSuspect || 3 - asked
  }

  const getConversation = (suspectId: string) => {
    return game?.conversations.find((c) => c.suspectId === suspectId)?.messages || []
  }

  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-gray-100 py-lg px-md flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-md">🔍 AI侦探推理</h1>
          <p className="text-gray-500 mb-lg">
            AI生成一个神秘案件，你扮演侦探通过询问嫌疑人、调查线索，最终破解案件！
          </p>

          <div className="bg-gray-50 rounded-lg p-md mb-lg">
            <p className="text-sm text-gray-500">游戏玩法</p>
            <ul className="text-left text-sm text-gray-600 mt-sm space-y-xs">
              <li>• 每位嫌疑人最多询问 3 次</li>
              <li>• 调查线索消耗调查点数</li>
              <li>• 做出推理获得反馈</li>
              <li>• 最终指认凶手获得评分</li>
            </ul>
          </div>

          <button onClick={startGame} className="btn btn-primary btn-lg w-full">
            开始调查
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
          <p className="text-gray-500">AI 正在生成案件...</p>
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

  const isGameOver = status === 'solved' || status === 'failed'

  return (
    <div className="min-h-screen bg-gray-100 py-md px-md">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-md">
          <div className="p-md bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{game?.title}</h2>
                <p className="text-sm opacity-80">{game?.scenario}</p>
              </div>
              <div className="text-right">
                <div className="text-sm">调查点数</div>
                <div className="text-2xl font-bold">{game?.investigationPoints}</div>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-md ${
                isGameOver
                  ? status === 'solved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {!isGameOver ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="bg-white rounded-xl shadow-card p-md">
              <h3 className="font-bold text-gray-800 mb-md flex items-center gap-sm">
                <span>👤</span> 嫌疑人 ({game?.suspects.length})
              </h3>
              <div className="space-y-sm">
                {game?.suspects.map((suspect) => (
                  <div
                    key={suspect.id}
                    className={`p-sm rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSuspect?.id === suspect.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectSuspect(suspect)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{suspect.name}</span>
                        <span className="text-sm text-gray-500 ml-sm">{suspect.occupation}</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        {suspect.questioned && (
                          <span className="text-xs bg-green-100 text-green-600 px-xs py-xs rounded">
                            已询问
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 px-xs py-xs rounded">
                          {getQuestionsRemaining(suspect.id)}次
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-xs">
                      关系: {suspect.relationship} | 性格: {suspect.personality}
                    </div>
                  </div>
                ))}
              </div>

              {selectedSuspect && (
                <div className="mt-md border-t pt-md">
                  <h4 className="font-semibold text-gray-700 mb-sm">
                    与 {selectedSuspect.name} 对话
                  </h4>

                  <div className="bg-gray-50 rounded-lg p-sm mb-sm max-h-48 overflow-y-auto">
                    {getConversation(selectedSuspect.id).length > 0 ? (
                      <div className="space-y-sm">
                        {getConversation(selectedSuspect.id).map((msg, i) => (
                          <div
                            key={i}
                            className={`text-sm ${
                              msg.role === 'user' ? 'text-right' : 'text-left'
                            }`}
                          >
                            <span
                              className={`inline-block px-sm py-xs rounded ${
                                msg.role === 'user'
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {msg.content}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">尚未开始对话</p>
                    )}
                  </div>

                  {getQuestionsRemaining(selectedSuspect.id) > 0 ? (
                    <form onSubmit={handleQuestionSubmit}>
                      <div className="flex gap-sm">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="输入你的问题..."
                          className="input flex-1"
                        />
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={!question.trim()}
                        >
                          询问
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      已用完该嫌疑人的所有询问次数
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-card p-md">
              <h3 className="font-bold text-gray-800 mb-md flex items-center gap-sm">
                <span>🔎</span> 线索 ({game?.clues.length})
              </h3>
              <div className="space-y-sm">
                {game?.clues.map((clue) => (
                  <div
                    key={clue.id}
                    className={`p-sm rounded-lg border ${
                      clue.discovered
                        ? 'bg-green-50 border-green-200'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">
                          {clue.discovered ? clue.name : '??? 未调查'}
                        </span>
                        {clue.discovered && (
                          <span className="text-xs text-gray-500 ml-sm">{clue.location}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-xs">
                        <span
                          className={`text-xs px-xs py-xs rounded ${
                            clue.importance === 'critical'
                              ? 'bg-red-100 text-red-600'
                              : clue.importance === 'major'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {clue.importance === 'critical'
                            ? '关键'
                            : clue.importance === 'major'
                            ? '重要'
                            : '次要'}
                        </span>
                        {!clue.discovered && (
                          <button
                            onClick={() => handleInvestigate(clue.id)}
                            className="text-xs btn btn-secondary btn-xs"
                          >
                            调查
                          </button>
                        )}
                      </div>
                    </div>
                    {clue.discovered && (
                      <p className="text-xs text-gray-600 mt-xs">{clue.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-md border-t pt-md">
                <h4 className="font-semibold text-gray-700 mb-sm">提出推理</h4>
                <form onSubmit={handleDeductionSubmit}>
                  <div className="flex gap-sm">
                    <input
                      type="text"
                      value={deduction}
                      onChange={(e) => setDeduction(e.target.value)}
                      placeholder="输入你的推理..."
                      className="input flex-1"
                    />
                    <button
                      type="submit"
                      className="btn btn-secondary btn-sm"
                      disabled={!deduction.trim()}
                    >
                      推理
                    </button>
                  </div>
                </form>

                {game?.deductions && game.deductions.length > 0 && (
                  <div className="mt-sm">
                    <p className="text-xs text-gray-400 mb-xs">已提出推理:</p>
                    <div className="flex flex-wrap gap-xs">
                      {game.deductions.slice(-3).map((d, i) => (
                        <span
                          key={i}
                          className={`text-xs px-sm py-xs rounded ${
                            d.correct
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {d.statement.slice(0, 20)}...
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {!isGameOver ? (
          <div className="flex gap-sm mt-md">
            <button
              onClick={() => setShowAccuseModal(true)}
              className="btn btn-primary btn-md flex-1"
            >
              指认凶手
            </button>
            <button onClick={giveUp} className="btn btn-secondary btn-md flex-1">
              放弃调查
            </button>
            <button onClick={resetGame} className="btn btn-outline btn-md">
              重新开始
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-xl text-center mt-md">
            <div className="text-6xl mb-md">{status === 'solved' ? '🎉' : '😢'}</div>
            <p className="text-xl font-bold text-gray-800 mb-sm">
              {status === 'solved' ? '案件破解！' : '调查失败'}
            </p>
            <p className="text-3xl font-bold text-primary mb-lg">得分: {game?.score}</p>
            <button onClick={resetGame} className="btn btn-primary btn-lg">
              开始新案件
            </button>
          </div>
        )}

        {showAccuseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-xl max-w-md w-full mx-md">
              <h3 className="text-lg font-bold mb-md">指认凶手</h3>
              <p className="text-sm text-gray-500 mb-md">
                选择你认为的凶手，并提供推理依据
              </p>

              <div className="space-y-sm mb-md">
                {game?.suspects.map((suspect) => (
                  <button
                    key={suspect.id}
                    onClick={() => setAccuseSuspectId(suspect.id)}
                    className={`w-full p-sm rounded-lg border-2 text-left transition-all ${
                      accuseSuspectId === suspect.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-semibold">{suspect.name}</span>
                    <span className="text-sm text-gray-500 ml-sm">{suspect.occupation}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="你的推理依据..."
                className="input w-full min-h-24 mb-md"
              />

              <div className="flex gap-sm">
                <button
                  onClick={handleAccuse}
                  className="btn btn-primary btn-md flex-1"
                  disabled={!accuseSuspectId || !reasoning.trim()}
                >
                  确认指认
                </button>
                <button
                  onClick={() => {
                    setShowAccuseModal(false)
                    setAccuseSuspectId(null)
                    setReasoning('')
                  }}
                  className="btn btn-secondary btn-md flex-1"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetectiveGameComponent