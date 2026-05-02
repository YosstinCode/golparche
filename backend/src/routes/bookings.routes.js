const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');

// Import mock fields to get the price
// In a real app this would query the DB
const mockFields = [
  { id: 1, name: 'Cancha Principal - La 10', price_per_hour: 50000 },
  { id: 2, name: 'Cancha Los Cracks', price_per_hour: 60000 },
  { id: 3, name: 'Cancha El Potrero', price_per_hour: 80000 }
];

// In-memory bookings store
const bookings = [];

router.post('/', (req, res) => {
  const { cancha_id, fecha, hora } = req.body;

  if (!cancha_id || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan datos requeridos (cancha_id, fecha, hora)' });
  }

  // Find the court to calculate total
  const court = mockFields.find(c => c.id === parseInt(cancha_id));
  if (!court) {
    return res.status(404).json({ error: 'Cancha no encontrada' });
  }

  // Calculate total (assuming 1 hour for Increment 3)
  const precio_total = court.price_per_hour;

  // Create pending booking
  const newBooking = {
    id: randomUUID(),
    cancha_id: parseInt(cancha_id),
    cancha_nombre: court.name,
    fecha,
    hora,
    estado: 'pendiente',
    precio_total,
    creado_en: new Date().toISOString()
  };

  bookings.push(newBooking);

  res.status(201).json({
    message: 'Reserva creada exitosamente',
    reserva: newBooking
  });
});

// Optional: Endpoint to check memory bookings (for debugging)
router.get('/', (req, res) => {
  res.json(bookings);
});

module.exports = router;
