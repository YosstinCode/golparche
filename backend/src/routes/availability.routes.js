const express = require('express');
const router = express.Router();
const { isSlotTaken } = require('../bookings.data');

// Simulated availability
const getAllHours = () => {
  const hours = [];
  for (let i = 14; i <= 22; i++) {
    hours.push(`${i}:00`);
  }
  return hours;
};

/**
 * GET /availability
 * Retorna las horas disponibles para una cancha y fecha dadas.
 * Query params: cancha_id, fecha
 */
router.get('/', (req, res) => {
  const { cancha_id, fecha } = req.query;

  if (!cancha_id || !fecha) {
    return res.status(400).json({ error: 'cancha_id and fecha are required' });
  }

  // Simulate some hours being taken randomly to make it realistic
  // Let's make it deterministic based on the date/id combination to avoid flickering
  const seed = parseInt(cancha_id) + new Date(fecha).getDate();
  const allHours = getAllHours();
  
  const availableHours = allHours.filter((hour, index) => {
    // Arbitrary logic to mock taken hours
    return (seed + index) % 3 !== 0; 
  });

  res.json({
    cancha_id,
    fecha,
    available_hours: availableHours
  });
});

/**
 * GET /availability/validate
 * Valida si un slot específico (cancha + fecha + hora) está disponible.
 * Query params: cancha_id, fecha, hora
 * 
 * Respuesta:
 *   { available: true }
 *   { available: false, message: "Este horario ya está reservado." }
 */
router.get('/validate', (req, res) => {
  const { cancha_id, fecha, hora } = req.query;

  if (!cancha_id || !fecha || !hora) {
    return res.status(400).json({
      error: 'cancha_id, fecha y hora son requeridos'
    });
  }

  const taken = isSlotTaken(cancha_id, fecha, hora);

  if (taken) {
    return res.status(200).json({
      available: false,
      message: `El horario ${hora} del ${fecha} ya está reservado para esta cancha.`
    });
  }

  return res.status(200).json({
    available: true,
    message: '¡Horario disponible! Puedes continuar con tu reserva.'
  });
});

module.exports = router;
