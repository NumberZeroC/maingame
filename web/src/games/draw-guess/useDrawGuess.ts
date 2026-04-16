import { useState, useCallback, useEffect, useRef } from 'react'
import {
  drawGuessService,
  DrawGuessGame,
  GuessResponse,
  GameCategory,
} from '../../services/drawGuessService'

export type GameStatus = 'idle' | 'loading' | 'playing' | 'success' | 'timeout' | 'error'

interface UseDrawGuessReturn {
  status: GameStatus
  game: DrawGuessGame | null
  timeRemaining: number
  message: string
  error: string | null
  startGame: (category?: GameCategory) => Promise<void>
  submitGuess: (guess: string) => Promise<GuessResponse>
  finishGame: () => Promise<void>
  resetGame: () => void
}

const GAME_DURATION = 60

export function useDrawGuess(): UseDrawGuessReturn {
  const [status, setStatus] = useState<GameStatus>('idle')
  const [game, setGame] = useState<DrawGuessGame | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    setTimeRemaining(GAME_DURATION)

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          setStatus('timeout')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  const startGame = useCallback(
    async (category?: GameCategory) => {
      setStatus('loading')
      setError(null)
      setMessage('')

      try {
        const newGame = await drawGuessService.startGame(category)
        setGame(newGame)
        setStatus('playing')
        startTimer()
      } catch (err: any) {
        setError(err.message || 'Failed to start game')
        setStatus('error')
      }
    },
    [startTimer]
  )

  const submitGuess = useCallback(
    async (guess: string): Promise<GuessResponse> => {
      if (!game || status !== 'playing') {
        throw new Error('Game not in progress')
      }

      try {
        const result = await drawGuessService.guess(game._id, guess)
        setGame(result.game)
        setMessage(result.message)

        if (result.correct) {
          clearTimer()
          setStatus('success')
        }

        return result
      } catch (err: any) {
        setError(err.message || 'Failed to submit guess')
        throw err
      }
    },
    [game, status, clearTimer]
  )

  const finishGame = useCallback(async () => {
    if (!game) return

    clearTimer()

    try {
      const finishedGame = await drawGuessService.finishGame(game._id, timeRemaining)
      setGame(finishedGame)
    } catch (err: any) {
      setError(err.message || 'Failed to finish game')
    }
  }, [game, timeRemaining, clearTimer])

  const resetGame = useCallback(() => {
    clearTimer()
    setStatus('idle')
    setGame(null)
    setTimeRemaining(GAME_DURATION)
    setMessage('')
    setError(null)
  }, [clearTimer])

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  useEffect(() => {
    if (status === 'timeout' && game) {
      finishGame()
    }
  }, [status, game, finishGame])

  return {
    status,
    game,
    timeRemaining,
    message,
    error,
    startGame,
    submitGuess,
    finishGame,
    resetGame,
  }
}

export default useDrawGuess
