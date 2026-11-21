import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next' // ইমপৰ্ট কৰক

export default function UploadForm({ onPosted }) {
  const { user } = useAuth()
  const { t } = useTranslation() // t ব্যৱহাৰ কৰক
  
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !file) return
    setUploading(true)

    let mediaUrl = null
    let mediaType = 'none'

    if (file) {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) {
        alert(t('upload_failed') + uploadError.message) // অনুবাদ কৰা হ'ল
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)
      mediaUrl = publicUrl
      mediaType = file.type.startsWith('video') ? 'video'
        : file.type.startsWith('audio') ? 'audio'
        : 'image'
    }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: content.trim() || null,
      media_url: mediaUrl,
      media_type: mediaType,
    })

    if (error) alert(t('post_failed') + error.message) // অনুবাদ কৰা হ'ল
    else {
      setContent('')
      setFile(null)
      e.target.reset()
      onPosted()
    }
    setUploading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 20 }}>
      <textarea
        placeholder={t('post_placeholder')}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
        <input type="file" accept="image/*,video/*,audio/*" onChange={(e) => setFile(e.target.files[0])} />
        <button
          type="submit"
          disabled={uploading}
          style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginLeft: 'auto' }}
        >
          {uploading ? t('uploading') : t('post_button')}
        </button>
      </div>
    </form>
  )
}
