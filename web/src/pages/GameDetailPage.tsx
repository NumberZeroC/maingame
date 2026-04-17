import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gameService } from '../services/gameService'

function GameDetailPage() {
  const { id } = useParams()

  const {
    data: game,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['game', id],
    queryFn: async () => {
      if (!id) return null
      try {
        const game = await gameService.getGameById(id)
        return game
      } catch {
        const games = await gameService.getGames()
        return games.find((g) => g.slug === id) || null
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto animate-spin">
            <svg className="w-full h-full text-primary" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <p className="text-gray-500 mt-md">加载游戏详情...</p>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-md">🎮</div>
          <h1 className="text-xl font-bold text-gray-900 mb-sm">游戏不存在</h1>
          <Link to="/" className="text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-md py-lg">
        <Link to="/" className="text-gray-500 hover:text-gray-900 mb-lg flex items-center gap-xs">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <div className="bg-white rounded-2xl shadow-elevated overflow-hidden">
          <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary to-secondary">
            {game.thumbnail ? (
              <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                🎨
              </div>
            )}
          </div>

          <div className="p-lg">
            <div className="flex items-start justify-between mb-md">
              <div>
                <div className="flex gap-xs mb-sm">
                  {game.category?.map((cat) => (
                    <span key={cat} className="badge bg-gray-100 text-gray-700">
                      {cat}
                    </span>
                  ))}
                  {game.category?.includes('AI') && (
                    <span className="badge bg-primary text-white">AI</span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{game.name}</h1>
                <p className="text-gray-500 mt-sm">{game.description || '精彩游戏等你来玩！'}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-xs text-lg">
                  <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {game.stats?.rating?.toFixed(1) || '4.5'}
                </div>
                <p className="text-sm text-gray-500">
                  {formatNumber(game.stats?.playCount || 0)} 次游玩
                </p>
              </div>
            </div>

            <Link to={`/play/${game.slug || game._id}`}>
              <button className="btn btn-primary btn-lg w-full mb-lg">立即开始游戏</button>
            </Link>

            <div className="border-t border-gray-300 my-lg" />

            <div className="mb-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-md">游戏特色</h2>
              <ul className="space-y-sm">
                {game.category?.includes('AI') && (
                  <li className="text-gray-700">✨ AI智能生成内容</li>
                )}
                <li className="text-gray-700">⏱️ 快速游戏，轻松上手</li>
                <li className="text-gray-700">🏆 排行榜挑战</li>
                {game.category?.map((cat) => (
                  <li key={cat} className="text-gray-700">
                    🎯 {cat}类型
                  </li>
                ))}
              </ul>
            </div>

            {game.aiRequirements?.llm?.enabled && (
              <div className="mb-lg bg-primary/5 rounded-lg p-md">
                <div className="flex items-center gap-sm mb-sm">
                  <span className="text-primary">🤖</span>
                  <span className="font-semibold text-gray-900">AI功能</span>
                </div>
                <p className="text-sm text-gray-600">
                  本游戏使用AI技术生成内容，为您提供独特的游戏体验。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(0) + '万+'
  }
  return num.toString()
}

export default GameDetailPage
