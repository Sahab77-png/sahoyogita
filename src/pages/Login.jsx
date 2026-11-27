import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Login({ setIsRecovering, initialView = 'login' }) {
  const { 
    signIn, signUp, verifySignupOtp, sendResetOtp, verifyResetOtp, updatePassword 
  } = useAuth()
  const { t, i18n } = useTranslation()

  const [view, setView] = useState(initialView) 
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    if (view === 'login') {
      const result = await signIn(email, password)
      if (result.error) setError(result.error.message)
    } else if (view === 'signup') {
      const result = await signUp(email, password, username, fullName)
      if (result.error) setError(result.error.message)
      else {
        setMessage(t('otp_sent'))
        setView('signup_otp')
      }
    }
    setLoading(false)
  }

  const handleVerifySignupOtp = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await verifySignupOtp(email, otp)
    if (error) {
      setError(error.message)
    } else {
      alert(t('signup_success'))
      setView('login'); setOtp(''); setPassword('')
    }
    setLoading(false)
  }

  const handleSendResetOtp = async (e) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    const { error } = await sendResetOtp(email)
    if (error) {
      setError(error.message)
    } else {
      setMessage(t('otp_sent'))
      setView('forgot_otp')
    }
    setLoading(false)
  }

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    const { error } = await verifyResetOtp(email, otp)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // সফল হ'লে App.jsx ক কোৱা যে আমি ৰিছেট ম'ডত আছোঁ
      if (setIsRecovering) setIsRecovering(true)
      setView('forgot_reset')
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await updatePassword(newPassword)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      alert(t('password_updated'))
      setNewPassword(''); setPassword('')
      
      // পাছৱৰ্ড ছেভ হোৱাৰ পিছত ৰিছেট ম'ড বন্ধ কৰক (তেতিয়া App.jsx এ Feed দেখুৱাব)
      if (setIsRecovering) setIsRecovering(false)
      setView('login')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <select
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          value={i18n.language}
          style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid #ccc' }}
        >
          <option value="as">অসমীয়া</option>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="bn">বাংলা</option>
          <option value="ar">العربية (Arabic)</option>
          <option value="ur">اردو (Urdu)</option>
        </select>
      </div>

      <h1 style={{ textAlign: 'center' }}>Sahoyogita</h1>

      {(view === 'login' || view === 'signup') && (
        <>
          <h2 style={{ textAlign: 'center' }}>{view === 'signup' ? t('signup') : t('login')}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {view === 'signup' && (
              <>
                <input type="text" placeholder={t('username')} value={username} onChange={(e) => setUsername(e.target.value)} required style={{ padding: 10, fontSize: 16 }} />
                <input type="text" placeholder={t('fullName')} value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: 10, fontSize: 16 }} />
              </>
            )}
            <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: 10, fontSize: 16 }} />
            <input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={{ padding: 10, fontSize: 16 }} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <button type="submit" disabled={loading} style={{ padding: 12, fontSize: 16, background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              {loading ? t('wait') : (view === 'signup' ? t('signup') : t('login'))}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }} style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}>
              {view === 'signup' ? t('loginNow') : t('createAccount')}
            </button>
            <br /><br />
            <button onClick={() => { setView('forgot_email'); setError(''); setMessage('') }} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}>
              {t('forgot_password')}
            </button>
          </div>
        </>
      )}

      {view === 'signup_otp' && (
        <>
          <h2 style={{ textAlign: 'center' }}>{t('verify_email')}</h2>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#555' }}>{t('enter_otp')}</p>
          <form onSubmit={handleVerifySignupOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder={t('otp_code')} value={otp} onChange={(e) => setOtp(e.target.value)} required style={{ padding: 10, fontSize: 16, textAlign: 'center', letterSpacing: 5 }} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ padding: 12, background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>{t('verify')}</button>
            <button type="button" onClick={() => setView('signup')} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline' }}>{t('back')}</button>
          </form>
        </>
      )}

      {view === 'forgot_email' && (
        <>
          <h2 style={{ textAlign: 'center' }}>{t('reset_password')}</h2>
          <form onSubmit={handleSendResetOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: 10, fontSize: 16 }} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <button type="submit" disabled={loading} style={{ padding: 12, background: '#0066cc', color: 'white', border: 'none', borderRadius: 4 }}>{t('send_otp')}</button>
            <button type="button" onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline' }}>{t('cancel')}</button>
          </form>
        </>
      )}

      {view === 'forgot_otp' && (
        <>
          <h2 style={{ textAlign: 'center' }}>{t('enter_otp_title')}</h2>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#555' }}>{t('enter_otp')}</p>
          <form onSubmit={handleVerifyResetOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder={t('otp_code')} value={otp} onChange={(e) => setOtp(e.target.value)} required style={{ padding: 10, fontSize: 16, textAlign: 'center', letterSpacing: 5 }} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ padding: 12, background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>{t('verify')}</button>
          </form>
        </>
      )}

      {view === 'forgot_reset' && (
        <>
          <h2 style={{ textAlign: 'center' }}>{t('reset_password')}</h2>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="password" placeholder={t('new_password')} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={{ padding: 10, fontSize: 16 }} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ padding: 12, background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>{t('save_password')}</button>
          </form>
        </>
      )}
    </div>
  )
}
