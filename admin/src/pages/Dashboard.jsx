import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, Image, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ events: 0, members: 0, gallery: 0 })
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [eventsRes, membersRes, galleryRes, recentRes] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('gallery').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('*').order('date', { ascending: false }).limit(5),
      ])

      setStats({
        events: eventsRes.count || 0,
        members: membersRes.count || 0,
        gallery: galleryRes.count || 0,
      })
      setRecentEvents(recentRes.data || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Events', value: stats.events, icon: Calendar, path: '/events', color: 'bg-blue-500' },
    { label: 'Members', value: stats.members, icon: Users, path: '/members', color: 'bg-emerald-500' },
    { label: 'Gallery', value: stats.gallery, icon: Image, path: '/gallery', color: 'bg-purple-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, path, color }) => (
          <Link
            key={label}
            to={path}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow no-underline group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`${color} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-indigo-600 group-hover:gap-2 transition-all">
              Manage <ArrowRight size={14} className="ml-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent events */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 m-0">Recent Events</h2>
          <Link to="/events" className="text-sm text-indigo-600 hover:text-indigo-700 no-underline">
            View all
          </Link>
        </div>
        {recentEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No events yet.{' '}
            <Link to="/events/new" className="text-indigo-600 no-underline">
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 no-underline transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('et-EE', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {event.published ? 'Published' : 'Draft'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
