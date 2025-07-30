// Browser Console Test - Run this in your browser when on the stylist dashboard
// Open Dev Tools (F12) → Console tab → Paste and run this code

console.log('🔍 STYLIST DASHBOARD AUTHENTICATION TEST');
console.log('========================================');

// Test 1: Check if user is authenticated
console.log('\n👤 STEP 1: Authentication Check');
supabase.auth.getUser().then(response => {
  const user = response.data.user;
  const error = response.error;
  
  if (error) {
    console.log('❌ Auth Error:', error.message);
    return;
  }
  
  if (user) {
    console.log('✅ User authenticated');
    console.log('📧 Email:', user.email);
    console.log('🆔 User ID:', user.id);
    console.log('📋 Full user object:', user);
    
    // Test 2: Check user profile
    console.log('\n👤 STEP 2: User Profile Check');
    supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(profileResponse => {
        if (profileResponse.error) {
          console.log('❌ Profile Error:', profileResponse.error.message);
        } else {
          console.log('✅ User Profile Found:');
          console.log('📝 Full Name:', profileResponse.data.full_name);
          console.log('👔 Role:', profileResponse.data.role);
          console.log('📋 Full profile:', profileResponse.data);
          
          if (profileResponse.data.role === 'stylist') {
            console.log('✅ User is a stylist - dashboard should work');
            
            // Test 3: Check matches for this stylist
            console.log('\n🔗 STEP 3: Matches Check');
            supabase
              .from('matches')
              .select('*')
              .eq('stylist_id', user.id)
              .then(matchesResponse => {
                if (matchesResponse.error) {
                  console.log('❌ Matches Error:', matchesResponse.error.message);
                } else {
                  console.log(`✅ Found ${matchesResponse.data.length} matches for this stylist`);
                  console.log('📋 Matches:', matchesResponse.data);
                  
                  if (matchesResponse.data.length > 0) {
                    // Test 4: Check if matched users have profiles and preferences
                    console.log('\n📊 STEP 4: Matched User Data Check');
                    const userIds = matchesResponse.data.map(m => m.user_id);
                    
                    // Check user profiles
                    supabase
                      .from('user_profiles')
                      .select('*')
                      .in('user_id', userIds)
                      .then(profilesResponse => {
                        console.log(`👤 Found ${profilesResponse.data?.length || 0} user profiles for matched users`);
                        profilesResponse.data?.forEach(profile => {
                          console.log(`   - ${profile.user_id.slice(-6)}: "${profile.full_name}"`);
                        });
                        
                        // Check user preferences
                        supabase
                          .from('user_preferences')
                          .select('*')
                          .in('user_id', userIds)
                          .then(prefsResponse => {
                            console.log(`🎯 Found ${prefsResponse.data?.length || 0} user preferences for matched users`);
                            prefsResponse.data?.forEach(pref => {
                              const hasData = pref.gender || pref.style_preferences || pref.budget_range;
                              console.log(`   - ${pref.user_id.slice(-6)}: Has Data = ${hasData ? 'YES' : 'NO'}`);
                              if (hasData) {
                                console.log(`     Gender: ${pref.gender}, Style: ${pref.style_preferences}, Budget: ${pref.budget_range}`);
                              }
                            });
                            
                            console.log('\n🎉 DIAGNOSIS COMPLETE!');
                            console.log('📋 Check the results above to identify issues');
                          });
                      });
                  } else {
                    console.log('⚠️  No matches found - this stylist has no matched users');
                    console.log('💡 Create test matches or have users swipe on this stylist');
                  }
                }
              });
            
          } else {
            console.log('❌ User is not a stylist - cannot access stylist dashboard');
            console.log('💡 Sign in as a user with role = "stylist"');
          }
        }
      });
    
  } else {
    console.log('❌ User not authenticated');
    console.log('💡 Sign in to access the dashboard');
  }
});

console.log('\n💡 TIP: Look for any error messages above');
console.log('💡 Compare the User ID with stylist_id from your matches table');
console.log('💡 If no matches found, you need to create test data or have users swipe on stylists'); 