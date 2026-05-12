import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error,   setError]       = useState(null)
  const [success, setSuccess]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError(null)
    const { data, error: err } = await signUp(email, password, fullName)
    setLoading(false)
    if (err) { setError(err.message); return }
    if (data?.session) { navigate('/dashboard'); return }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-400 flex items-center justify-center p-4">
        <div className="card max-w-sm w-full text-center animate-fadeInUp">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="font-display font-bold text-white text-xl mb-2">Check your email</h2>
          <p className="text-white/50 text-sm mb-5">
            We sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link to="/login" className="btn-gold inline-block">Back to Sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-400 flex items-center justify-center p-4 grid-pattern">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fadeInUp relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-gradient mb-4 glow-gold">
            <span className="text-black font-bold font-display text-2xl">ذ</span>
          </div>
          <h1 className="font-display font-bold text-white text-2xl">Create account</h1>
          <p className="text-white/40 text-sm mt-1">Track gold & stocks in the UAE</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                required
                placeholder="Ahmed Al Marzouqi"
                className="input-dark"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="input-dark"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="input-dark pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 rounded-xl px-3 py-2 border border-red-400/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : 'Create account'
              }
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}