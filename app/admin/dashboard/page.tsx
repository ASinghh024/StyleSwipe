'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Users, Heart, TrendUp, Upload, Calendar, Palette } from 'lucide-react'

interface DashboardMetrics {
  totalUsers: number
  totalStylists: number
  totalAdmins: number
  totalSwipes: number
  totalMatches: number
  mostMatchedStylist: {
    id: string
    name: string
    count: number
  } | null
  stylistsWithoutCatalog: number
  stylistWithMostCatalog: {
    id: string
    name: string
    count: number
  } | null
  topOccasions: Array<{ occasion: string; count: number }>
  topStyles: Array<{ style: string; count: number }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalStylists: 0,
    totalAdmins: 0,
    totalSwipes: 0,
    totalMatches: 0,
    mostMatchedStylist: null,
    stylistsWithoutCatalog: 0,
    stylistWithMostCatalog: null,
    topOccasions: [],
    topStyles: []
  })

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!loading && (!user || userProfile?.role !== 'admin')) {
      router.push('/')
    }
  }, [user, userProfile, loading, router])

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user || userProfile?.role !== 'admin') return

      try {
        // 1. Get user counts by role
        const { data: userCounts, error: userError } = await supabase
          .from('user_profiles')
          .select('role, count')
          .group('role')

        if (userError) throw userError

        const totalUsers = userCounts.reduce((sum, item) => sum + item.count, 0)
        const totalStylists = userCounts.find(item => item.role === 'stylist')?.count || 0
        const totalAdmins = userCounts.find(item => item.role === 'admin')?.count || 0

        // 2. Get total swipes
        const { count: totalSwipes, error: swipesError } = await supabase
          .from('swipes')
          .select('id', { count: 'exact', head: true })

        if (swipesError) throw swipesError

        // 3. Get total matches
        const { count: totalMatches, error: matchesError } = await supabase
          .from('matches')
          .select('id', { count: 'exact', head: true })

        if (matchesError) throw matchesError

        // 4. Get most matched stylist
        const { data: matchedStylists, error: stylistMatchError } = await supabase
          .from('matches')
          .select('stylist_id, count')
          .group('stylist_id')
          .order('count', { ascending: false })
          .limit(1)

        if (stylistMatchError) throw stylistMatchError

        let mostMatchedStylist = null
        if (matchedStylists && matchedStylists.length > 0) {
          const { data: stylistData } = await supabase
            .from('stylists')
            .select('name')
            .eq('id', matchedStylists[0].stylist_id)
            .single()

          if (stylistData) {
            mostMatchedStylist = {
              id: matchedStylists[0].stylist_id,
              name: stylistData.name,
              count: matchedStylists[0].count
            }
          }
        }

        // 5. Get stylists without catalog
        const { data: emptyStylists, error: emptyCatalogError } = await supabase
          .from('stylists')
          .select('id')
          .eq('catalog_urls', '{}')

        if (emptyCatalogError) throw emptyCatalogError

        // 6. Get stylist with most catalog uploads
        const { data: allStylists, error: allStylistsError } = await supabase
          .from('stylists')
          .select('id, name, catalog_urls')

        if (allStylistsError) throw allStylistsError

        let stylistWithMostCatalog = null
        if (allStylists && allStylists.length > 0) {
          const sortedStylists = [...allStylists].sort((a, b) => 
            (b.catalog_urls?.length || 0) - (a.catalog_urls?.length || 0)
          )
          
          if (sortedStylists[0].catalog_urls?.length > 0) {
            stylistWithMostCatalog = {
              id: sortedStylists[0].id,
              name: sortedStylists[0].name,
              count: sortedStylists[0].catalog_urls?.length || 0
            }
          }
        }

        // 7. Get top occasions
        const { data: userPreferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('preferred_occasions')

        if (preferencesError) throw preferencesError

        const occasionCounts: Record<string, number> = {}
        userPreferences?.forEach(pref => {
          if (pref.preferred_occasions && pref.preferred_occasions.length > 0) {
            pref.preferred_occasions.forEach((occasion: string) => {
              occasionCounts[occasion] = (occasionCounts[occasion] || 0) + 1
            })
          }
        })

        const topOccasions = Object.entries(occasionCounts)
          .map(([occasion, count]) => ({ occasion, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)

        // 8. Get top styles
        const { data: stylePreferences, error: styleError } = await supabase
          .from('user_preferences')
          .select('style_preferences')

        if (styleError) throw styleError

        const styleCounts: Record<string, number> = {}
        stylePreferences?.forEach(pref => {
          if (pref.style_preferences) {
            styleCounts[pref.style_preferences] = (styleCounts[pref.style_preferences] || 0) + 1
          }
        })

        const topStyles = Object.entries(styleCounts)
          .map(([style, count]) => ({ style, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)

        setMetrics({
          totalUsers,
          totalStylists,
          totalAdmins,
          totalSwipes: totalSwipes || 0,
          totalMatches: totalMatches || 0,
          mostMatchedStylist,
          stylistsWithoutCatalog: emptyStylists?.length || 0,
          stylistWithMostCatalog,
          topOccasions,
          topStyles
        })

      } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [user, userProfile])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-dark-card rounded-md mb-4"></div>
          <div className="h-4 w-48 bg-dark-card rounded-md"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="text-dark-text-secondary hover:text-dark-text-primary mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-dark-text-secondary mt-1">Overview of platform activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Metrics */}
          <div className="apple-card p-6">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-accent-blue mr-2" />
              <h2 className="text-xl font-semibold">User Metrics</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-dark-text-secondary text-sm">Total Users</p>
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
              </div>
              <div>
                <p className="text-dark-text-secondary text-sm">Total Stylists</p>
                <p className="text-2xl font-bold">{metrics.totalStylists}</p>
              </div>
              <div>
                <p className="text-dark-text-secondary text-sm">Total Admins</p>
                <p className="text-2xl font-bold">{metrics.totalAdmins}</p>
              </div>
            </div>
          </div>

          {/* Matching Activity */}
          <div className="apple-card p-6">
            <div className="flex items-center mb-4">
              <Heart className="h-5 w-5 text-system-red mr-2" />
              <h2 className="text-xl font-semibold">Matching Activity</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-dark-text-secondary text-sm">Total Swipes</p>
                <p className="text-2xl font-bold">{metrics.totalSwipes}</p>
              </div>
              <div>
                <p className="text-dark-text-secondary text-sm">Total Matches</p>
                <p className="text-2xl font-bold">{metrics.totalMatches}</p>
              </div>
              <div>
                <p className="text-dark-text-secondary text-sm">Most Matched Stylist</p>
                {metrics.mostMatchedStylist ? (
                  <div>
                    <p className="text-xl font-bold">{metrics.mostMatchedStylist.name}</p>
                    <p className="text-sm text-dark-text-tertiary">{metrics.mostMatchedStylist.count} matches</p>
                  </div>
                ) : (
                  <p className="text-xl font-bold">No matches yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Catalog Uploads */}
          <div className="apple-card p-6">
            <div className="flex items-center mb-4">
              <Upload className="h-5 w-5 text-accent-green mr-2" />
              <h2 className="text-xl font-semibold">Catalog Uploads</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-dark-text-secondary text-sm">Stylists Without Catalog</p>
                <p className="text-2xl font-bold">{metrics.stylistsWithoutCatalog}</p>
              </div>
              <div>
                <p className="text-dark-text-secondary text-sm">Most Uploads</p>
                {metrics.stylistWithMostCatalog ? (
                  <div>
                    <p className="text-xl font-bold">{metrics.stylistWithMostCatalog.name}</p>
                    <p className="text-sm text-dark-text-tertiary">{metrics.stylistWithMostCatalog.count} images</p>
                  </div>
                ) : (
                  <p className="text-xl font-bold">No uploads yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Occasions */}
          <div className="apple-card p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-system-orange mr-2" />
              <h2 className="text-xl font-semibold">Top Occasions</h2>
            </div>
            {metrics.topOccasions.length > 0 ? (
              <div className="space-y-3">
                {metrics.topOccasions.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <p className="text-dark-text-primary">{item.occasion}</p>
                    <p className="text-dark-text-secondary font-medium">{item.count} users</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-text-tertiary">No occasion data available</p>
            )}
          </div>

          {/* Top Styles */}
          <div className="apple-card p-6">
            <div className="flex items-center mb-4">
              <Palette className="h-5 w-5 text-system-yellow mr-2" />
              <h2 className="text-xl font-semibold">Top Styles</h2>
            </div>
            {metrics.topStyles.length > 0 ? (
              <div className="space-y-3">
                {metrics.topStyles.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <p className="text-dark-text-primary">{item.style}</p>
                    <p className="text-dark-text-secondary font-medium">{item.count} users</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-text-tertiary">No style data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}