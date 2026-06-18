import { createClient } from '@supabase/supabase-js';

const OPS_SUPABASE_URL = 'https://ygibcrpzlxsbkccaqzke.supabase.co';
const OPS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaWJjcnB6bHhzYmtjY2FxemtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzQ3MDcsImV4cCI6MjA5MjIxMDcwN30.9i4tKmRVh5JeqyNSuHohd0fq_5_4TxBeBhymQ2jW6BU';

export const opsSupabase = createClient(OPS_SUPABASE_URL, OPS_SUPABASE_ANON_KEY);
