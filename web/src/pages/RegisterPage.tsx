import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { RegisterRequest, ApiError } from '../types'
import { Toast } from '../components/Toast'

function RegisterPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      setToast({ message: '注册成功，请登录', type: 'success' })
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    },
    onError: (error: ApiError) => {
      setToast({ message: error.message || '注册失败', type: 'error' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || !password || !nickname) {
      setToast({ message: '请填写所有必填项', type: 'error' })
      return
    }

    if (password !== confirmPassword) {
      setToast({ message: '两次密码不一致', type: 'error' })
      return
    }

    registerMutation.mutate({ phone, password, nickname })
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
          <h2 className="text-xl font-bold text-gray-900 mb-lg text-center">注册</h2>

          <form className="space-y-md" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-gray-600 mb-xs block">手机号</label>
              <input
                type="text"
                className="input"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-xs block">昵称</label>
              <input
                type="text"
                className="input"
                placeholder="请输入昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
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

            <div>
              <label className="text-sm text-gray-600 mb-xs block">确认密码</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input w-full"
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? '注册中...' : '注册'}
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
            已有账号？{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
