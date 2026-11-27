import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Profile from './pages/Profile'

function AppContent() {
  const { user, loading } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  
  // sessionStorage ৰ পৰা চেক কৰক যে ইউজাৰে পাছৱৰ্ড ৰিছেট কৰি আছে নেকি
  const [isRecovering, setIsRecovering] = useState(
    sessionStorage.getItem('is_resetting_password') === 'true'
  )

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      // যদি Supabase য়ে নিজে নিজেই ৰিকভাৰী ইভেণ্ট দিয়ে
      if (event === 'PASSWORD_RECOVERY') {
        sessionStorage.setItem('is_resetting_password', 'true');
        setIsRecovering(true);
      }
    })
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Loading...</div>

  // যদি ৰিছেট ম'ড অন থাকে, তেন্তে জোৰকৈ Login পেজত ৰাখক (Feed লৈ যাবলৈ নিদিব)
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
