import { useState, useCallback } from 'react'
import { wordChainService, WordChainGame } from '../../services/wordChainService'

export type GameStatus = 'idle' | 'loading' | 'playing' | 'completed' | 'failed' | 'error'

interface UseWordChainReturn {
  status: GameStatus
  game: WordChainGame | null
  message: string
  error: string | null
  startGame: () => Promise<void>
  play: (word: string) => Promise<void>
  giveUp: () => Promise<void>
  resetGame: () => void
}

export function useWordChain(): UseWordChainReturn {
  const [status, setStatus] = useState<GameStatus>('idle')
  const [game, setGame] = useState<WordChainGame | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const startGame = useCallback(async () => {
    setStatus('loading')
    setError(null)
    setMessage('')

    try {
      const newGame = await wordChainService.startGame()
      setGame(newGame)
      setStatus('playing')
      setMessage(`游戏开始！当前词语：「${newGame.currentWord}」，请接龙...`)
    } catch (err: any) {
      setError(err.message || 'Failed to start game')
      setStatus('error')
    }
  }, [])

  const play = useCallback(
    async (word: string) => {
      if (!game || status !== 'playing') return

      try {
        const result = await wordChainService.play(game._id, word)
        setGame(result.game)

        if (result.success) {
          setMessage(result.message)
          if (result.game.status === 'completed') {
            setStatus('completed')
          }
        } else {
          setMessage(result.message)
          if (result.game.status === 'failed') {
            setStatus('failed')
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to play')
      }
    },
    [game, status]
  )

  const giveUp = useCallback(async () => {
    if (!game) return

    try {
      const endedGame = await wordChainService.giveUp(game._id)
      setGame(endedGame)
      setStatus('failed')
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
    play,
    giveUp,
    resetGame,
  }
}

export default useWordChain