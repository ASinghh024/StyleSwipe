'use client'
import { MousePointer, Heart, MessageCircle, User, Star, TrendingUp, Briefcase } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function HowItWorks() {
  const { userProfile } = useAuth()
  const isStylist = userProfile?.role === 'stylist'

  const userSteps = [
    {
      icon: MousePointer,
      title: "Swipe through top stylists",
      description: "Browse through curated profiles of fashion experts and stylists in your area.",
      color: "from-primary-700 to-primary-800"
    },
    {
      icon: Heart,
      title: "Choose your style expert",
      description: "When you like a stylist, you can connect with them directly. No mutual matching required!",
      color: "from-primary-600 to-primary-700"
    },
    {
      icon: MessageCircle,
      title: "Get personalized fashion advice",
      description: "Chat with your stylist and receive customized fashion recommendations.",
      color: "from-primary-800 to-primary-900"
    }
  ]

  const stylistSteps = [
    {
      icon: User,
      title: "Create your stylist profile",
      description: "Set up your professional profile with your specialties, portfolio, and unique style approach.",
      color: "from-primary-700 to-primary-800"
    },
    {
      icon: TrendingUp,
      title: "Get discovered by clients",
      description: "Clients can discover and match with you based on your expertise and style preferences.",
      color: "from-primary-600 to-primary-700"
    },
    {
      icon: Star,
      title: "Build your client base",
      description: "Connect with clients, provide styling services, and grow your fashion business.",
      color: "from-primary-800 to-primary-900"
    }
  ]

  const steps = isStylist ? stylistSteps : userSteps

  return (
    <section className="py-24 bg-dark-surface">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-dark-text-primary">
            How It Works
          </h2>
          <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
            {isStylist 
              ? "Simple steps to grow your styling business"
              : "Simple steps to find your perfect stylist"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-6">
              {/* Step Number */}
              <div className="w-8 h-8 bg-accent-blue text-white rounded-full flex items-center justify-center font-medium text-sm mx-auto">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-dark-card rounded-2xl flex items-center justify-center mx-auto border border-dark-border">
                <step.icon className="h-6 w-6 text-dark-text-secondary" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-dark-text-primary">
                  {step.title}
                </h3>
                <p className="text-dark-text-tertiary text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isStylist ? (
            <Link 
              href="/stylist-dashboard"
              className="apple-button-primary"
            >
              Access Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/swipe"
                className="apple-button-primary"
              >
                Start Swiping
              </Link>
              <Link 
                href="/stylist-landing"
                className="apple-button-secondary flex items-center space-x-2"
              >
                <Briefcase className="h-4 w-4" />
                <span>Are You a Stylist?</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}