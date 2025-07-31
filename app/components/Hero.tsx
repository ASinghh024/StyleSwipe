'use client'
import { ArrowRight, Shirt, LayoutDashboard, Heart, Briefcase } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import LoginModal from './auth/LoginModal'
import SignUpModal from './auth/SignUpModal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Hero() {
  const { user, userProfile } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const router = useRouter()

  const handleGetStartedClick = () => {
    if (user) {
      // User is logged in - redirect based on role
      if (userProfile?.role === 'stylist') {
        router.push('/stylist-dashboard')
      } else {
        router.push('/swipe')
      }
    } else {
      // User is not logged in - show signup modal
      setShowSignUp(true)
    }
  }

  // Different content for stylists vs regular users
  const isStylist = userProfile?.role === 'stylist'

  // Get first name from full name
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0]
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-bg">
        {/* Subtle background elements - minimal and dark */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface/20 to-dark-bg"></div>
        
        {/* Minimal floating elements */}
        <div className="absolute top-32 left-16 w-2 h-2 bg-dark-text-tertiary/40 rounded-full"></div>
        <div className="absolute top-48 right-24 w-1 h-1 bg-dark-text-tertiary/30 rounded-full"></div>
        <div className="absolute bottom-48 left-32 w-1.5 h-1.5 bg-dark-text-tertiary/20 rounded-full"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Badge removed as requested */}

            {/* Clean, minimal headline */}
            {isStylist ? (
              <h1 className="text-4xl md:text-6xl font-semibold text-dark-text-primary leading-tight tracking-tight">
                Welcome back,{' '}
                <span className="text-accent-blue">
                  {userProfile?.full_name ? getFirstName(userProfile.full_name) : 'Stylist'}
                </span>
              </h1>
            ) : (
              <h1 className="text-4xl md:text-6xl font-semibold text-dark-text-primary leading-tight tracking-tight">
                Find Your Perfect{' '}
                <span className="text-accent-blue">Stylist</span>
              </h1>
            )}

            {/* Simplified subtext */}
            {isStylist ? (
              <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto leading-relaxed">
                Manage your profile, connect with clients, and grow your styling business.
              </p>
            ) : (
              <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto leading-relaxed">
                Connect with fashion experts tailored to your style preferences.
              </p>
            )}

            {/* Apple-style CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isStylist ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => router.push('/stylist-dashboard')}
                    className="apple-button-primary flex items-center space-x-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  <button 
                    onClick={() => router.push('/matches')}
                    className="apple-button-secondary flex items-center space-x-2"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Matches</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleGetStartedClick}
                    className="apple-button-primary flex items-center space-x-2"
                  >
                    <span>{user ? 'Start Swiping' : 'Get Started'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link 
                    href="/stylist-landing"
                    className="apple-button-secondary flex items-center space-x-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>For Stylists</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Minimal stats */}
            {isStylist ? (
              <div className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold text-dark-text-primary">25+</div>
                  <div className="text-sm text-dark-text-tertiary">Matches</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold text-dark-text-primary">4.8</div>
                  <div className="text-sm text-dark-text-tertiary">Rating</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold text-dark-text-primary">150+</div>
                  <div className="text-sm text-dark-text-tertiary">Views</div>
                </div>
              </div>
            ) : (
              <div className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold text-dark-text-primary">10K+</div>
                  <div className="text-sm text-dark-text-tertiary">Users</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold text-dark-text-primary">500+</div>
                  <div className="text-sm text-dark-text-tertiary">Stylists</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold text-dark-text-primary">95%</div>
                  <div className="text-sm text-dark-text-tertiary">Satisfaction</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignUp={() => {
          setShowLogin(false)
          setShowSignUp(true)
        }}
      />

      <SignUpModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToLogin={() => {
          setShowSignUp(false)
          setShowLogin(true)
        }}
      />
    </>
  )
}