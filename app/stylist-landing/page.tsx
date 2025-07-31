'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function StylistLanding() {
  const { user, userProfile } = useAuth()
  const [stylists, setStylists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedStylists = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('stylists')
          .select('*, catalog_images(*)')
          .limit(3)

        if (error) throw error
        setStylists(data || [])
      } catch (error) {
        console.error('Error fetching featured stylists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedStylists()
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-surface/80 backdrop-blur-apple border-b border-dark-border/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-dark-text-primary">
                StyleSwipe for Stylists
              </span>
            </div>
            <Link href="/" className="apple-button-secondary text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-20 pb-16 px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-dark-text-primary">
            Grow Your Styling Business
          </h1>
          <p className="text-xl text-dark-text-secondary leading-relaxed">
            Connect with clients looking for your unique styling expertise and build your portfolio.
          </p>
          <div className="pt-8">
            {user ? (
              userProfile?.role === 'stylist' ? (
                <Link 
                  href="/stylist-dashboard"
                  className="apple-button-primary px-8 py-4 text-lg"
                >
                  Go to Your Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    // Logic to convert user to stylist would go here
                    alert('Please contact support to convert your account to a stylist account.')
                  }}
                  className="apple-button-primary px-8 py-4 text-lg"
                >
                  Become a Stylist
                </button>
              )
            ) : (
              <Link 
                href="/"
                className="apple-button-primary px-8 py-4 text-lg"
                onClick={() => {
                  // This would trigger the sign up modal from the navbar
                  document.querySelector('button:contains("Sign Up")').click()
                }}
              >
                Sign Up as a Stylist
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Featured Stylists */}
      <div className="py-16 px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-dark-text-primary mb-8 text-center">
          Featured Stylists
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-center py-12">
              <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-dark-text-secondary">Loading featured stylists...</p>
            </div>
          ) : stylists.length > 0 ? (
            stylists.map((stylist) => (
              <div key={stylist.id} className="bg-dark-surface rounded-xl overflow-hidden shadow-apple-md">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                  {stylist.catalog_images && stylist.catalog_images.length > 0 ? (
                    <img 
                      src={stylist.catalog_images[0].image_url} 
                      alt={`${stylist.name}'s catalog`}
                      className="w-full h-full object-cover"
                    />
                  ) : stylist.profile_picture ? (
                    <img 
                      src={stylist.profile_picture} 
                      alt={`${stylist.name}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-dark-card">
                      <User className="w-16 h-16 text-dark-text-tertiary" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-dark-text-primary mb-2">{stylist.name}</h3>
                  <p className="text-dark-text-secondary line-clamp-2 mb-4">{stylist.bio}</p>
                  {stylist.specialties && stylist.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {stylist.specialties.slice(0, 3).map((specialty, index) => (
                        <span 
                          key={index}
                          className="bg-dark-card px-2 py-1 rounded-full text-xs text-dark-text-secondary border border-dark-border"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-dark-text-secondary">No featured stylists available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto bg-dark-surface/30 rounded-2xl my-12">
        <h2 className="text-2xl font-semibold text-dark-text-primary mb-12 text-center">
          Why Join StyleSwipe as a Stylist?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-dark-surface/50 rounded-xl">
            <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-accent-blue">1</span>
            </div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Build Your Client Base</h3>
            <p className="text-dark-text-secondary">Connect with clients who are specifically looking for your styling expertise.</p>
          </div>
          
          <div className="p-6 bg-dark-surface/50 rounded-xl">
            <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-accent-green">2</span>
            </div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Showcase Your Portfolio</h3>
            <p className="text-dark-text-secondary">Display your best work with our elegant catalog system and attract more clients.</p>
          </div>
          
          <div className="p-6 bg-dark-surface/50 rounded-xl">
            <div className="w-12 h-12 bg-accent-purple/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-accent-purple">3</span>
            </div>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Flexible Scheduling</h3>
            <p className="text-dark-text-secondary">Work on your own terms and manage client relationships through our platform.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-dark-text-primary mb-6">
          Ready to grow your styling business?
        </h2>
        <p className="text-xl text-dark-text-secondary mb-8 max-w-2xl mx-auto">
          Join our community of professional stylists and connect with clients who appreciate your unique vision.
        </p>
        {user ? (
          userProfile?.role === 'stylist' ? (
            <Link 
              href="/stylist-dashboard"
              className="apple-button-primary px-8 py-4 text-lg"
            >
              Go to Your Dashboard
            </Link>
          ) : (
            <button
              onClick={() => {
                // Logic to convert user to stylist would go here
                alert('Please contact support to convert your account to a stylist account.')
              }}
              className="apple-button-primary px-8 py-4 text-lg"
            >
              Become a Stylist
            </button>
          )
        ) : (
          <Link 
            href="/"
            className="apple-button-primary px-8 py-4 text-lg"
            onClick={() => {
              // This would trigger the sign up modal from the navbar
              document.querySelector('button:contains("Sign Up")').click()
            }}
          >
            Sign Up as a Stylist
          </Link>
        )}
      </div>
    </div>
  )
}