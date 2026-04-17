import GameCard from '../components/GameCard'
import { Link } from 'react-router-dom'
import { useGetGames } from '../hooks/useGames'

function HomePage() {
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
    <div>
      <section className="relative bg-gradient-to-r from-primary to-secondary py-2xl px-md overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-md">
            AI驱动的<span className="gradient-text">游戏世界</span>
          </h1>
          <p className="text-lg text-white/90 mb-lg">探索无限可能，体验AI带来的全新游戏乐趣</p>
          <div className="flex gap-md justify-center mb-lg">
            {publishedGames.length > 0 && (
              <Link
                to={`/game/${publishedGames[0].slug || publishedGames[0]._id}`}
                className="btn btn-primary btn-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                开始探索
              </Link>
            )}
            <Link
              to="/leaderboard"
              className="btn btn-lg bg-white/10 text-white border-2 border-white/30 hover:bg-white/20"
            >
              排行榜
            </Link>
          </div>
          <div className="flex justify-center gap-lg bg-white/10 rounded-xl p-lg backdrop-blur-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{publishedGames.length}+</div>
              <div className="text-sm text-white/80">精品游戏</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {publishedGames.reduce((sum, g) => sum + (g.stats?.playCount || 0), 0)}
              </div>
              <div className="text-sm text-white/80">游玩次数</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {publishedGames.length > 0
                  ? (
                      publishedGames.reduce((sum, g) => sum + (g.stats?.rating || 0), 0) /
                      publishedGames.length
                    ).toFixed(1)
                  : '0'}
              </div>
              <div className="text-sm text-white/80">平均评分</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-2xl px-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-sm">
              <span>🔥</span>
              热门推荐
            </h2>
            <Link
              to="/leaderboard"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              查看更多 →
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : publishedGames.length === 0 ? (
            <div className="text-center py-lg text-gray-500">暂无游戏</div>
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
      </section>

      <section className="py-2xl px-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-sm">
              <span>🎮</span>
              分类浏览
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
            {['益智', '创意', '冒险', '社交', '休闲', '竞技'].map((cat) => (
              <div
                key={cat}
                className="bg-white rounded-lg p-lg text-center shadow-card hover:-translate-y-1 hover:shadow-elevated transition-all cursor-pointer border-2 border-transparent hover:border-primary"
              >
                <div className="text-4xl mb-md">
                  {cat === '益智'
                    ? '🧩'
                    : cat === '创意'
                      ? '🎨'
                      : cat === '冒险'
                        ? '🏰'
                        : cat === '社交'
                          ? '👥'
                          : cat === '休闲'
                            ? '🎯'
                            : '⚔️'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-xs">{cat}</h3>
                <p className="text-sm text-gray-500">
                  {publishedGames.filter((g) => g.category?.includes(cat)).length}款游戏
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
