import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import UploadForm from '../components/UploadForm'
import PostCard from '../components/PostCard'
import { useTranslation } from 'react-i18next' // ইমপৰ্ট কৰক

// onOpenProfile প্ৰপটো গ্ৰহণ কৰক
export default function Feed({ onOpenProfile }) { 
  const { user, signOut } = useAuth()
  const { t } = useTranslation() // t ব্যৱহাৰ কৰক
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, full_name, avatar_url)')
      .order('created_at', { ascending: false })
    if (!error) setPosts(data)
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Sahoyogita</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* প্ৰফাইল বুটাম */}
          <button onClick={onOpenProfile} style={{ padding: '8px 16px', cursor: 'pointer', background: '#0066cc', color: 'white', border: 'none', borderRadius: 4 }}>
            {t('my_profile')}
          </button>
          <button onClick={signOut} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            {t('logout')}
          </button>
        </div>
      </div>

      <UploadForm onPosted={fetchPosts} />

      {loading ? (
        <p>{t('loading')}</p>
      ) : posts.length === 0 ? (
        <p>{t('no_posts')}</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} onUpdate={fetchPosts} currentUser={user} />)
      )}
    </div>
  )
}