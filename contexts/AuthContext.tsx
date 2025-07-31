'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  user_id: string
  full_name: string
  role: 'admin' | 'user' | 'stylist'
  bio?: string
  specialties?: string[]
  catalog_urls?: string[]
  profile_picture?: string
  clothing_preferences?: string[]
  preferred_occasions?: string[]
  style_preferences?: string
  budget_range?: string
  size_preferences?: string
  color_preferences?: string[]
  is_verified: boolean
  created_at: string
  updated_at: string
}

interface Stylist {
  id: string
  name: string
  bio: string
  specialties: string[]
  catalog_urls: string[]
  profile_picture?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  userProfile: UserProfile | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: 'user' | 'stylist') => Promise<void>
  signOut: () => Promise<void>
  getUserProfile: () => Promise<UserProfile | null>
  refreshUserProfile: () => Promise<void>
  ensureStylistInStylistsTable: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        getUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await getUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
    const currentUserId = userId || user?.id
    if (!currentUserId) return null

    try {
      console.log('Fetching user profile for user ID:', currentUserId)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUserId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      console.log('User profile loaded:', data)
      setUserProfile(data)
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  const ensureStylistInStylistsTable = async (): Promise<void> => {
    if (!user || !userProfile || userProfile.role !== 'stylist') {
      console.log('Not adding to stylists table:', {
        hasUser: !!user,
        hasProfile: !!userProfile,
        role: userProfile?.role
      })
      return
    }

    try {
      console.log('Ensuring stylist is in stylists table for user:', user.id)

      // Check if stylist already exists in stylists table
      const { data: existingStylist, error: checkError } = await supabase
        .from('stylists')
        .select('id')
        .eq('id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing stylist:', checkError)
        return
      }

      if (existingStylist) {
        console.log('Stylist already exists in stylists table')
        return
      }

      // Add stylist to stylists table
      const stylistData = {
        id: user.id, // Use the same ID as the user
        name: userProfile.full_name,
        bio: userProfile.bio || `Professional stylist ${userProfile.full_name} ready to help you look your best!`,
        specialties: userProfile.specialties || ['Personal Styling', 'Fashion Consultation'],
        catalog_urls: userProfile.catalog_urls || [],
        profile_picture: userProfile.profile_picture || null
      }

      console.log('Adding stylist to stylists table:', stylistData)

      const { error: insertError } = await supabase
        .from('stylists')
        .insert(stylistData)

      if (insertError) {
        console.error('Error adding stylist to stylists table:', insertError)
        return
      }

      console.log('Successfully added stylist to stylists table')
    } catch (error) {
      console.error('Error ensuring stylist in stylists table:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Attempting sign in with email:', email)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('AuthContext: Sign in error:', error)
      throw error
    }
    console.log('AuthContext: Sign in successful')
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'user' | 'stylist') => {
    console.log('AuthContext: Attempting sign up with email:', email, 'role:', role)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    })
    
    if (error) {
      console.error('AuthContext: Sign up error:', error)
      throw error
    }
    
    console.log('AuthContext: Sign up successful')
    
    // Create user profile manually (in case trigger doesn't work)
    if (data.user) {
      try {
        console.log('Creating user profile manually...')
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            role: role
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // Don't throw here as the user account was created successfully
        } else {
          console.log('User profile created successfully')
        }
        
        // Also create user_preferences record
        console.log('Creating user preferences record...')
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: data.user.id
          })
          
        if (preferencesError) {
          console.error('Error creating user preferences:', preferencesError)
        } else {
          console.log('User preferences created successfully')
        }
      } catch (error) {
        console.error('Error during profile/preferences creation:', error)
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const refreshUserProfile = async () => {
    if (user) {
      await getUserProfile(user.id)
    }
  }

  // Effect to ensure stylist is in stylists table when profile loads
  useEffect(() => {
    if (userProfile && userProfile.role === 'stylist') {
      console.log('User profile loaded as stylist, ensuring they are in stylists table')
      ensureStylistInStylistsTable()
    }
  }, [userProfile])

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      userProfile, 
      signIn, 
      signUp, 
      signOut, 
      getUserProfile,
      refreshUserProfile,
      ensureStylistInStylistsTable
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
