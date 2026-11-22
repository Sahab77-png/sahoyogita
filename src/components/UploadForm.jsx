
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function UploadForm({ onPosted }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // নতুন: ফাইলৰ ছাইজ চেক কৰাৰ ফাংচন
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    
    if (selectedFile) {
      // ফাইলৰ ছাইজ ২০ MB ৰ ভিতৰত হ'ব লাগিব
      if (selectedFile.size > 20 * 1024 * 1024) {
        alert(t('file_too_large'))
        e.target.value = null // ইউজাৰে যাতে ডাঙৰ ফাইল বাছনি কৰিব নোৱাৰে
        return
      }
      setFile(selectedFile)
    }
  }

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
        alert(t('upload_failed') + uploadError.message)
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

    if (error) alert(t('post_failed') + error.message)
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
        
        {/* ইয়াত onChange={handleFileChange} দিয়া হৈছে */}
        <input 
          type="file" 
          accept="image/*,video/*,audio/*" 
          onChange={handleFileChange} 
        />
        
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
