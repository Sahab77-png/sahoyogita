import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, username, fullName) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName }
      }
    })
  }

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  // নতুন: ছাইন আপ OTP ভেৰিফাই
  const verifySignupOtp = async (email, token) => {
    return await supabase.auth.verifyOtp({ email, token, type: 'signup' })
  }

  // নতুন: পাছৱৰ্ড ৰিছেট OTP পঠিওৱা
  const sendResetOtp = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email)
  }

  // নতুন: পাছৱৰ্ড ৰিছেট OTP ভেৰিফাই
  const verifyResetOtp = async (email, token) => {
    return await supabase.auth.verifyOtp({ email, token, type: 'recovery' })
  }

  // নতুন: নতুন পাছৱৰ্ড ছেভ কৰা
  const updatePassword = async (newPassword) => {
    return await supabase.auth.updateUser({ password: newPassword })
  }

  return (
    <AuthContext.Provider value={{ 
      user, loading, signUp, signIn, signOut, 
      verifySignupOtp, sendResetOtp, verifyResetOtp, updatePassword 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)