import { useUserStore } from '../stores/userStore'
import { useLogout } from '../hooks/useAuth'

function ProfilePage() {
  const { user } = useUserStore()
  const logout = useLogout()
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
              { label: '游戏记录', value: 10 },
              { label: '成就', value: 15 },
              { label: '好友', value: 20 },
              { label: '收藏', value: 5 },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="p-md border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-md">最近游玩</h2>
            <div className="space-y-sm">
              {[
                { name: 'AI画图猜词', date: '2024/01/15', score: 100 },
                { name: 'AI对话冒险', date: '2024/01/14', score: 85 },
              ].map((game) => (
                <div
                  key={game.name}
                  className="flex items-center gap-md p-sm bg-gray-50 rounded-lg"
                >
                  <div className="text-lg">🎮</div>
                  <div className="flex-1">
                    <div className="font-medium">{game.name}</div>
                    <div className="text-sm text-gray-500">{game.date}</div>
                  </div>
                  <div className="text-primary font-semibold">{game.score}分</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-md border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-md">我的成就</h2>
            <div className="flex gap-md">
              {[
                { icon: '🏅', name: '首次胜利' },
                { icon: '🎯', name: '连胜5局' },
                { icon: '🌟', name: '满分通关' },
              ].map((achievement) => (
                <div key={achievement.name} className="text-center">
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
