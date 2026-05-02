require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function test() {
  const { data, error } = await supabaseAdmin.from('canchas').select('*');
  console.log("Canchas in DB:", data);
}
test();
