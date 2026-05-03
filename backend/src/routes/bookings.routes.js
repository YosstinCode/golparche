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
      estado: 'pagado',
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
 * GET /bookings/user/:user_id
 * Alternativa para listar reservas por ID de usuario (usada por el frontend).
 */
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

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

module.exports = router;
