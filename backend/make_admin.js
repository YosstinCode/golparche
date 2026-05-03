require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function makeAdmin(email) {
  if (!email) {
    console.error("Por favor, provee un email: node make_admin.js <tu-email>");
    process.exit(1);
  }

  console.log(`Buscando usuario con email: ${email}...`);

  // 1. Buscar al usuario
  const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
  if (userError) {
    console.error("Error al obtener usuarios:", userError.message);
    process.exit(1);
  }

  const user = users.users.find(u => u.email === email);
  if (!user) {
    console.error(`Usuario no encontrado con email ${email}`);
    process.exit(1);
  }

  // 2. Actualizar el perfil a admin
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ rol: 'admin' })
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) {
    console.error("Error al actualizar a admin:", error.message);
  } else {
    console.log(" ¡Éxito! El usuario ha sido ascendido a Administrador.");
    console.log("Información del perfil actualizado:", data);
  }
}

makeAdmin(process.argv[2]);
