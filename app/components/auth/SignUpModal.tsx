'use client'
import { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff, User, Shirt, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function SignUpModal({ isOpen, onClose, onSwitchToLogin }: SignUpModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'user' | 'stylist'>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!fullName.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, fullName, role)
      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="apple-modal p-8 w-full max-w-sm mx-4 animate-scale-in">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-dark-text-primary">Create Account</h2>
          <button
            onClick={onClose}
            className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-accent-green" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-dark-text-primary">Check your email</h3>
              <p className="text-dark-text-secondary text-sm">
                We've sent you a confirmation link to verify your account.
              </p>
            </div>
            <button
              onClick={onClose}
              className="apple-button-primary"
            >
              Got it
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-text-secondary">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-text-tertiary" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="apple-input pl-10 w-full"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-text-secondary">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="apple-input pl-10 w-full"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Minimal Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-dark-text-secondary">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-4 rounded-xl border transition-all ${
                    role === 'user'
                      ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                      : 'border-dark-border bg-dark-card text-dark-text-secondary hover:border-dark-text-tertiary'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium text-sm">Client</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRole('stylist')}
                  className={`p-4 rounded-xl border transition-all ${
                    role === 'stylist'
                      ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                      : 'border-dark-border bg-dark-card text-dark-text-secondary hover:border-dark-text-tertiary'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Shirt className="h-5 w-5" />
                    <span className="font-medium text-sm">Stylist</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-text-secondary">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="apple-input pl-10 pr-12 w-full"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-text-tertiary hover:text-dark-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-text-secondary">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-text-tertiary" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="apple-input pl-10 pr-12 w-full"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-text-tertiary hover:text-dark-text-secondary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-system-red text-sm bg-system-red/10 p-3 rounded-xl border border-system-red/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="apple-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-dark-text-secondary text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-accent-blue hover:text-accent-blue-muted font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
} 