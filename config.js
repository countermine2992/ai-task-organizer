// Initialize Supabase client
const supabaseUrl = 'https://axztmzgblyudwbiqpsrm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4enRtemdibHl1ZHdiaXFwc3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MDU5NTIsImV4cCI6MjA2MjI4MTk1Mn0.7RcvxBxQ225j6UVfni1nu3jyH4NRLUAx5as9PtSV2jk';

console.log('Initializing Supabase client...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey.length);

// Create and export the Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
console.log('Supabase client created successfully');

// Grok API configuration
const GROK_API_URL = 'https://api.grok.ai/v1/analyze';
const GROK_API_KEY = 'xai-MAUrtjrpSRRkVtDXIRqe1pdYIeATJgWYbuMUO9oiBrVPOR1sbIdVz1p3nLhrqUUE8PUHi0kI6J78JMPI';

// Export configurations
export { supabase, GROK_API_URL, GROK_API_KEY }; 