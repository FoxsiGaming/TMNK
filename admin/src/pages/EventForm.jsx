import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'

const emptyEvent = {
  title: '',
  title_en: '',
  description: '',
  description_en: '',
  date: '',
  location: '',
  image_url: '',
  published: false,
}

export default function EventForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyEvent)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              ...data,
              date: data.date ? new Date(data.date).toISOString().slice(0, 16) : '',
            })
          }
          setLoading(false)
        })
    }
  }, [id, isNew])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      date: form.date ? new Date(form.date).toISOString() : null,
    }
    delete payload.id
    delete payload.created_at
    delete payload.updated_at

    if (isNew) {
      const { error } = await supabase.from('events').insert(payload)
      if (error) alert('Error: ' + error.message)
      else navigate('/events')
    } else {
      const { error } = await supabase.from('events').update(payload).eq('id', id)
      if (error) alert('Error: ' + error.message)
      else navigate('/events')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to events
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 m-0">
            {isNew ? 'Create Event' : 'Edit Event'}
          </h2>

          {/* Title ET */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (Estonian) *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
            />
          </div>

          {/* Title EN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (English)
            </label>
            <input
              type="text"
              value={form.title_en}
              onChange={(e) => handleChange('title_en', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
            />
          </div>

          {/* Description ET */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Estonian)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border resize-y"
            />
          </div>

          {/* Description EN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (English)
            </label>
            <textarea
              value={form.description_en}
              onChange={(e) => handleChange('description_en', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border resize-y"
            />
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
                placeholder="e.g. Tallinn, Vabaduse plats"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <ImageUpload
              bucket="events"
              currentUrl={form.image_url}
              onUpload={(url) => handleChange('image_url', url)}
            />
          </div>

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => handleChange('published', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Published (visible on site)</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer border-none transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : isNew ? 'Create Event' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
