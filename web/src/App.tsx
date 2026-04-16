import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useGetMe } from './hooks/useUser'
import { ErrorBoundary } from './common'
import HomePage from './pages/HomePage'
import GameRuntimePage from './pages/GameRuntimePage'
import GameDetailPage from './pages/GameDetailPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import Layout from './components/Layout'

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [hydrated, setHydrated] = useState(false)
  useGetMe()

  useEffect(() => {
    useAuthStore.persist.rehydrate()
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    const isAuth = !!accessToken || isAuthenticated

    if (!isAuth && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login', { replace: true })
    }
    if (isAuth && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/', { replace: true })
    }
  }, [accessToken, isAuthenticated, hydrated, navigate, location.pathname])

  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="game/:id" element={<GameDetailPage />} />
              <Route path="play/:id" element={<GameRuntimePage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
