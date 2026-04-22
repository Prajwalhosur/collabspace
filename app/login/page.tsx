'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        CollabSpace
      </h1>
      <p style={{ color: '#666' }}>
        A community for developers to build together
      </p>
      <button
        onClick={() => signIn('github', { callbackUrl: '/feed' })}
        style={{
          padding: '12px 24px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Continue with GitHub
      </button>
    </div>
  )
}