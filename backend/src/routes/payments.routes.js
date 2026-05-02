const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

/**
 * POST /payments
 * Simula un pago y guarda el registro en la tabla pagos de Supabase.
 *
 * Body: { booking_id, card_number, card_holder, expiry, cvv }
 */
router.post('/', async (req, res) => {
  const { booking_id, card_number, card_holder, expiry, cvv } = req.body;

  // ── Validación de campos ────────────────────────────────────────
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

  // ── Buscar la reserva en Supabase ───────────────────────────────
  const { data: booking, error: fetchError } = await supabaseAdmin
    .from('reservas')
    .select('id, estado, precio_total')
    .eq('id', booking_id)
    .single();

  if (fetchError || !booking) {
    return res.status(404).json({ error: 'Reserva no encontrada. Verifica el ID.' });
  }

  if (booking.estado !== 'pendiente') {
    return res.status(409).json({
      error: `Esta reserva ya fue procesada (estado actual: ${booking.estado}).`,
    });
  }

  // ── Simular pasarela de pago (CVV 000 = rechazado) ─────────────
  if (cvv === '000') {
    // Registrar el intento fallido en pagos
    await supabaseAdmin.from('pagos').insert([{
      reserva_id: booking_id,
      monto: booking.precio_total,
      estado: 'rechazado',
      transaccion_id: `TXN-REJECTED-${Date.now()}`,
      ultimos4: cleanCardNumber.slice(-4),
    }]);

    return res.status(402).json({
      approved: false,
      error: 'Pago rechazado. Tu tarjeta fue declinada. Verifica los datos e intenta de nuevo.',
    });
  }

  const transaccion_id = `TXN-${Date.now()}`;

  // ── Guardar el pago aprobado ────────────────────────────────────
  await supabaseAdmin.from('pagos').insert([{
    reserva_id: booking_id,
    monto: booking.precio_total,
    estado: 'aprobado',
    transaccion_id,
    ultimos4: cleanCardNumber.slice(-4),
  }]);

  // ── Actualizar estado de la reserva a "pagado" ──────────────────
  const { data: updatedBooking, error: updateError } = await supabaseAdmin
    .from('reservas')
    .update({ estado: 'pagado', updated_at: new Date().toISOString() })
    .eq('id', booking_id)
    .select('*')
    .single();

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.status(200).json({
    approved: true,
    message: '¡Pago aprobado! Tu reserva ha sido pagada exitosamente.',
    reserva: updatedBooking,
    transaccion_id,
  });
});

module.exports = router;
