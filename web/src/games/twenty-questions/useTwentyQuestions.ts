import { useState, useCallback } from 'react'
import { twentyQuestionsService, TwentyQuestionsGame } from '../../services/twentyQuestionsService'

export type GameStatus = 'idle' | 'loading' | 'playing' | 'completed' | 'failed' | 'error'

interface UseTwentyQuestionsReturn {
  status: GameStatus
  game: TwentyQuestionsGame | null
  message: string
  error: string | null
  startGame: (category?: string) => Promise<void>
  ask: (question: string) => Promise<void>
  guess: (guess: string) => Promise<void>
  giveUp: () => Promise<void>
  resetGame: () => void
}

export function useTwentyQuestions(): UseTwentyQuestionsReturn {
  const [status, setStatus] = useState<GameStatus>('idle')
  const [game, setGame] = useState<TwentyQuestionsGame | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const startGame = useCallback(async (category?: string) => {
    setStatus('loading')
    setError(null)
    setMessage('')

    try {
      const newGame = await twentyQuestionsService.startGame(category)
      setGame(newGame)
      setStatus('playing')
      setMessage(`我已经想好了一个"${newGame.category}"，你有 ${newGame.questionsRemaining} 次提问机会，猜猜是什么？`)
    } catch (err: any) {
      setError(err.message || 'Failed to start game')
      setStatus('error')
    }
  }, [])

  const ask = useCallback(
    async (question: string) => {
      if (!game || status !== 'playing') return

      try {
        const result = await twentyQuestionsService.ask(game._id, question)
        setGame(result.game)
        setMessage(`问：${question}\n答：${result.answer === 'yes' ? '是' : result.answer === 'no' ? '不是' : '不确定'}`)

        if (result.game.questionsRemaining <= 0 && result.game.status !== 'completed') {
          setStatus('failed')
          setMessage('你已经用完了所有提问机会！')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to ask question')
      }
    },
    [game, status]
  )

  const guess = useCallback(
    async (guessWord: string) => {
      if (!game || status !== 'playing') return

      try {
        const result = await twentyQuestionsService.guess(game._id, guessWord)
        setGame(result.game)
        setMessage(result.message)

        if (result.correct) {
          setStatus('completed')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to submit guess')
      }
    },
    [game, status]
  )

  const giveUp = useCallback(async () => {
    if (!game) return

    try {
      const endedGame = await twentyQuestionsService.giveUp(game._id)
      setGame(endedGame)
      setStatus('failed')
      setMessage(`答案是：${endedGame.answer}`)
    } catch (err: any) {
      setError(err.message || 'Failed to give up')
    }
  }, [game])

  const resetGame = useCallback(() => {
    setStatus('idle')
    setGame(null)
    setMessage('')
    setError(null)
  }, [])

  return {
    status,
    game,
    message,
    error,
    startGame,
    ask,
    guess,
    giveUp,
    resetGame,
  }
}

export default useTwentyQuestions