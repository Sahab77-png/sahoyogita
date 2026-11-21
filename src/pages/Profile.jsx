import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next' // ইমপৰ্ট কৰক

export default function Profile({ onClose }) {
  const { user } = useAuth()
  const { t } = useTranslation() // t ব্যৱহাৰ কৰক
  
  const [profile, setProfile] = useState(null)
  const [bio, setBio] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (!error) {
      setProfile(data)
      setBio(data.bio || '')
    }
    setLoading(false)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUploading(true)
    let avatarUrl = profile.avatar_url

    // যদি নতুন ছবি বাছনি কৰে, তেন্তে আপলোড কৰক
    if (file) {
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath)
        avatarUrl = publicUrl
      } else {
        alert(t('upload_failed') + uploadError.message)
        setUploading(false)
        return
      }
    }

    // ডাটাবেছ আপডেট কৰক
    const { error } = await supabase
      .from('profiles')
      .update({ bio: bio, avatar_url: avatarUrl })
      .eq('id', user.id)

    if (error) alert(t('update_failed') + error.message)
    else {
      alert(t('profile_updated'))
      setProfile({ ...profile, bio, avatar_url: avatarUrl })
    }
    setUploading(false)
  }

  if (loading) return <div style={{ padding: 20 }}>{t('loading')}</div>

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, background: 'white', borderRadius: 8, border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('my_profile')}</h2>
        <button onClick={onClose} style={{ padding: '5px 10px', cursor: 'pointer' }}>X</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }} />
        ) : (
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 10px' }}>
            {(profile?.username || 'U')[0].toUpperCase()}
          </div>
        )}
        
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ fontSize: 14 }} />
      </div>

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 14, color: '#555' }}>{t('bio')}:</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t('bio_placeholder')}
            rows={3}
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', marginTop: 5 }}
          />
        </div>
        <button type="submit" disabled={uploading} style={{ padding: 12, background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {uploading ? t('saving') : t('save_profile')}
        </button>
      </form>
    </div>
  )
}