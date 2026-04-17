import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GameContainer, GameLoading } from '../components/GameRuntime'
import { gameService } from '../services/gameService'
import { GameManifest, GameSDKError, GameResult } from '../sdk'

function GameRuntimePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: manifest,
    isLoading,
    error,
  } = useQuery<GameManifest>({
    queryKey: ['game-manifest', id],
    queryFn: async () => {
      const games = await gameService.getGames()
      const game = games.find((g) => g.slug === id || g._id === id)
      if (!game) throw new Error('Game not found')
      const response = await gameService.getGameManifest(game._id)
      return response
    },
    enabled: !!id,
  })

  const handleComplete = (result: GameResult) => {
    console.log('[GameRuntime] Game completed:', result)
  }

  const handleError = (err: GameSDKError) => {
    console.error('[GameRuntime] Game error:', err)
  }

  const handleExit = () => {
    navigate(-1)
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg">游戏不存在</p>
          <button onClick={() => navigate('/')} className="btn btn-primary btn-md mt-md">
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <GameLoading manifest={{ id: id, slug: id, name: '加载中...', version: '1.0', entry: '' }} />
    )
  }

  if (error || !manifest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center bg-gray-800 rounded-2xl p-xl max-w-md">
          <div className="text-4xl mb-md">⚠️</div>
          <p className="text-lg mb-md">游戏加载失败</p>
          <button onClick={() => navigate('/')} className="btn btn-primary btn-md">
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <GameContainer
      gameId={id}
      manifest={manifest}
      onComplete={handleComplete}
      onError={handleError}
      onExit={handleExit}
    />
  )
}

export default GameRuntimePage
