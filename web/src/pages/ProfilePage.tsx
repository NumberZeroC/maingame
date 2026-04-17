import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '../stores/userStore'
import { useLogout } from '../hooks/useAuth'
import { drawGuessService } from '../services/drawGuessService'
import { useAuthStore } from '../stores/authStore'

function ProfilePage() {
  const { user } = useUserStore()
  const { isAuthenticated } = useAuthStore()
  const logout = useLogout()

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['game-history'],
    queryFn: () => drawGuessService.getUserHistory(10),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  const recentGames = history?.filter((g) => g.status === 'completed').slice(0, 5) || []

  const totalGames = recentGames.length
  const totalScore = recentGames.reduce((sum, g) => sum + g.score, 0)
  const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0

  const achievements = [
    { icon: '🎮', name: '首次游玩', unlocked: totalGames >= 1 },
    { icon: '🎯', name: '得分破百', unlocked: avgScore >= 100 },
    { icon: '🌟', name: '满分通关', unlocked: recentGames.some((g) => g.score >= 1000) },
    { icon: '🔥', name: '连续5局', unlocked: totalGames >= 5 },
  ]

  return (
    <div className="min-h-screen bg-gray-100 py-lg px-md">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-lg text-center bg-gradient-to-r from-primary/10 to-secondary/10">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'user'}`
              }
              alt="avatar"
              className="w-20 h-20 rounded-full mx-auto mb-md border-4 border-white shadow-elevated"
            />
            <h1 className="text-2xl font-bold text-gray-900">{user?.nickname || '用户'}</h1>
            <div className="flex items-center justify-center gap-sm mt-sm">
              <span className="badge bg-primary text-white">Lv.{user?.vipLevel || 1}</span>
              <span className="text-gray-500">{user?.coins || 0} 积分</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-sm p-md border-b border-gray-200">
            {[
              { label: '游戏记录', value: totalGames },
              { label: '平均得分', value: avgScore },
              { label: '成就', value: achievements.filter((a) => a.unlocked).length },
              { label: '总积分', value: user?.coins || 0 },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="p-md border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-md">最近游玩</h2>
            {historyLoading ? (
              <div className="space-y-sm">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-md p-sm bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-xs" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentGames.length === 0 ? (
              <div className="text-center py-md text-gray-500">
                <div className="text-2xl mb-sm">🎮</div>
                还没有游玩记录，快去玩一局吧！
              </div>
            ) : (
              <div className="space-y-sm">
                {recentGames.map((game) => (
                  <div
                    key={game._id}
                    className="flex items-center gap-md p-sm bg-gray-50 rounded-lg"
                  >
                    <div className="text-lg">🎨</div>
                    <div className="flex-1">
                      <div className="font-medium">AI画图猜词</div>
                      <div className="text-sm text-gray-500">
                        {game.completedAt
                          ? new Date(game.completedAt).toLocaleDateString()
                          : '进行中'}
                      </div>
                    </div>
                    <div className="text-primary font-semibold">{game.score}分</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-md border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-md">我的成就</h2>
            <div className="flex gap-md">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`text-center ${achievement.unlocked ? '' : 'opacity-40'}`}
                >
                  <div className="text-2xl mb-xs">{achievement.icon}</div>
                  <div className="text-xs text-gray-600">{achievement.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-md">
            <div className="space-y-sm">
              {[
                { icon: '⚙️', label: '设置' },
                { icon: '👤', label: '个人资料' },
                { icon: '🔔', label: '通知设置' },
                { icon: '🔒', label: '隐私设置' },
                { icon: '❓', label: '帮助与反馈' },
                { icon: '📄', label: '关于我们' },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-md w-full p-sm hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-gray-700">{item.label}</span>
                </button>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-md w-full p-sm hover:bg-gray-50 rounded-lg transition-colors text-red-500"
              >
                <span className="text-lg">🚪</span>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
