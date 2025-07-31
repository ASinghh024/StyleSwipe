'use client'
import { useState } from 'react'
import { Shirt, User, LogOut, Heart, Users, LayoutDashboard, Briefcase, Camera } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './auth/LoginModal'
import SignUpModal from './auth/SignUpModal'
import StylistProfileModal from './auth/StylistProfileModal'
import Link from 'next/link'

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showStylistProfile, setShowStylistProfile] = useState(false)

  console.log('Navbar render - showLogin:', showLogin, 'showSignUp:', showSignUp, 'user:', user?.email, 'role:', userProfile?.role)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleProfileClick = () => {
    if (userProfile?.role === 'stylist') {
      setShowStylistProfile(true)
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-apple border-b border-dark-border/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Minimal Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/">
                <div className="flex items-center space-x-3">
                  <Shirt className="h-6 w-6 text-accent-blue" />
                  <span className="text-xl font-semibold text-dark-text-primary">
                    StyleSwipe
                  </span>
                </div>
              </Link>
            </div>

            {/* Clean Navigation */}
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* Role-based navigation */}
                  {userProfile?.role === 'admin' as any ? (
                    <Link
                      href="/admin/dashboard"
                      className="apple-button-secondary flex items-center space-x-2 text-sm"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  ) : userProfile?.role === 'stylist' ? (
                    <>
                      <Link
                        href="/stylist-dashboard"
                        className="apple-button-secondary flex items-center space-x-2 text-sm"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href={`/stylist/${user?.id}`}
                        className="apple-button-secondary flex items-center space-x-2 text-sm"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Your Catalog</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/swipe"
                        className="apple-button-secondary flex items-center space-x-2 text-sm"
                      >
                        <Heart className="h-4 w-4" />
                        <span>Swipe</span>
                      </Link>
                      <Link
                        href="/matches"
                        className="apple-button-secondary flex items-center space-x-2 text-sm"
                      >
                        <Users className="h-4 w-4" />
                        <span>Matches</span>
                      </Link>
                      <Link
                        href="/profile"
                        className="apple-button-secondary flex items-center space-x-2 text-sm"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </>
                  )}
                  
                  {/* User Profile */}
                  <div className="flex items-center space-x-3 ml-4">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center space-x-2 hover:bg-dark-card/50 p-2 rounded-xl transition-colors"
                    >
                      <div className="w-7 h-7 bg-dark-card rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-dark-text-secondary" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-dark-text-primary">
                          {userProfile?.full_name ? userProfile.full_name.split(' ')[0] : 'User'}
                        </div>
                        {userProfile?.role === 'stylist' && (
                          <div className="text-xs text-accent-blue">Stylist</div>
                        )}
                        {userProfile?.role === 'admin' as any && (
                          <div className="text-xs text-system-red">Admin</div>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors p-2"
                      title="Sign Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/stylist-landing"
                    className="flex items-center space-x-2 text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors px-4 py-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>For Stylists</span>
                  </Link>
                  <button
                    onClick={() => {
                      console.log('Login button clicked')
                      setShowLogin(true)
                    }}
                    className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors px-4 py-2"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      console.log('Sign up button clicked')
                      setShowSignUp(true)
                    }}
                    className="apple-button-primary text-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

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

      <StylistProfileModal
        isOpen={showStylistProfile}
        onClose={() => setShowStylistProfile(false)}
      />
    </>
  )
}