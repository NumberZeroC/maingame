import { useState, useCallback } from 'react'
import {
  detectiveGameService,
  DetectiveGame,
  Suspect,
  Clue,
} from '../../services/detectiveGameService'

export type GameStatus = 'idle' | 'loading' | 'playing' | 'investigating' | 'solved' | 'failed' | 'error'

interface UseDetectiveGameReturn {
  status: GameStatus
  game: DetectiveGame | null
  selectedSuspect: Suspect | null
  selectedClue: Clue | null
  message: string
  error: string | null
  startGame: () => Promise<void>
  selectSuspect: (suspect: Suspect | null) => void
  selectClue: (clue: Clue | null) => void
  questionSuspect: (suspectId: string, question: string) => Promise<void>
  investigateClue: (clueId: string) => Promise<void>
  makeDeduction: (statement: string) => Promise<void>
  accuse: (suspectId: string, reasoning: string) => Promise<void>
  giveUp: () => Promise<void>
  resetGame: () => void
}

export function useDetectiveGame(): UseDetectiveGameReturn {
  const [status, setStatus] = useState<GameStatus>('idle')
  const [game, setGame] = useState<DetectiveGame | null>(null)
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null)
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const startGame = useCallback(async () => {
    setStatus('loading')
    setError(null)
    setMessage('')
    setSelectedSuspect(null)
    setSelectedClue(null)

    try {
      const newGame = await detectiveGameService.startGame()
      setGame(newGame)
      setStatus('playing')
      setMessage(newGame.scenario)
    } catch (err: any) {
      setError(err.message || 'Failed to start game')
      setStatus('error')
    }
  }, [])

  const selectSuspect = useCallback((suspect: Suspect | null) => {
    setSelectedSuspect(suspect)
    setSelectedClue(null)
  }, [])

  const selectClue = useCallback((clue: Clue | null) => {
    setSelectedClue(clue)
    setSelectedSuspect(null)
  }, [])

const questionSuspect = useCallback(
    async (suspectId: string, question: string) => {
      if (!game || status !== 'playing') return

      try {
        const result = await detectiveGameService.questionSuspect(game._id, suspectId, question)
        setGame(result.game)
        setMessage(result.response)

        if (result.game.status !== 'playing') {
          setStatus(result.game.status as any)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to question suspect')
        if (err.message?.includes('调查点数耗尽')) {
          setStatus('failed')
        }
      }
    },
    [game, status]
  )

  const investigateClue = useCallback(
    async (clueId: string) => {
      if (!game || status !== 'playing') return

      try {
        const result = await detectiveGameService.investigateClue(game._id, clueId)
        setGame(result.game)
        setMessage(result.discovery)
        
        if (result.game.status !== 'playing') {
          setStatus(result.game.status as any)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to investigate clue')
        if (err.message?.includes('调查点数耗尽')) {
          setStatus('failed')
        }
      }
    },
    [game, status]
  )

  const makeDeduction = useCallback(
    async (statement: string) => {
      if (!game || status !== 'playing') return

      try {
        const result = await detectiveGameService.makeDeduction(game._id, statement)
        setGame(result.game)
        setMessage(result.feedback)
      } catch (err: any) {
        setError(err.message || 'Failed to make deduction')
      }
    },
    [game, status]
  )

  const accuse = useCallback(
    async (suspectId: string, reasoning: string) => {
      if (!game || status !== 'playing') return

      try {
        const result = await detectiveGameService.accuse(game._id, suspectId, reasoning)
        setGame(result.game)
        setMessage(result.message)
        setStatus(result.correct ? 'solved' : 'failed')
      } catch (err: any) {
        setError(err.message || 'Failed to accuse')
      }
    },
    [game, status]
  )

  const giveUp = useCallback(async () => {
    if (!game) return

    try {
      const endedGame = await detectiveGameService.giveUp(game._id)
      setGame(endedGame)
      setStatus('failed')
      setMessage(endedGame.solution)
    } catch (err: any) {
      setError(err.message || 'Failed to give up')
    }
  }, [game])

  const resetGame = useCallback(() => {
    setStatus('idle')
    setGame(null)
    setSelectedSuspect(null)
    setSelectedClue(null)
    setMessage('')
    setError(null)
  }, [])

  return {
    status,
    game,
    selectedSuspect,
    selectedClue,
    message,
    error,
    startGame,
    selectSuspect,
    selectClue,
    questionSuspect,
    investigateClue,
    makeDeduction,
    accuse,
    giveUp,
    resetGame,
  }
}

export default useDetectiveGame