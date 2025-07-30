'use client'
import { ArrowRight, Download, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function CTA() {
  return (
    <section className="py-24 bg-dark-surface">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-semibold text-dark-text-primary">
          Ready to Transform Your Style?
        </h2>
        <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
          Join thousands who found their perfect stylist match
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/swipe" className="apple-button-primary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Get Started</span>
          </Link>
          <Link href="/stylist-landing" className="apple-button-secondary flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>For Stylists</span>
          </Link>
          <button className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors flex items-center space-x-2">
            <span>Learn More</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}