
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Profile from './pages/Profile' // নতুনকৈ ইমপৰ্ট কৰক

function AppContent() {
  const { user, loading } = useAuth()
  const [showProfile, setShowProfile] = useState(false) // ষ্টেট

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Loading...</div>
  
  if (!user) return <Login />

  // যদি showProfile true হয়, তেন্তে প্ৰফাইল দেখুৱাব, নহ'লে ফীড
  return showProfile ? (
    <Profile onClose={() => setShowProfile(false)} />
  ) : (
    <Feed onOpenProfile={() => setShowProfile(true)} />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
