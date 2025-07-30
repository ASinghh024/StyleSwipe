'use client'
import { Smartphone, Shield, Users, Zap } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for mobile swiping experience with intuitive gestures."
    },
    {
      icon: Shield,
      title: "Verified Stylists",
      description: "All stylists are background-checked and professionally verified."
    },
    {
      icon: Users,
      title: "Diverse Style Experts",
      description: "From streetwear to luxury, find stylists for every aesthetic."
    },
    {
      icon: Zap,
      title: "Instant Connection",
      description: "Connect with your chosen stylist immediately, no waiting."
    }
  ]

  return (
    <section className="py-24 bg-dark-bg">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-dark-text-primary">
            Why StyleSwipe?
          </h2>
          <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
            The trusted platform for fashion connections
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center group space-y-4">
              <div className="w-12 h-12 bg-dark-surface rounded-2xl flex items-center justify-center mx-auto border border-dark-border group-hover:border-accent-blue/50 transition-colors">
                <feature.icon className="h-5 w-5 text-dark-text-secondary group-hover:text-accent-blue transition-colors" />
              </div>
              <h3 className="text-lg font-medium text-dark-text-primary">
                {feature.title}
              </h3>
              <p className="text-dark-text-tertiary text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 