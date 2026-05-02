/**
 * bookings.data.js
 * Módulo de datos compartido que simula la base de datos de reservas.
 * En los incrementos futuros (3+) este array se irá poblando con reservas reales.
 */

const mockBookings = [
  // Reservas pre-cargadas para demostrar la validación del Incremento 2
  { cancha_id: '1', fecha: new Date().toISOString().split('T')[0], hora: '15:00' },
  { cancha_id: '1', fecha: new Date().toISOString().split('T')[0], hora: '17:00' },
  { cancha_id: '2', fecha: new Date().toISOString().split('T')[0], hora: '16:00' },
  { cancha_id: '3', fecha: new Date().toISOString().split('T')[0], hora: '19:00' },
];

/**
 * Verifica si un slot (cancha + fecha + hora) ya está ocupado.
 * @param {string} cancha_id
 * @param {string} fecha  - formato YYYY-MM-DD
 * @param {string} hora   - formato HH:00
 * @returns {boolean} true si está ocupado
 */
const isSlotTaken = (cancha_id, fecha, hora) => {
  return mockBookings.some(
    (b) =>
      b.cancha_id === String(cancha_id) &&
      b.fecha === fecha &&
      b.hora === hora
  );
};

module.exports = { mockBookings, isSlotTaken };
