import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import UploadForm from '../components/UploadForm'
import PostCard from '../components/PostCard'

export default function Feed() {
  const { user, signOut } = useAuth()
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
        <button onClick={signOut} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          লগআউট
        </button>
      </div>

      <UploadForm onPosted={fetchPosts} />

      {loading ? (
        <p>লোড হৈ আছে...</p>
      ) : posts.length === 0 ? (
        <p>এতিয়ালৈকে কোনো পোষ্ট নাই। প্ৰথমটো পোষ্ট আপুনিয়েই কৰক!</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} onUpdate={fetchPosts} currentUser={user} />)
      )}
    </div>
  )
}