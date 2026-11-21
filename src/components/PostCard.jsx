
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from 'react-i18next' // ইমপৰ্ট কৰক

export default function PostCard({ post, onUpdate, currentUser }) {
  const { t, i18n } = useTranslation() // i18n যোগ কৰক (তাৰিখৰ ভাষাৰ বাবে)
  
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content || '')
  
  // নতুন: views ষ্টেট
  const [views, setViews] = useState(post.views || 0)

  // নতুন: পোষ্ট চালেই ভিউ বঢ়োৱাৰ লজিক (localStorage ৰ জৰিয়তে বাৰে বাৰে বাঢ়ি নাযায়)
  useEffect(() => {
    const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '[]')
    
    if (!viewedPosts.includes(post.id)) {
      supabase.rpc('increment_post_view', { post_id: post.id }).then(({ error }) => {
        if (!error) {
          setViews(prev => prev + 1)
          viewedPosts.push(post.id)
          localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts))
        }
      })
    }
  }, [post.id])

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
      alert(t('copy_success'))
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm(t('confirm_delete'))
    if (confirmDelete) {
      await supabase.from('posts').delete().eq('id', post.id)
      onUpdate()
    }
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return
    await supabase.from('posts').update({ content: editContent }).eq('id', post.id)
    setIsEditing(false)
    onUpdate()
  }

  return (
    <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* ইউজাৰৰ নাম আৰু আভাটাৰ */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          {post.profiles?.avatar_url ? (
            <img src={post.profiles.avatar_url} alt="Avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {(post.profiles?.username || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <strong>{post.profiles?.full_name || post.profiles?.username || 'User'}</strong>
            <div style={{ fontSize: 12, color: '#666' }}>
              @{post.profiles?.username} • {' '}
              {/* তাৰিখ আৰু সময় */}
              {new Intl.DateTimeFormat(i18n.language, { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
              }).format(new Date(post.created_at))}
            </div>
          </div>
        </div>

        {/* এডিট/ডিলিট বুটাম */}
        {currentUser?.id === post.user_id && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0066cc' }}>
              ✏️ {t('edit')}
            </button>
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>
              🗑️ {t('delete')}
            </button>
          </div>
        )}
      </div>

      {/* এডিট ম'ড আৰু নৰ্মেল ম'ড */}
      {isEditing ? (
        <div style={{ marginTop: 10 }}>
          <textarea 
            value={editContent} 
            onChange={(e) => setEditContent(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            rows={3}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={handleSaveEdit} style={{ padding: '5px 15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>{t('save')}</button>
            <button onClick={() => setIsEditing(false)} style={{ padding: '5px 15px', background: '#ccc', color: 'black', border: 'none', borderRadius: 4 }}>{t('cancel')}</button>
          </div>
        </div>
      ) : (
        post.content && <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
      )}

      {post.media_url && post.media_type === 'video' && (
        <video src={post.media_url} controls style={{ width: '100%', borderRadius: 8, marginTop: 10 }} />
      )}
      {post.media_url && post.media_type === 'audio' && (
        <audio src={post.media_url} controls style={{ width: '100%', marginTop: 10 }} />
      )}
      {post.media_url && post.media_type === 'image' && (
        <img src={post.media_url} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 10 }} />
      )}

      <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
        <button onClick={toggleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>
          {isLiked ? '❤️' : '🤍'} {likesCount}
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>
          💬 {comments.length}
        </button>
        <button onClick={sharePost} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>
          🔗 {t('share')}
        </button>
        
        {/* নতুন: ভিউ কাউন্টাৰ */}
        <span style={{ fontSize: 15, color: '#666', display: 'flex', alignItems: 'center' }}>
          👁️ {views} {t('views')}
        </span>
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
              placeholder={t('comment_placeholder')}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>{t('send')}</button>
          </form>
        </div>
      )}
    </div>
  )
}
