import { useParams, Link } from 'react-router-dom'

const mockGame = {
  id: 'draw-guess',
  name: 'AI画图猜词',
  description: 'AI会根据随机词汇生成一幅图像，你需要猜出对应的词语。考验你的观察力和想象力！',
  thumbnail: 'https://picsum.photos/seed/game1/800/400',
  rating: 4.8,
  ratingCount: 1200,
  players: 100000,
  avgDuration: 5,
  category: ['休闲', '益智'],
  badges: ['ai', 'hot'],
  screenshots: [
    'https://picsum.photos/seed/ss1/400/300',
    'https://picsum.photos/seed/ss2/400/300',
    'https://picsum.photos/seed/ss3/400/300',
  ],
  features: ['✨ AI智能生成图像', '⏱️ 快速游戏，每局60秒', '🏆 排行榜挑战', '🎯 多种分类可选'],
}

const games: Record<string, typeof mockGame> = {
  'draw-guess': mockGame,
}

function GameDetailPage() {
  const { id } = useParams()
  const game = games[id || ''] || mockGame

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
          <div className="relative h-64 md:h-80">
            <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-lg">
            <div className="flex items-start justify-between mb-md">
              <div>
                <div className="flex gap-xs mb-sm">
                  {game.badges.map((badge) => (
                    <span key={badge} className={`badge badge-${badge}`}>
                      {badge === 'ai' ? 'AI' : badge === 'hot' ? 'HOT' : 'NEW'}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{game.name}</h1>
                <p className="text-gray-500 mt-sm">{game.description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-xs text-lg">
                  <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {game.rating}
                </div>
                <p className="text-sm text-gray-500">{formatNumber(game.players)} 玩家</p>
              </div>
            </div>

            {id === 'draw-guess' ? (
              <Link to="/play/draw-guess">
                <button className="btn btn-primary btn-lg w-full mb-lg">立即开始游戏</button>
              </Link>
            ) : (
              <Link to={`/play/${id}`}>
                <button className="btn btn-primary btn-lg w-full mb-lg">立即开始游戏</button>
              </Link>
            )}

            <div className="border-t border-gray-300 my-lg" />

            <div className="mb-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-md">游戏特色</h2>
              <ul className="space-y-sm">
                {game.features.map((feature) => (
                  <li key={feature} className="text-gray-700">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-md">游戏截图</h2>
              <div className="grid grid-cols-3 gap-sm">
                {game.screenshots.map((ss, i) => (
                  <img key={i} src={ss} alt={`Screenshot ${i + 1}`} className="w-full rounded-lg" />
                ))}
              </div>
            </div>

            <div className="border-t border-gray-300 my-lg" />

            <div>
              <div className="flex items-center justify-between mb-md">
                <h2 className="text-xl font-semibold text-gray-900">玩家评价</h2>
                <div className="text-sm text-gray-500">{game.ratingCount} 条评价</div>
              </div>
              <div className="space-y-md">
                <div className="bg-gray-50 rounded-lg p-md">
                  <div className="flex items-center gap-sm mb-sm">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">用户A</span>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg key={i} className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    非常有趣！AI生成的图像很有创意，每次玩都能发现新惊喜。
                  </p>
                </div>
              </div>
            </div>
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
