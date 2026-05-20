import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('members')
      .select('*')
      .order('sort_order', { ascending: true })
    setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMembers() }, [])

  const toggleActive = async (id, current) => {
    await supabase.from('members').update({ active: !current }).eq('id', id)
    fetchMembers()
  }

  const deleteMember = async (id) => {
    if (!confirm('Remove this member?')) return
    await supabase.from('members').delete().eq('id', id)
    fetchMembers()
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        <Link
          to="/members/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 no-underline transition-colors"
        >
          <Plus size={16} />
          Add Member
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No members yet. Add your first team member!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${
                !member.active ? 'opacity-60' : ''
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{member.name}</p>
                    <p className="text-sm text-gray-500 truncate">{member.role || 'No role'}</p>
                    {!member.active && (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
                <button
                  onClick={() => toggleActive(member.id, member.active)}
                  className="text-xs text-gray-500 hover:text-indigo-600 bg-transparent border-none cursor-pointer"
                >
                  {member.active ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 bg-transparent border-none cursor-pointer rounded hover:bg-gray-200"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer rounded hover:bg-gray-200"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
