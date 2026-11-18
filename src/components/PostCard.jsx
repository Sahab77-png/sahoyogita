import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PostCard({ post, onUpdate, currentUser }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const loadInteractions = async () => {
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(commentsData || [])

    const { data: likesData } = await supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', post.id)
    setLikesCount(likesData?.length || 0)
    setIsLiked(likesData?.some(l => l.user_id === currentUser?.id) || false)
  }

  useEffect(() => { loadInteractions() }, [post.id])

  const toggleLike = async () => {
    if (isLiked) {
      await supabase.from('likes').delete()
        .eq('post_id', post.id).eq('user_id', currentUser.id)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: currentUser.id })
    }
    loadInteractions()
  }

  const addComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    await supabase.from('comments').insert({
      post_id: post.id,
      user_id: currentUser.id,
      content: newComment.trim(),
    })
    setNewComment('')
    loadInteractions()
  }

  const sharePost = async () => {
    const url = window.location.origin + window.location.pathname + '?post=' + post.id
    if (navigator.share) {
      await navigator.share({ title: 'Sahoyogita', text: post.content || '', url })
    } else {
      await navigator.clipboard.writeText(url)
      alert("লিংক কপি হৈ গ'ল!")
    }
  }

  return (
    <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {(post.profiles?.username || 'U')[0].toUpperCase()}
        </div>
        <div>
          <strong>{post.profiles?.full_name || post.profiles?.username || 'User'}</strong>
          <div style={{ fontSize: 12, color: '#666' }}>@{post.profiles?.username}</div>
        </div>
      </div>

      {post.content && <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>}

      {post.media_url && post.media_type === 'video' && (
        <video src={post.media_url} controls style={{ width: '100%', borderRadius: 8 }} />
      )}
      {post.media_url && post.media_type === 'audio' && (
        <audio src={post.media_url} controls style={{ width: '100%', marginTop: 8 }} />
      )}
      {post.media_url && post.media_type === 'image' && (
        <img src={post.media_url} alt="" style={{ width: '100%', borderRadius: 8 }} />
      )}

      <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
        <button onClick={toggleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>
          {isLiked ? '❤️' : '🤍'} {likesCount}
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>
          💬 {comments.length}
        </button>
        <button onClick={sharePost} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>
          🔗 শ্বেয়াৰ
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
          {comments.map(c => (
            <div key={c.id} style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>@{c.profiles?.username}:</strong> {c.content}
            </div>
          ))}
          <form onSubmit={addComment} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              type="text"
              placeholder="কমেন্ট লিখক..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>পঠিয়াওক</button>
          </form>
        </div>
      )}
    </div>
  )
}