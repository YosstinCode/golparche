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
 * GET /admin/bookings
 * Lista todas las reservas con filtros opcionales.
 * Query params: cancha_id, fecha, estado
 */
router.get('/bookings', async (req, res) => {
  const { cancha_id, fecha, estado } = req.query;

  let query = supabaseAdmin
    .from('reservas')
    .select(`
      *,
      canchas (nombre, tipo),
      profiles (nombre)
    `)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true });

  if (cancha_id) query = query.eq('cancha_id', cancha_id);
  if (fecha)     query = query.eq('fecha', fecha);
  if (estado)    query = query.eq('estado', estado);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

/**
 * GET /admin/bookings/verify/:codigo
 * Verifica un código GP-XXXX y retorna la reserva asociada.
 */
router.get('/bookings/verify/:codigo', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('reservas')
    .select(`
      *,
      canchas (nombre, tipo),
      profiles (nombre)
    `)
    .eq('codigo_reserva', req.params.codigo.toUpperCase())
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Código de reserva no encontrado.' });
  }

  res.json(data);
});

/**
 * PATCH /admin/bookings/:id/cancel
 * Cancela una reserva con motivo obligatorio.
 * Body: { motivo }
 */
router.patch('/bookings/:id/cancel', async (req, res) => {
  const { motivo } = req.body;
  if (!motivo) return res.status(400).json({ error: 'El motivo de cancelación es requerido.' });

  const { data: booking } = await supabaseAdmin
    .from('reservas')
    .select('id, estado')
    .eq('id', req.params.id)
    .single();

  if (!booking) return res.status(404).json({ error: 'Reserva no encontrada.' });
  if (['cancelada', 'completada', 'inasistencia'].includes(booking.estado)) {
    return res.status(409).json({ error: `No se puede cancelar una reserva en estado "${booking.estado}".` });
  }

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .update({ estado: 'cancelada', updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Reserva cancelada correctamente.', reserva: data });
});

/**
 * PATCH /admin/bookings/:id/reschedule
 * Reprograma una reserva (nueva fecha y hora).
 * Body: { nueva_fecha, nueva_hora }
 */
router.patch('/bookings/:id/reschedule', async (req, res) => {
  const { nueva_fecha, nueva_hora } = req.body;
  if (!nueva_fecha || !nueva_hora) {
    return res.status(400).json({ error: 'nueva_fecha y nueva_hora son requeridos.' });
  }

  const { data: booking } = await supabaseAdmin
    .from('reservas')
    .select('id, estado, cancha_id')
    .eq('id', req.params.id)
    .single();

  if (!booking) return res.status(404).json({ error: 'Reserva no encontrada.' });

  // Check if the new slot is available
  const { data: conflict } = await supabaseAdmin
    .from('reservas')
    .select('id')
    .eq('cancha_id', booking.cancha_id)
    .eq('fecha', nueva_fecha)
    .eq('hora', nueva_hora)
    .neq('id', req.params.id)
    .not('estado', 'in', '("cancelada","inasistencia")')
    .maybeSingle();

  if (conflict) {
    return res.status(409).json({ error: `El horario ${nueva_hora} del ${nueva_fecha} ya está ocupado.` });
  }

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .update({ fecha: nueva_fecha, hora: nueva_hora, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Reserva reprogramada correctamente.', reserva: data });
});

/**
 * PATCH /admin/bookings/:id/attendance
 * Marca asistencia confirmada → estado "completado".
 */
router.patch('/bookings/:id/attendance', async (req, res) => {
  const { data: booking } = await supabaseAdmin
    .from('reservas')
    .select('id, estado')
    .eq('id', req.params.id)
    .single();

  if (!booking) return res.status(404).json({ error: 'Reserva no encontrada.' });
  if (booking.estado !== 'confirmado') {
    return res.status(409).json({ error: `Solo se puede registrar asistencia en reservas confirmadas. Estado actual: "${booking.estado}".` });
  }

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .update({ estado: 'completada', updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Asistencia registrada. Reserva marcada como completada.', reserva: data });
});

/**
 * PATCH /admin/bookings/:id/no-show
 * Marca inasistencia → estado "inasistencia".
 */
router.patch('/bookings/:id/no-show', async (req, res) => {
  const { data: booking } = await supabaseAdmin
    .from('reservas')
    .select('id, estado')
    .eq('id', req.params.id)
    .single();

  if (!booking) return res.status(404).json({ error: 'Reserva no encontrada.' });
  if (booking.estado !== 'confirmado') {
    return res.status(409).json({ error: `Solo se puede marcar inasistencia en reservas confirmadas. Estado actual: "${booking.estado}".` });
  }

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .update({ estado: 'inasistencia', updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Inasistencia registrada.', reserva: data });
});

/**
 * GET /admin/stats
 * Estadísticas generales del sistema.
 */
router.get('/stats', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const [totalRes, todayRes, pendientes, confirmadas, pagadas] = await Promise.all([
    supabaseAdmin.from('reservas').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('reservas').select('id', { count: 'exact', head: true }).eq('fecha', today),
    supabaseAdmin.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    supabaseAdmin.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'confirmado'),
    supabaseAdmin.from('reservas').select('id', { count: 'exact', head: true }).eq('estado', 'pagado'),
  ]);

  res.json({
    total_reservas: totalRes.count || 0,
    reservas_hoy: todayRes.count || 0,
    pendientes: pendientes.count || 0,
    confirmadas: confirmadas.count || 0,
    pagadas: pagadas.count || 0,
  });
});

/**
 * PATCH /admin/bookings/:id/confirm
 * El administrador confirma el pago → genera código de reserva único.
 */
router.patch('/bookings/:id/confirm', async (req, res) => {
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
