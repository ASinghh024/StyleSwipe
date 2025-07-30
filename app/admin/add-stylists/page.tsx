'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { addStylistToStylistsTable } from '@/lib/stylist-utils'
import { supabase } from '@/lib/supabase'

export default function AddStylistsPage() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const addCurrentUserAsStylist = async () => {
    if (!user || !userProfile) {
      setResult('No user or profile found')
      return
    }

    setLoading(true)
    const response = await addStylistToStylistsTable(user.id, userProfile)
    setResult(JSON.stringify(response, null, 2))
    setLoading(false)
  }

  const addAllStylists = async () => {
    setLoading(true)
    
    try {
      // Get all user profiles with role 'stylist'
      const { data: stylistProfiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'stylist')

      if (error) {
        setResult(`Error fetching stylist profiles: ${error.message}`)
        setLoading(false)
        return
      }

      let successCount = 0
      let errorCount = 0

      for (const profile of stylistProfiles || []) {
        const response = await addStylistToStylistsTable(profile.user_id, profile)
        if (response.success) {
          successCount++
        } else {
          errorCount++
        }
      }

      setResult(`Added ${successCount} stylists, ${errorCount} errors`)
    } catch (error) {
      setResult(`Error: ${error}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Stylists to Stylists Table</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
            <p><strong>Role:</strong> {userProfile?.role || 'No profile'}</p>
            <p><strong>Full Name:</strong> {userProfile?.full_name || 'No name'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={addCurrentUserAsStylist}
            disabled={loading || !user || userProfile?.role !== 'stylist'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Current User as Stylist'}
          </button>

          <button
            onClick={addAllStylists}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 ml-4"
          >
            {loading ? 'Adding All...' : 'Add All Stylists'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
} 