/**
 * bookings.data.js
 * Módulo compartido que simula la persistencia de reservas.
 * Es la única fuente de verdad para availability y bookings.
 */

const { randomUUID } = require('crypto');

// ─── Campos disponibles (fuente única de verdad) ─────────────────
const mockFields = [
  { id: 1, name: 'Cancha Principal - La 10',  price_per_hour: 50000 },
  { id: 2, name: 'Cancha Los Cracks',          price_per_hour: 60000 },
  { id: 3, name: 'Cancha El Potrero',          price_per_hour: 80000 },
];

// ─── Reservas en memoria (pre-cargadas para demo del Inc 2) ──────
const bookings = [
  {
    id: randomUUID(),
    cancha_id: 1, cancha_nombre: 'Cancha Principal - La 10',
    fecha: new Date().toISOString().split('T')[0], hora: '15:00',
    estado: 'pendiente', precio_total: 50000,
    creado_en: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    cancha_id: 1, cancha_nombre: 'Cancha Principal - La 10',
    fecha: new Date().toISOString().split('T')[0], hora: '17:00',
    estado: 'pendiente', precio_total: 50000,
    creado_en: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    cancha_id: 2, cancha_nombre: 'Cancha Los Cracks',
    fecha: new Date().toISOString().split('T')[0], hora: '16:00',
    estado: 'pendiente', precio_total: 60000,
    creado_en: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    cancha_id: 3, cancha_nombre: 'Cancha El Potrero',
    fecha: new Date().toISOString().split('T')[0], hora: '19:00',
    estado: 'pendiente', precio_total: 80000,
    creado_en: new Date().toISOString(),
  },
];

/**
 * Verifica si un slot ya está ocupado.
 * Busca en el array compartido de bookings.
 */
const isSlotTaken = (cancha_id, fecha, hora) => {
  return bookings.some(
    (b) =>
      String(b.cancha_id) === String(cancha_id) &&
      b.fecha === fecha &&
      b.hora === hora
  );
};

/**
 * Crea una nueva reserva y la agrega al array compartido.
 */
const createBooking = (cancha_id, fecha, hora) => {
  const field = mockFields.find(f => f.id === parseInt(cancha_id));
  if (!field) return null;

  const newBooking = {
    id: randomUUID(),
    cancha_id: field.id,
    cancha_nombre: field.name,
    fecha,
    hora,
    estado: 'pendiente',
    precio_total: field.price_per_hour,
    creado_en: new Date().toISOString(),
  };

  bookings.push(newBooking);
  return newBooking;
};

/**
 * Busca una reserva por su ID.
 */
const findBookingById = (id) => bookings.find(b => b.id === id) || null;

/**
 * Actualiza el estado de una reserva por su ID.
 * @returns {object|null} la reserva actualizada, o null si no existe
 */
const updateBookingStatus = (id, newEstado) => {
  const booking = bookings.find(b => b.id === id);
  if (!booking) return null;
  booking.estado = newEstado;
  booking.actualizado_en = new Date().toISOString();
  return booking;
};

module.exports = { mockFields, bookings, isSlotTaken, createBooking, findBookingById, updateBookingStatus };
