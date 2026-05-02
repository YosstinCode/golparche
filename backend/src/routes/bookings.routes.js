const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Genera un código único de reserva tipo GP-XXXX
const generateBookingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GP-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * POST /bookings
 * Crea una reserva nueva con estado "pendiente" en Supabase.
 * Body: { cancha_id, fecha, hora, user_id, precio_total }
 */
router.post('/', async (req, res) => {
  const { cancha_id, fecha, hora, user_id, precio_total } = req.body;

  if (!cancha_id || !fecha || !hora || !user_id || !precio_total) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }

  // Doble validación race-condition: verificar disponibilidad en Supabase
  const { data: conflict } = await supabaseAdmin
    .from('reservas')
    .select('id')
    .eq('cancha_id', cancha_id)
    .eq('fecha', fecha)
    .eq('hora', hora)
    .not('estado', 'in', '("cancelada","inasistencia")')
    .maybeSingle();

  if (conflict) {
    return res.status(409).json({
      error: `El horario ${hora} del ${fecha} ya fue reservado. Por favor elige otro horario.`,
    });
  }

  // Crear la reserva
  const { data, error } = await supabaseAdmin
    .from('reservas')
    .insert([{
      user_id,
      cancha_id: parseInt(cancha_id),
      fecha,
      hora,
      estado: 'pendiente',
      precio_total: parseInt(precio_total),
    }])
    .select(`
      *,
      canchas (nombre, tipo, precio_hora, imagen_url),
      profiles (nombre)
    `)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({
    message: '¡Reserva creada exitosamente!',
    reserva: data,
  });
});

/**
 * GET /bookings/mine
 * Lista todas las reservas de un usuario específico.
 * Query param: user_id
 */
router.get('/mine', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id es requerido.' });
  }

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .select(`
      *,
      canchas (nombre, tipo, imagen_url)
    `)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

/**
 * GET /bookings/:id
 * Obtiene una reserva por su ID.
 */
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('reservas')
    .select(`
      *,
      canchas (nombre, tipo, precio_hora, imagen_url),
      profiles (nombre)
    `)
    .eq('id', req.params.id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Reserva no encontrada.' });
  }

  res.json(data);
});

/**
 * PATCH /bookings/:id/confirm
 * Confirma una reserva pagada → genera código de reserva único.
 */
router.patch('/:id/confirm', async (req, res) => {
  const { data: booking, error: fetchError } = await supabaseAdmin
    .from('reservas')
    .select('id, estado')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !booking) {
    return res.status(404).json({ error: 'Reserva no encontrada.' });
  }

  if (booking.estado !== 'pagado') {
    return res.status(409).json({
      error: `No se puede confirmar esta reserva. Estado actual: "${booking.estado}".`,
    });
  }

  // Generar código único (reintentar si hay colisión)
  let codigo;
  let intentos = 0;
  while (!codigo && intentos < 5) {
    const candidato = generateBookingCode();
    const { data: existing } = await supabaseAdmin
      .from('reservas')
      .select('id')
      .eq('codigo_reserva', candidato)
      .maybeSingle();
    if (!existing) codigo = candidato;
    intentos++;
  }

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .update({
      estado: 'confirmado',
      codigo_reserva: codigo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({
    message: '¡Reserva confirmada exitosamente!',
    reserva: data,
  });
});

module.exports = router;
