import { useState, useCallback } from 'react'
import { numberGuessService, NumberGuessGame } from '../../services/numberGuessService'

export type GameStatus = 'idle' | 'loading' | 'playing' | 'completed' | 'error'

interface UseNumberGuessReturn {
  status: GameStatus
  game: NumberGuessGame | null
  message: string
  error: string | null
  startGame: (minRange?: number, maxRange?: number) => Promise<void>
  makeGuess: (guess: number) => Promise<void>
  giveUp: () => Promise<void>
  resetGame: () => void
}

export function useNumberGuess(): UseNumberGuessReturn {
  const [status, setStatus] = useState<GameStatus>('idle')
  const [game, setGame] = useState<NumberGuessGame | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const startGame = useCallback(async (minRange: number = 1, maxRange: number = 100) => {
    setStatus('loading')
    setError(null)
    setMessage('')

    try {
      const newGame = await numberGuessService.startGame(minRange, maxRange)
      setGame(newGame)
      setStatus('playing')
      setMessage(`我想了一个 ${minRange} 到 ${maxRange} 之间的数字，来猜猜看！`)
    } catch (err: any) {
      setError(err.message || 'Failed to start game')
      setStatus('error')
    }
  }, [])

  const makeGuess = useCallback(
    async (guess: number) => {
      if (!game || status !== 'playing') return

      try {
        const result = await numberGuessService.guess(game._id, guess)
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
      const endedGame = await numberGuessService.giveUp(game._id)
      setGame(endedGame)
      setStatus('completed')
      setMessage(`答案揭晓：是 ${endedGame.targetNumber}`)
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
    makeGuess,
    giveUp,
    resetGame,
  }
}

export default useNumberGuess