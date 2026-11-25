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
    
const handleFileChange = (e) => {
  const selectedFile = e.target.files[0]
  if (selectedFile) {
    // ইয়াত ২০ ৰ পৰিৱৰ্তে ৫০ কৰি দিয়া হৈছে
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert(t('file_too_large')) 
      e.target.value = null
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
      const fileName = `${user.id}/${Date.now()}.${fileExt}` // ফাইলৰ নাম

      try {
        // ১. Supabase Edge Function ৰ পৰা Presigned URL লওক
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-r2-upload-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ 
            fileName: fileName, 
            fileType: file.type 
          })
        });
        
        const { url, error } = await res.json();
        if (error) throw new Error(error);

        // ২. পোনপটীয়াকৈ Cloudflare R2 লৈ ফাইল আপলোড কৰক
        const uploadRes = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });

        if (!uploadRes.ok) throw new Error('R2 Upload failed');

        // ৩. ৰাজহুৱা লিংকটো ছেভ কৰক
        mediaUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${fileName}`;
        mediaType = file.type.startsWith('video') ? 'video'
          : file.type.startsWith('audio') ? 'audio'
          : 'image';

      } catch (err) {
        console.error(err);
        alert(t('upload_failed') + err.message)
        setUploading(false)
        return
      }
    }

    // ৪. ডাটাবেছত পোষ্টটো ছেভ কৰক
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
