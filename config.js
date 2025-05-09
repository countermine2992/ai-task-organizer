// Create and initialize Supabase client
const supabaseUrl = 'https://axztmzgblyudwbiqpsrm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4enRtemdibHl1ZHdiaXFwc3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MDU5NTIsImV4cCI6MjA2MjI4MTk1Mn0.7RcvxBxQ225j6UVfni1nu3jyH4NRLUAx5as9PtSV2jk';

console.log('Config.js loaded');
console.log('Checking for Supabase library...');
console.log('supabase object:', typeof supabase);
console.log('supabase.createClient:', typeof supabase?.createClient);

try {
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not found in global scope');
        throw new Error('Supabase client library not loaded');
    }
    
    if (typeof supabase.createClient !== 'function') {
        console.error('supabase.createClient is not a function:', typeof supabase.createClient);
        throw new Error('Supabase createClient method not found');
    }
    
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    // Initialize the client
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created successfully');
    
    // Test connection
    console.log('Testing initial connection...');
    window.supabaseClient
        .from('tasks')
        .select('count')
        .then(({ data, error }) => {
            if (error) {
                if (error.code === '42P01') {
                    console.error('Tasks table does not exist. Please create the table in your Supabase database.');
                    alert('Database setup required: The tasks table does not exist. Please contact the administrator.');
                } else {
                    console.error('Initial connection test failed:', error);
                    alert('Failed to connect to Supabase. Please check your configuration.');
                }
                throw error;
            }
            console.log('Initial connection test successful:', data);
        })
        .catch(error => {
            if (error.code === '42P01') {
                console.error('Tasks table does not exist. Please create the table in your Supabase database.');
                alert('Database setup required: The tasks table does not exist. Please contact the administrator.');
            } else {
                console.error('Connection test failed:', error);
                alert('Failed to connect to Supabase. Please check your configuration.');
            }
        });
} catch (error) {
    console.error('Error initializing Supabase client:', error);
    alert('Failed to initialize Supabase client. Please check your configuration.');
}

// Grok API configuration
window.GROK_API_URL = 'https://api.grok.ai/v1/analyze';
window.GROK_API_KEY = 'xai-MAUrtjrpSRRkVtDXIRqe1pdYIeATJgWYbuMUO9oiBrVPOR1sbIdVz1p3nLhrqUUE8PUHi0kI6J78JMPI'; 