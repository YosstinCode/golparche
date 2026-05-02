const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

const ALL_HOURS = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

/**
 * GET /availability
 * Retorna las horas disponibles para una cancha y fecha dadas.
 * Query params: cancha_id, fecha
 */
router.get('/', async (req, res) => {
  const { cancha_id, fecha } = req.query;

  if (!cancha_id || !fecha) {
    return res.status(400).json({ error: 'cancha_id and fecha are required' });
  }

  // Buscar reservas activas para esa cancha y fecha
  const { data: reservasOcupadas, error } = await supabaseAdmin
    .from('reservas')
    .select('hora')
    .eq('cancha_id', cancha_id)
    .eq('fecha', fecha)
    .not('estado', 'in', '("cancelada","inasistencia")');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const horasOcupadas = reservasOcupadas.map(r => r.hora.substring(0, 5));
  const horasDisponibles = ALL_HOURS.filter(h => !horasOcupadas.includes(h));

  res.json({
    cancha_id,
    fecha,
    available_hours: horasDisponibles,
  });
});

/**
 * GET /availability/validate
 * Valida si un slot específico está disponible.
 * Query params: cancha_id, fecha, hora
 */
router.get('/validate', async (req, res) => {
  const { cancha_id, fecha, hora } = req.query;

  if (!cancha_id || !fecha || !hora) {
    return res.status(400).json({ error: 'cancha_id, fecha y hora son requeridos' });
  }

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .select('id')
    .eq('cancha_id', cancha_id)
    .eq('fecha', fecha)
    .eq('hora', hora)
    .not('estado', 'in', '("cancelada","inasistencia")')
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (data) {
    return res.status(200).json({
      available: false,
      message: `El horario ${hora} del ${fecha} ya está reservado para esta cancha.`,
    });
  }

  return res.status(200).json({
    available: true,
    message: '¡Horario disponible! Puedes continuar con tu reserva.',
  });
});

module.exports = router;
