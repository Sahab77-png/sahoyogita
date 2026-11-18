import { AuthProvider, useAuth} from './context/AuthContext'
import Login from './pages/Login'
import Feed from './pages/Feed'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}> loading...</div>
  return user ? <Feed /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      </AuthProvider>
  )
}
