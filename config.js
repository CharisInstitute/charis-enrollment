const SUPABASE_URL = 'https://hhtgbhacspqbctnvuoab.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodGdiaGFjc3BxYmN0bnZ1b2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODE3MzYsImV4cCI6MjA5MDU1NzczNn0.aIZhl23t97iKCZBeLSrN7l2GNpIvH8iVU2jq9t-5qEg';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GRADES = [
  'Pre-K','Kindergarten','1st Grade','2nd Grade','3rd Grade',
  '4th Grade','5th Grade','6th Grade','7th Grade','8th Grade',
  '9th Grade','10th Grade','11th Grade','12th Grade'
];
const PAYMENT_TYPES = ['Tuition', 'Test Fee'];
const PAYMENT_METHODS = ['Cash', 'Check', 'Online', 'Card'];
const PAYMENT_STATUSES = ['Paid', 'Pending', 'Waived'];
