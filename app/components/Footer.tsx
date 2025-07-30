'use client'
import { Shirt, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-dark-border">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <Shirt className="h-6 w-6 text-accent-blue" />
              <span className="text-xl font-semibold text-dark-text-primary">
                StyleSwipe
              </span>
            </div>
            <p className="text-dark-text-tertiary text-sm leading-relaxed max-w-md">
              Connecting people with fashion experts through a simple, elegant experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-medium text-dark-text-secondary mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors text-sm">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors text-sm">
                  Become a Stylist
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-medium text-dark-text-secondary mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-text-tertiary hover:text-dark-text-secondary transition-colors text-sm">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-border mt-12 pt-6 text-center">
          <p className="text-dark-text-tertiary text-xs">
            © 2024 StyleSwipe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 