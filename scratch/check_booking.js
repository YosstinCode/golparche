const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const id = '89c366b7-55e0-42f8-9a73-0a3ba7743061';
  const { data, error } = await supabase.from('reservas').select('*').eq('id', id).single();
  if (error) console.error(error);
  else console.log('Booking found:', data);
}

check();
