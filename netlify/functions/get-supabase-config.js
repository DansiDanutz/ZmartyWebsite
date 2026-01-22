// Netlify serverless function to securely provide Supabase config
// This prevents credentials from being visible in HTML source code

function firstEnv(names) {
  for (const name of names) {
    const val = process.env[name]
    if (typeof val === 'string' && val.trim()) return { name, value: val.trim() }
  }
  return { name: null, value: null }
}

function isLikelyPublicSupabaseKey(key) {
  if (!key) return false
  if (key.startsWith('sb_secret_')) return false // service role key (must never be exposed)
  if (key.startsWith('sb_publishable_')) return true
  // JWT anon keys are typically 3 dot-separated parts
  return key.split('.').length === 3
}

exports.handler = async function (event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    }
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Read from Netlify environment variables (support multiple naming conventions)
    const urlEnv = firstEnv([
      'SUPABASE_URL',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_BOT_URL',
      'SUPABASE_BOT_URL',
      'BOT_URL',
      'VITE_BOT_URL',
    ])

    const keyEnv = firstEnv([
      'SUPABASE_ANON_KEY',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_BOT_ANON_KEY',
      'BOT_ANON_KEY',
      'VITE_BOT_ANON_KEY',
    ])

    const config = {
      supabaseUrl: urlEnv.value,
      supabaseAnonKey: keyEnv.value,
    }

    // Validate that env vars are set
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Missing Supabase configuration in Netlify environment',
          required: {
            supabaseUrl: [
              'SUPABASE_URL',
              'VITE_SUPABASE_URL',
              'VITE_SUPABASE_BOT_URL',
              'SUPABASE_BOT_URL',
              'BOT_URL',
              'VITE_BOT_URL',
            ],
            supabaseAnonKey: [
              'SUPABASE_ANON_KEY',
              'VITE_SUPABASE_ANON_KEY',
              'VITE_SUPABASE_BOT_ANON_KEY',
              'BOT_ANON_KEY',
              'VITE_BOT_ANON_KEY',
            ],
          },
        }),
      }
    }

    if (!isLikelyPublicSupabaseKey(config.supabaseAnonKey)) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Invalid Supabase public key configured',
          message:
            'Expected an anon/publishable key (JWT with 3 dot-separated parts or sb_publishable_*). Never use sb_secret_*.',
        }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(config),
    }
  } catch (error) {
    console.error('Error fetching Supabase config:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to load configuration',
        message: error?.message || 'Unknown error',
      }),
    }
  }
}
