import { useEffect, useState, useRef } from 'react'
import { Upload, Trash2, X, FolderPlus, Pencil } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState('all')
  const [albums, setAlbums] = useState([])
  const [newAlbum, setNewAlbum] = useState('')
  const [showAlbumInput, setShowAlbumInput] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedImages, setSelectedImages] = useState(new Set())
  const [lightbox, setLightbox] = useState(null)
  const inputRef = useRef(null)

  const fetchImages = async () => {
    let query = supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })

    if (selectedAlbum !== 'all') {
      query = query.eq('album', selectedAlbum)
    }

    const { data } = await query
    setImages(data || [])

    // Fetch distinct albums
    const { data: allImages } = await supabase
      .from('gallery')
      .select('album')
    const uniqueAlbums = [...new Set((allImages || []).map(i => i.album).filter(Boolean))]
    setAlbums(uniqueAlbums)

    setLoading(false)
  }

  useEffect(() => { fetchImages() }, [selectedAlbum])

  const uploadFiles = async (files) => {
    setUploading(true)
    const album = selectedAlbum === 'all' ? null : selectedAlbum

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue

      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName)

      await supabase.from('gallery').insert({
        image_url: urlData.publicUrl,
        caption: '',
        title: '',
        place: '',
        photo_date: null,
        album: album,
      })
    }

    setUploading(false)
    fetchImages()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    uploadFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileInput = (e) => {
    uploadFiles(Array.from(e.target.files))
  }

  const updateImage = async (id) => {
    const title = document.getElementById(`title-${id}`)?.value || ''
    const place = document.getElementById(`place-${id}`)?.value || ''
    const photoDate = document.getElementById(`date-${id}`)?.value || null
    const caption = document.getElementById(`caption-et-${id}`)?.value || ''
    const captionEn = document.getElementById(`caption-en-${id}`)?.value || ''

    await supabase.from('gallery').update({
      title,
      place,
      photo_date: photoDate || null,
      caption,
      caption_en: captionEn,
    }).eq('id', id)

    setEditingId(null)
    fetchImages()
  }

  const deleteSelected = async () => {
    if (selectedImages.size === 0) return
    if (!confirm(`Delete ${selectedImages.size} image(s)?`)) return

    for (const id of selectedImages) {
      await supabase.from('gallery').delete().eq('id', id)
    }
    setSelectedImages(new Set())
    fetchImages()
  }

  const deleteImage = async (id) => {
    if (!confirm('Delete this image?')) return
    await supabase.from('gallery').delete().eq('id', id)
    fetchImages()
  }

  const toggleSelect = (id) => {
    setSelectedImages((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const createAlbum = () => {
    if (newAlbum.trim()) {
      setSelectedAlbum(newAlbum.trim())
      setNewAlbum('')
      setShowAlbumInput(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Album filter */}
        <select
          value={selectedAlbum}
          onChange={(e) => setSelectedAlbum(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Albums</option>
          {albums.map((album) => (
            <option key={album} value={album}>{album}</option>
          ))}
        </select>

        {showAlbumInput ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAlbum}
              onChange={(e) => setNewAlbum(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createAlbum()}
              placeholder="Album name"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 box-border"
              autoFocus
            />
            <button
              onClick={createAlbum}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm cursor-pointer border-none hover:bg-indigo-700"
            >
              Create
            </button>
            <button
              onClick={() => setShowAlbumInput(false)}
              className="p-2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAlbumInput(true)}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <FolderPlus size={14} />
            New Album
          </button>
        )}

        <div className="flex-1" />

        {selectedImages.size > 0 && (
          <button
            onClick={deleteSelected}
            className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm cursor-pointer hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} />
            Delete {selectedImages.size} selected
          </button>
        )}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer border-none transition-colors"
        >
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Drop zone / Grid */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="min-h-[300px]"
      >
        {images.length === 0 ? (
          <div
            className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-1">Drop images here or click to upload</p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB each</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className={`group relative bg-white rounded-lg border overflow-hidden ${
                  selectedImages.has(img.id) ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
                }`}
              >
                <div className="aspect-square relative">
                  <img
                    src={img.image_url}
                    alt={img.caption || ''}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setLightbox(img)}
                  />

                  {/* Select checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(img.id)}
                      onChange={() => toggleSelect(img.id)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none hover:bg-black/70"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-2">
                  {editingId === img.id ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        defaultValue={img.title || ''}
                        id={`title-${img.id}`}
                        placeholder="Title"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 box-border"
                        autoFocus
                      />
                      <input
                        type="text"
                        defaultValue={img.place || ''}
                        id={`place-${img.id}`}
                        placeholder="Place"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 box-border"
                      />
                      <input
                        type="date"
                        defaultValue={img.photo_date || ''}
                        id={`date-${img.id}`}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 box-border"
                      />
                      <input
                        type="text"
                        defaultValue={img.caption || ''}
                        id={`caption-et-${img.id}`}
                        placeholder="Caption (ET)"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 box-border"
                      />
                      <input
                        type="text"
                        defaultValue={img.caption_en || ''}
                        id={`caption-en-${img.id}`}
                        placeholder="Caption (EN)"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 box-border"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateImage(img.id)}
                          className="flex-1 px-2 py-1 bg-indigo-600 text-white rounded text-xs cursor-pointer border-none"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-gray-500 rounded text-xs cursor-pointer border border-gray-300 bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingId(img.id)}
                      className="cursor-pointer hover:bg-gray-50 rounded -m-1 p-1"
                      title="Click to edit details"
                    >
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {img.title || <span className="text-gray-400 italic">No title</span>}
                      </p>
                      {(img.place || img.photo_date) && (
                        <p className="text-xs text-gray-400 truncate">
                          {[img.place, img.photo_date].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-transparent border-none cursor-pointer"
            onClick={() => setLightbox(null)}
          >
            <X size={32} />
          </button>
          <img
            src={lightbox.image_url}
            alt={lightbox.caption || ''}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {(lightbox.title || lightbox.caption || lightbox.place || lightbox.photo_date) && (
            <div className="absolute bottom-8 text-white text-sm bg-black/50 px-4 py-2 rounded-lg text-center">
              {lightbox.title && <p className="font-medium">{lightbox.title}</p>}
              {lightbox.caption && <p>{lightbox.caption}</p>}
              {(lightbox.place || lightbox.photo_date) && (
                <p className="text-xs text-gray-300 mt-1">
                  {[lightbox.place, lightbox.photo_date].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
