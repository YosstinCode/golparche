const express = require('express');
const router = express.Router();
const { isSlotTaken, createBooking, findBookingById, updateBookingStatus, bookings } = require('../bookings.data');

/**
 * POST /bookings
 * Crea una reserva nueva con estado "pendiente".
 * 
 * Body: { cancha_id, fecha, hora }
 * 
 * Respuesta exitosa:
 *   { message, reserva: { id, cancha_id, cancha_nombre, fecha, hora, estado, precio_total, creado_en } }
 */
router.post('/', (req, res) => {
  const { cancha_id, fecha, hora } = req.body;

  if (!cancha_id || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan datos requeridos: cancha_id, fecha, hora' });
  }

  // Double-check: re-validate availability before creating
  // (in case two users hit the button at the same time)
  if (isSlotTaken(cancha_id, fecha, hora)) {
    return res.status(409).json({
      error: `El horario ${hora} del ${fecha} ya fue reservado mientras completabas el proceso. Por favor elige otro horario.`,
    });
  }

  const newBooking = createBooking(cancha_id, fecha, hora);

  if (!newBooking) {
    return res.status(404).json({ error: 'Cancha no encontrada' });
  }

  return res.status(201).json({
    message: '¡Reserva creada exitosamente!',
    reserva: newBooking,
  });
});

/**
 * GET /bookings
 * Lista todas las reservas (útil para debugging).
 */
router.get('/', (req, res) => {
  res.json(bookings);
});

/**
 * GET /bookings/:id
 * Obtiene una reserva por su ID.
 */
router.get('/:id', (req, res) => {
  const booking = findBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Reserva no encontrada' });
  }
  res.json(booking);
});

/**
 * PATCH /bookings/:id/confirm
 * Incremento 5: Confirms a paid booking, transitioning it from "pagado" → "confirmado".
 * This is the final step of the booking flow.
 */
router.patch('/:id/confirm', (req, res) => {
  const booking = findBookingById(req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Reserva no encontrada.' });
  }

  if (booking.estado !== 'pagado') {
    return res.status(409).json({
      error: `No se puede confirmar esta reserva. Estado actual: "${booking.estado}". Solo las reservas pagadas pueden confirmarse.`,
    });
  }

  const confirmed = updateBookingStatus(req.params.id, 'confirmado');
  confirmed.confirmado_en = new Date().toISOString();

  return res.status(200).json({
    message: '¡Reserva confirmada exitosamente!',
    reserva: confirmed,
  });
});

module.exports = router;
