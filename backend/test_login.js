const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testLogin() {
  console.log("Intentando login de prueba con Supabase...");
  // Creamos un usuario temporal para asegurar que sabemos la contraseña
  const email = `test_login_${Date.now()}@golparche.com`;
  const password = 'Password123!';
  
  await supabase.auth.signUp({ email, password, options: { data: { nombre: 'Test' } } });
  
  // Ahora intentamos login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("ERROR REAL DEVUELTO POR SUPABASE EN LOGIN:");
    console.error(JSON.stringify(error, null, 2));
  } else {
    console.log("Login exitoso. El problema de tu login debe ser la contraseña o que el correo no está confirmado.");
    console.log("Sesión activa para:", data.user.email);
  }
}

testLogin();
