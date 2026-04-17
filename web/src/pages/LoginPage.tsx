import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'
import { Toast } from '../components/Toast'

function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const loginMutation = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || !password) {
      setToast({ message: '请填写手机号和密码', type: 'error' })
      return
    }

    if (password.length < 8) {
      setToast({ message: '密码至少需要8个字符', type: 'error' })
      return
    }

    loginMutation.mutate(
      { phone, password },
      {
        onError: (error: any) => {
          const errMsg = error?.message || '登录失败'
          setToast({ message: errMsg, type: 'error' })
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-md">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full max-w-md">
        <div className="text-center mb-xl">
          <div className="w-16 h-16 mx-auto mb-md rounded-full bg-white flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">AI游戏平台</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-modal p-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-lg text-center">登录</h2>

          <form className="space-y-md" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-gray-600 mb-xs block">手机号/邮箱</label>
              <input
                type="text"
                className="input"
                placeholder="请输入手机号或邮箱"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-xs block">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button type="button" className="text-sm text-primary hover:underline">
                忘记密码？
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-lg flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-sm text-sm text-gray-400">或</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <div className="mt-lg flex gap-md">
            {[
              { name: '微信', color: 'bg-green-500' },
              { name: 'Google', color: 'bg-red-500' },
              { name: 'Apple', color: 'bg-gray-800' },
            ].map((provider) => (
              <button
                key={provider.name}
                type="button"
                className={`flex-1 py-md rounded-lg ${provider.color} text-white font-medium hover:opacity-90 transition-opacity`}
              >
                {provider.name}
              </button>
            ))}
          </div>

          <p className="mt-lg text-center text-sm text-gray-500">
            还没有账号？{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
