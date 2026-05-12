import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
          <span className="text-white/40 text-sm font-display">Loading…</span>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}