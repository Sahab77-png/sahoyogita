import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Profile from './pages/Profile'

function AppContent() {
  const { user, loading } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false) // ৰিছেট ম'ডৰ বাবে ষ্টেট

  useEffect(() => {
    // যদি Supabase য়ে ৰিকভাৰী ইভেণ্ট দিয়ে, তেন্তে ষ্টেট ট্ৰু কৰক
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Loading...</div>

  // যদি পাছৱৰ্ড ৰিছেট কৰি আছে, তেন্তে Login পেজতে ৰাখক (Feed লৈ যাবলৈ নিদিব)
  if (isRecovering) {
    return <Login setIsRecovering={setIsRecovering} initialView="forgot_reset" />
  }

  // যদি লগইন কৰা নাই
  if (!user) {
    return <Login setIsRecovering={setIsRecovering} initialView="login" />
  }

  // নহ'লে Feed বা Profile দেখুৱাওক
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
