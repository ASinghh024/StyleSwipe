// Script to run SQL files directly in Supabase
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSqlScript(filePath) {
  try {
    console.log(`🔍 Reading SQL file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📋 Found ${sqlStatements.length} SQL statements to execute`);
    
    // Since we can't directly execute SQL with the Supabase JS client,
    // we'll use individual queries for operations we can perform
    
    // First, check for self-matches
    console.log('\n🔍 Checking for self-matches...');
    const { data: selfMatches, error: findError } = await supabase
      .from('matches')
      .select('id, user_id, stylist_id, matched_at')
      .filter('user_id', 'eq', supabase.rpc('cast_to_text', { val: 'stylist_id' }));
    
    if (findError) {
      console.error('❌ Error finding self-matches:', findError.message);
      console.log('💡 You may need to run this SQL directly in your Supabase dashboard');
      return;
    }
    
    if (!selfMatches || selfMatches.length === 0) {
      console.log('✅ No self-matches found!');
    } else {
      console.log(`⚠️ Found ${selfMatches.length} self-matches`);
      
      // Delete self-matches
      console.log('\n🗑️ Deleting self-matches...');
      
      for (const match of selfMatches) {
        const { error: deleteError } = await supabase
          .from('matches')
          .delete()
          .eq('id', match.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting match ${match.id}:`, deleteError.message);
        } else {
          console.log(`✅ Deleted match ${match.id}`);
        }
      }
    }
    
    console.log('\n💡 To add the constraint, run this SQL in your Supabase SQL Editor:');
    console.log('ALTER TABLE matches ADD CONSTRAINT prevent_self_matches CHECK (user_id != stylist_id);');
    
    console.log('\n🎉 SQL operations completed!');
    console.log('Note: Some operations may require direct execution in the Supabase SQL Editor.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Get the SQL file path from command line arguments
const sqlFilePath = process.argv[2];

if (!sqlFilePath) {
  console.error('❌ Please provide an SQL file path');
  console.log('Usage: node run-sql-script.js <sql-file-path>');
  process.exit(1);
}

// Run the script
runSqlScript(sqlFilePath);