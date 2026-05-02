const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testSignup() {
  console.log("Intentando registro de prueba con Supabase...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test_error_400@golparche.com',
    password: 'Password123!',
    options: { data: { nombre: 'Test User' } }
  });

  if (error) {
    console.error("ERROR REAL DEVUELTO POR SUPABASE:");
    console.error(JSON.stringify(error, null, 2));
  } else {
    console.log("Registro exitoso. El problema no es el signup básico.");
    console.log(data);
    
    // Limpiamos el usuario de prueba (requeriría admin key, así que lo dejamos)
  }
}

testSignup();
