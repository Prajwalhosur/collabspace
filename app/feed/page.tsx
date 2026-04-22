'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Room {
  id: string
  name: string
  slug: string
  description: string | null
  tags: string[]
  _count: { members: number; posts: number }
}

export default function FeedPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => { setRooms(data); setLoading(false) })
  }, [])

  const createRoom = async () => {
    if (!name.trim()) return
    setCreating(true)
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, tags: [], isPublic: true })
    })
    const room = await res.json()
    setCreating(false)
    if (res.ok) {
      setShowCreate(false)
      setName('')
      setDescription('')
      router.push(`/rooms/${room.slug}`)
    } else {
      alert(room.error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      
      {/* Header */}
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#fff' }}>CollabSpace</h1>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>A community for developers</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
        >
          + Create Room
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>

        {/* Create Room Form */}
        {showCreate && (
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Create a Room</h2>
            <input
              placeholder="Room name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #333', fontSize: '15px', background: '#2a2a2a', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', marginBottom: '14px', borderRadius: '8px', border: '1px solid #333', fontSize: '15px', background: '#2a2a2a', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={createRoom}
                disabled={creating}
                style={{ padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                style={{ padding: '10px 20px', background: '#2a2a2a', color: '#aaa', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Room List */}
        {loading ? (
          <p style={{ color: '#555', textAlign: 'center', marginTop: '3rem' }}>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <p style={{ color: '#555', fontSize: '1.1rem' }}>No rooms yet.</p>
            <p style={{ color: '#444', fontSize: '14px' }}>Create the first one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {rooms.map(room => (
              <div
                key={room.id}
                onClick={() => router.push(`/rooms/${room.slug}`)}
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#4f46e5')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
              >
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>{room.name}</h2>
                {room.description && (
                  <p style={{ color: '#888', marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>{room.description}</p>
                )}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '13px', color: '#666' }}>
                  <span>👥 {room._count.members} members</span>
                  <span>💬 {room._count.posts} posts</span>
                </div>
                {room.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {room.tags.map(tag => (
                      <span key={tag} style={{ background: '#2a2a2a', color: '#888', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', border: '1px solid #333' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}