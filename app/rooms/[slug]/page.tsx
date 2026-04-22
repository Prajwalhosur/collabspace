'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { pusherClient } from '@/lib/pusher-client'

interface Message {
  id: string
  content: string
  createdAt: string
  author: { name: string | null; image: string | null }
}

interface Room {
  id: string
  name: string
  description: string | null
  tags: string[]
}

export default function RoomPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/rooms/${slug}`)
      .then(res => res.json())
      .then(data => {
        setRoom(data.room)
        setMessages(data.posts)
      })
      .catch(err => console.error('Fetch error:', err))
  }, [slug])

  useEffect(() => {
    if (!room) return
    const channel = pusherClient.subscribe(`room-${room.id}`)
    channel.bind('new-message', (message: Message) => {
      setMessages(prev => [message, ...prev])
    })
    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(`room-${room.id}`)
    }
  }, [room])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!content.trim()) return
    setSending(true)
    await fetch(`/api/rooms/${slug}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    setContent('')
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!room) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => router.push('/feed')}
          style={{ background: '#2a2a2a', border: 'none', cursor: 'pointer', color: '#aaa', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}
        >
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff', margin: 0 }}>{room.name}</h1>
          {room.description && <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{room.description}</p>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column-reverse', gap: '1rem' }}>
        <div ref={bottomRef} />
        {messages.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', marginTop: '2rem' }}>No messages yet. Say hello! 👋</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {msg.author.image ? (
                <img src={msg.author.image} style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, border: '2px solid #2a2a2a' }} />
              ) : (
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#333', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '14px' }}>
                  {msg.author.name?.[0] ?? '?'}
                </div>
              )}
              <div style={{ background: '#1a1a1a', padding: '10px 14px', borderRadius: '12px', border: '1px solid #2a2a2a', maxWidth: '70%' }}>
                <p style={{ fontWeight: '500', fontSize: '12px', color: '#888', marginBottom: '4px', margin: '0 0 4px 0' }}>
                  {msg.author.name}
                </p>
                <p style={{ lineHeight: '1.5', color: '#e0e0e0', margin: 0 }}>{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div style={{ background: '#1a1a1a', borderTop: '1px solid #2a2a2a', padding: '1rem 2rem', display: 'flex', gap: '10px' }}>
        <textarea
          placeholder="Type a message... (Enter to send)"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #333', fontSize: '15px', resize: 'none', background: '#2a2a2a', color: '#fff', outline: 'none' }}
        />
        <button
          onClick={sendMessage}
          disabled={sending}
          style={{ padding: '10px 24px', background: sending ? '#333' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', cursor: sending ? 'not-allowed' : 'pointer', fontWeight: '500', alignSelf: 'flex-end', fontSize: '15px' }}
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}