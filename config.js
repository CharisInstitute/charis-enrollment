// ============================================================
//  CHARIS CHRISTIAN INSTITUTE — SUPABASE CONFIGURATION
//  Replace the two values below with your Supabase project info
//  Found in: Supabase Dashboard → Project Settings → API
// ============================================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL';        // e.g. https://xyzabc.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // starts with "eyJ..."

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GRADES = [
  'Pre-K','Kindergarten','1st Grade','2nd Grade','3rd Grade',
  '4th Grade','5th Grade','6th Grade','7th Grade','8th Grade',
  '9th Grade','10th Grade','11th Grade','12th Grade'
];

const PAYMENT_TYPES = ['Tuition', 'Test Fee'];
const PAYMENT_METHODS = ['Cash', 'Check', 'Online', 'Card'];
const PAYMENT_STATUSES = ['Paid', 'Pending', 'Waived'];
