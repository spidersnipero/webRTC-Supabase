import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://uuahrpeahqzitelslrux.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1YWhycGVhaHF6aXRlbHNscnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYwNzE4MzcsImV4cCI6MjAyMTY0NzgzN30.nrixbgI6fRZquhoCVT2XuS7wREY2cMnaa1FUKIw5BMY"
);

export default supabase;
