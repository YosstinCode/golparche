const express = require('express');
const router = express.Router();
const { findBookingById, updateBookingStatus } = require('../bookings.data');

/**
 * POST /payments
 * Simulates a payment for a booking.
 *
 * Body: {
 *   booking_id: string,
 *   card_number: string,   // 16 digits
 *   card_holder: string,
 *   expiry: string,        // MM/YY
 *   cvv: string            // 3 digits
 * }
 *
 * Validation rules (simulation):
 *  - booking must exist and be in "pendiente" state
 *  - card_number must be 16 digits
 *  - cvv must NOT be "000" (simulate decline)
 *  - expiry must be present
 */
router.post('/', (req, res) => {
  const { booking_id, card_number, card_holder, expiry, cvv } = req.body;

  // ── Field validation ───────────────────────────────────────────
  if (!booking_id || !card_number || !card_holder || !expiry || !cvv) {
    return res.status(400).json({ error: 'Todos los campos de pago son requeridos.' });
  }

  const cleanCardNumber = card_number.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cleanCardNumber)) {
    return res.status(400).json({ error: 'El número de tarjeta debe tener 16 dígitos.' });
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return res.status(400).json({ error: 'La fecha de vencimiento debe tener el formato MM/AA.' });
  }

  if (!/^\d{3}$/.test(cvv)) {
    return res.status(400).json({ error: 'El CVV debe tener 3 dígitos.' });
  }

  // ── Booking lookup ─────────────────────────────────────────────
  const booking = findBookingById(booking_id);
  if (!booking) {
    return res.status(404).json({ error: 'Reserva no encontrada. Verifica el ID.' });
  }

  if (booking.estado !== 'pendiente') {
    return res.status(409).json({
      error: `Esta reserva ya fue procesada (estado actual: ${booking.estado}).`,
    });
  }

  // ── Payment simulation ─────────────────────────────────────────
  // Decline rule: CVV "000" simulates a declined card
  if (cvv === '000') {
    return res.status(402).json({
      approved: false,
      error: 'Pago rechazado. Tu tarjeta fue declinada. Verifica los datos e intenta de nuevo.',
    });
  }

  // Approve: update booking state to "pagado"
  const updatedBooking = updateBookingStatus(booking_id, 'pagado');

  return res.status(200).json({
    approved: true,
    message: '¡Pago aprobado! Tu reserva ha sido pagada exitosamente.',
    reserva: updatedBooking,
    transaccion_id: `TXN-${Date.now()}`,
  });
});

module.exports = router;
