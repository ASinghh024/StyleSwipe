'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function TestSupabasePage() {
  const { user, session } = useAuth()
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Check if we can connect to Supabase
      console.log('Test 1: Checking Supabase connection...')
      const { data: stylists, error: stylistsError } = await supabase
        .from('stylists')
        .select('*')
        .limit(1)

      results.connection = {
        success: !stylistsError,
        error: stylistsError?.message,
        data: stylists?.length || 0
      }

      // Test 2: Check user authentication
      console.log('Test 2: Checking user authentication...')
      results.authentication = {
        user: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        } : null,
        session: session ? 'Active' : 'None'
      }

      // Test 3: Check if user can access their own data
      if (user) {
        console.log('Test 3: Checking user data access...')
        const { data: userSwipes, error: swipesError } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', user.id)

        results.userData = {
          success: !swipesError,
          error: swipesError?.message,
          swipes: userSwipes?.length || 0
        }
      }

      // Test 4: Check environment variables
      console.log('Test 4: Checking environment variables...')
      results.environment = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV
      }

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error'
    }

    setTestResults(results)
    setLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Supabase Connection Test
        </h1>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Running tests...</p>
          </div>
        )}

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-6">
            {/* Connection Test */}
            {testResults.connection && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
                <div className="space-y-2">
                  <p><strong>Status:</strong> 
                    <span className={testResults.connection.success ? 'text-green-600' : 'text-red-600'}>
                      {testResults.connection.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </p>
                  {testResults.connection.error && (
                    <p><strong>Error:</strong> <span className="text-red-600">{testResults.connection.error}</span></p>
                  )}
                  <p><strong>Stylists found:</strong> {testResults.connection.data}</p>
                </div>
              </div>
            )}

            {/* Authentication Test */}
            {testResults.authentication && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">User Authentication</h2>
                <div className="space-y-2">
                  <p><strong>Session:</strong> {testResults.authentication.session}</p>
                  {testResults.authentication.user ? (
                    <div>
                      <p><strong>User ID:</strong> {testResults.authentication.user.id}</p>
                      <p><strong>Email:</strong> {testResults.authentication.user.email}</p>
                      <p><strong>Created:</strong> {testResults.authentication.user.created_at}</p>
                    </div>
                  ) : (
                    <p className="text-yellow-600">No user signed in</p>
                  )}
                </div>
              </div>
            )}

            {/* User Data Test */}
            {testResults.userData && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">User Data Access</h2>
                <div className="space-y-2">
                  <p><strong>Status:</strong> 
                    <span className={testResults.userData.success ? 'text-green-600' : 'text-red-600'}>
                      {testResults.userData.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </p>
                  {testResults.userData.error && (
                    <p><strong>Error:</strong> <span className="text-red-600">{testResults.userData.error}</span></p>
                  )}
                  <p><strong>User swipes:</strong> {testResults.userData.swipes}</p>
                </div>
              </div>
            )}

            {/* Environment Test */}
            {testResults.environment && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
                <div className="space-y-2">
                  <p><strong>Supabase URL:</strong> {testResults.environment.supabaseUrl}</p>
                  <p><strong>Supabase Key:</strong> {testResults.environment.supabaseKey}</p>
                  <p><strong>Node Environment:</strong> {testResults.environment.nodeEnv}</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {testResults.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-red-800 mb-4">Test Error</h2>
                <p className="text-red-600">{testResults.error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={runTests}
                className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
              >
                Run Tests Again
              </button>
              <a
                href="/swipe"
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Swipe Page
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 