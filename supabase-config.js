// ===========================================================
// Supabase configuration
// ===========================================================
// 1. Go to https://supabase.com and create a free project
// 2. In your project: Project Settings -> API
//    Copy the "Project URL" and the "anon public" key
// 3. Paste the two values below
// 4. Open the SQL Editor -> New query -> paste the contents of
//    schema.sql (included in this project) -> Run
//    This creates the profiles / tasks / shared_deadlines tables
//    plus the row-level security policies the app relies on.
// ===========================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://fuzbbxdlecympuvotygs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emJieGRsZWN5bXB1dm90eWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzIzODMsImV4cCI6MjEwNDYwODM4M30.Lt_1JnsqHUB6cpPKI1Rr8Z8AXgLVDGc-qPJAYTzuG4I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
