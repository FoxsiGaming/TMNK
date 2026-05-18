import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'

const emptyMember = {
  name: '',
  role: '',
  role_en: '',
  bio: '',
  bio_en: '',
  email: '',
  photo_url: '',
  portfolio_url: '',
  age: '',
  sort_order: 0,
  active: true,
}

export default function MemberForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyMember)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) setForm(data)
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

    const payload = { ...form }
    delete payload.id
    delete payload.created_at
    delete payload.updated_at

    if (isNew) {
      const { error } = await supabase.from('members').insert(payload)
      if (error) alert('Error: ' + error.message)
      else navigate('/members')
    } else {
      const { error } = await supabase.from('members').update(payload).eq('id', id)
      if (error) alert('Error: ' + error.message)
      else navigate('/members')
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
        onClick={() => navigate('/members')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to members
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 m-0">
            {isNew ? 'Add Member' : 'Edit Member'}
          </h2>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <ImageUpload
              bucket="members"
              currentUrl={form.photo_url}
              onUpload={(url) => handleChange('photo_url', url)}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
            />
          </div>

          {/* Role ET / EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role (Estonian)
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
                placeholder="e.g. President"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role (English)
              </label>
              <input
                type="text"
                value={form.role_en}
                onChange={(e) => handleChange('role_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
                placeholder="e.g. President"
              />
            </div>
          </div>

          {/* Bio ET */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio (Estonian)
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border resize-y"
            />
          </div>

          {/* Bio EN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio (English)
            </label>
            <textarea
              value={form.bio_en}
              onChange={(e) => handleChange('bio_en', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border resize-y"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
            />
          </div>

          {/* Portfolio & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio URL
              </label>
              <input
                type="url"
                value={form.portfolio_url}
                onChange={(e) => handleChange('portfolio_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
                placeholder="e.g. 18"
              />
            </div>
          </div>

          {/* Sort order & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent box-border"
              />
              <p className="text-xs text-gray-400 mt-1">Lower number = shown first</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer pb-1">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Active member</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer border-none transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : isNew ? 'Add Member' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
