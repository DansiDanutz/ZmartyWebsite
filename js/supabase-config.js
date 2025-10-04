// Supabase Configuration Loader
// Fetches credentials from Netlify serverless function instead of hardcoding in HTML

(function() {
  'use strict';

  // Global config storage
  window.ZMARTY_SUPABASE_CONFIG = {
    loaded: false,
    supabaseUrl: null,
    supabaseAnonKey: null,
    error: null
  };

  // Load configuration from Netlify function
  async function loadSupabaseConfig() {
    try {
      const response = await fetch('/.netlify/functions/get-supabase-config');

      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
      }

      const config = await response.json();

      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error('Invalid configuration received from server');
      }

      // Store in global config
      window.ZMARTY_SUPABASE_CONFIG.supabaseUrl = config.supabaseUrl;
      window.ZMARTY_SUPABASE_CONFIG.supabaseAnonKey = config.supabaseAnonKey;
      window.ZMARTY_SUPABASE_CONFIG.loaded = true;

      return config;
    } catch (error) {
      console.error('Error loading Supabase configuration:', error);
      window.ZMARTY_SUPABASE_CONFIG.error = error.message;
      throw error;
    }
  }

  // Initialize Supabase client after config is loaded
  async function initializeSupabaseClient() {
    try {
      // Load config first
      const config = await loadSupabaseConfig();

      // Wait for Supabase library to load
      if (!window.supabase) {
        await loadSupabaseLibrary();
      }

      // Create Supabase client
      const { createClient } = supabase;
      const client = createClient(config.supabaseUrl, config.supabaseAnonKey);

      console.log('✅ Supabase client initialized successfully');
      return client;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      throw error;
    }
  }

  // Load Supabase library from CDN
  function loadSupabaseLibrary() {
    return new Promise((resolve, reject) => {
      if (window.supabase) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@supabase/supabase-js@2';

      const timeoutId = setTimeout(() => {
        reject(new Error('Supabase library loading timeout'));
      }, 10000);

      script.onload = () => {
        clearTimeout(timeoutId);
        if (window.supabase) {
          console.log('✅ Supabase library loaded');
          resolve();
        } else {
          reject(new Error('Supabase library not available after load'));
        }
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load Supabase library from CDN'));
      };

      document.head.appendChild(script);
    });
  }

  // Export functions to global scope
  window.initializeSupabaseClient = initializeSupabaseClient;
  window.loadSupabaseConfig = loadSupabaseConfig;

})();
