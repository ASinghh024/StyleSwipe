'use client'
import { Star, Quote } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fashion Blogger",
      avatar: "👩‍💼",
      content: "StyleSwipe completely changed how I approach fashion. My stylist Emma helped me discover my personal style and now I feel confident in everything I wear!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Tech Professional",
      avatar: "👨‍💻",
      content: "As someone who never knew how to dress well, StyleSwipe was a game-changer. My stylist James taught me the basics and now I get compliments all the time!",
      rating: 5
    },
    {
      name: "Aisha Patel",
      role: "Graduate Student",
      avatar: "👩‍🎓",
      content: "I was struggling with my wardrobe for job interviews. Thanks to StyleSwipe and my amazing stylist Lisa, I landed my dream job with confidence!",
      rating: 5
    }
  ]

  return (
    <section className="py-24 bg-dark-bg">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-dark-text-primary">
            What Users Say
          </h2>
          <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
            Trusted by thousands of style-conscious users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="apple-card p-6 space-y-4">
              {/* Quote Icon */}
              <div className="w-8 h-8 bg-dark-card rounded-full flex items-center justify-center mx-auto">
                <Quote className="h-4 w-4 text-dark-text-tertiary" />
              </div>

              {/* Rating */}
              <div className="flex justify-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-system-yellow fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-dark-text-secondary text-center text-sm leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center space-x-3">
                <div className="text-2xl">{testimonial.avatar}</div>
                <div className="text-center">
                  <div className="font-medium text-dark-text-primary text-sm">{testimonial.name}</div>
                  <div className="text-xs text-dark-text-tertiary">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Minimal Stats */}
        <div className="mt-20 grid grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-dark-text-primary">4.9</div>
            <div className="text-xs text-dark-text-tertiary">Rating</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-dark-text-primary">98%</div>
            <div className="text-xs text-dark-text-tertiary">Satisfaction</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-dark-text-primary">24/7</div>
            <div className="text-xs text-dark-text-tertiary">Support</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-dark-text-primary">Free</div>
            <div className="text-xs text-dark-text-tertiary">Plan</div>
          </div>
        </div>
      </div>
    </section>
  )
} 