import GameCard from '../components/GameCard'
import { useGetGames } from '../hooks/useGames'

function GamesPage() {
  const { data: games, isLoading, error } = useGetGames()

  const publishedGames = games?.filter((g) => g.status === 'published') || []

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-md">⚠️</div>
          <p className="text-gray-600">加载游戏失败，请稍后重试</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-xl px-md">
      <div className="max-w-7xl mx-auto">
        <div className="mb-lg">
          <h1 className="text-3xl font-bold text-gray-900">全部游戏</h1>
          <p className="text-gray-500 mt-sm">探索AI驱动的精彩游戏世界</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : publishedGames.length === 0 ? (
          <div className="text-center py-2xl">
            <div className="text-6xl mb-lg">🎮</div>
            <p className="text-gray-500">暂无游戏，敬请期待</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {publishedGames.map((game) => (
              <GameCard
                key={game._id}
                id={game.slug || game._id}
                name={game.name}
                description={game.description || ''}
                thumbnail={game.thumbnail || 'https://picsum.photos/seed/game/400/300'}
                rating={game.stats?.rating || 4.5}
                players={game.stats?.playCount || 0}
                category={game.category || []}
                badges={game.category?.includes('AI') ? ['ai'] : []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GamesPage