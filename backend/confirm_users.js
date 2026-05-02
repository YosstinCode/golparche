const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Usamos el Service Role Key para tener permisos de administrador y saltarnos las restricciones
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function autoConfirmUsers() {
  console.log("Buscando usuarios sin confirmar...");
  
  // Obtenemos todos los usuarios
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error("Error al obtener usuarios:", error);
    return;
  }

  let confirmados = 0;
  for (const user of users) {
    if (!user.email_confirmed_at) {
      console.log(`Confirmando al usuario: ${user.email}`);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      if (!updateError) confirmados++;
    }
  }

  console.log(`\n¡Listo! Se confirmaron ${confirmados} usuarios exitosamente.`);
}

autoConfirmUsers();
