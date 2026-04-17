import { useQuery } from '@tanstack/react-query'
import { drawGuessService } from '../services/drawGuessService'
import { useAuthStore } from '../stores/authStore'

interface LeaderboardEntry {
  _id: string
  userId: string
  nickname: string
  avatar?: string
  score: number
  category: string
  completedAt?: string
}

function LeaderboardPage() {
  const { isAuthenticated } = useAuthStore()

  const {
    data: leaderboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['leaderboard', 'draw-guess'],
    queryFn: async () => {
      const games = await drawGuessService.getLeaderboard(20)
      const sorted = games
        .filter((g) => g.status === 'completed')
        .sort((a, b) => b.score - a.score)
        .map((g, index) => ({
          ...g,
          nickname: `玩家${index + 1}`,
          avatar: `user${index + 1}`,
        }))
      return sorted as LeaderboardEntry[]
    },
    staleTime: 60 * 1000,
  })

  const { data: myRank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: async () => {
      const history = await drawGuessService.getUserHistory(1)
      if (history.length === 0) return null
      return { score: history[0].score, rank: -1 }
    },
    enabled: isAuthenticated,
  })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-md">⚠️</div>
          <p className="text-gray-600">加载排行榜失败，请稍后重试</p>
        </div>
      </div>
    )
  }

  const rankings = leaderboard || []

  return (
    <div className="min-h-screen bg-gray-100 py-lg px-md">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-lg flex items-center gap-sm">
          <span>🏆</span>
          排行榜
        </h1>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-lg">
              <div className="flex justify-around">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-full mx-auto mb-xs bg-gray-200 animate-pulse" />
                    <div className="h-4 bg-gray-200 animate-pulse mb-xs" />
                    <div className="h-3 bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : rankings.length === 0 ? (
            <div className="p-lg text-center text-gray-500">暂无排行榜数据</div>
          ) : (
            <>
              <div className="p-lg bg-gradient-to-r from-primary to-secondary text-white">
                <div className="flex justify-around">
                  {rankings.slice(0, 3).map((player, index) => (
                    <div key={player._id} className="text-center">
                      <div className="text-2xl mb-xs">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar || player._id}`}
                        alt={player.nickname}
                        className="w-12 h-12 rounded-full mx-auto mb-xs border-2 border-white"
                      />
                      <div className="font-semibold">{player.nickname}</div>
                      <div className="text-sm opacity-80">{player.score} 分</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {rankings.slice(3).map((player, index) => (
                  <div key={player._id} className="flex items-center gap-md p-md hover:bg-gray-50">
                    <div className="w-8 text-center font-semibold text-gray-500">{index + 4}</div>
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar || player._id}`}
                      alt={player.nickname}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{player.nickname}</div>
                    </div>
                    <div className="text-lg font-semibold text-primary">{player.score}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {myRank && isAuthenticated && (
            <div className="p-md bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-md">
                <div className="w-8 text-center font-semibold text-gray-500">
                  {myRank.rank > 0 ? myRank.rank : '-'}
                </div>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=me"
                  alt="我的排名"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">我的排名</div>
                </div>
                <div className="text-lg font-semibold text-primary">{myRank.score}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
