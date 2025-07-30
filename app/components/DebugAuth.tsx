'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function DebugAuth() {
  const { user, userProfile, loading } = useAuth()

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
        <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>Profile:</strong> {userProfile ? 'Loaded' : 'Not loaded'}</p>
        <p><strong>Role:</strong> {userProfile?.role || 'N/A'}</p>
        <p><strong>Name:</strong> {userProfile?.full_name || 'N/A'}</p>
      </div>
    </div>
  )
}