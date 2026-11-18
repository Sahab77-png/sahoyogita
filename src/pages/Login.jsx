import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next' // লাইব্ৰেৰী ইমপৰ্ট কৰক

export default function Login() {
  const { signIn, signUp } = useAuth()
  const { t, i18n } = useTranslation() // t = অনুবাদ, i18n = ভাষা সলনি
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = isSignUp
      ? await signUp(email, password, username, fullName)
      : await signIn(email, password)

    if (result.error) setError(result.error.message)
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
      
      {/* ভাষা সলনি কৰাৰ বাবে ড্ৰপডাউন */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <select
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          value={i18n.language}
          style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid #ccc' }}
        >
          <option value="as">অসমীয়া</option>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          {/* আপুনি ইয়াত আৰু ভাষা যোগ কৰিব পাৰে */}
        </select>
      </div>

      <h1 style={{ textAlign: 'center' }}>Sahoyogita</h1>
      <h2 style={{ textAlign: 'center' }}>{isSignUp ? t('signup') : t('login')}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isSignUp && (
          <>
            <input
              type="text"
              placeholder={t('username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ padding: 10, fontSize: 16 }}
            />
            <input
              type="text"
              placeholder={t('fullName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ padding: 10, fontSize: 16 }}
            />
          </>
        )}
        <input
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10, fontSize: 16 }}
        />
        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ padding: 10, fontSize: 16 }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: 12, fontSize: 16, background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          {loading ? t('wait') : (isSignUp ? t('signup') : t('login'))}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isSignUp ? t('loginNow') : t('createAccount')}
        </button>
      </p>
    </div>
  )
}