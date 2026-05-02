import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001';

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, loading, success, error
  const [bookingDetails, setBookingDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Extract selected data from navigation state
  const { court, date, hour } = location.state || {};

  useEffect(() => {
    // If accessed directly without data, redirect to start
    if (!court || !date || !hour) {
      navigate('/');
    }
  }, [court, date, hour, navigate]);

  const handleConfirmBooking = async () => {
    setBookingStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancha_id: court.id,
          fecha: date,
          hora: hour
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la reserva');
      }

      setBookingStatus('success');
      setBookingDetails(data.reserva);

    } catch (error) {
      setBookingStatus('error');
      setErrorMessage(error.message);
    }
  };

  if (!court) return null;

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Resumen de tu Reserva</h2>
      
      {bookingStatus === 'success' && bookingDetails ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '30px' }}>
            ✓
          </div>
          <h3 style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>¡Reserva Pendiente Creada!</h3>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem' }}>
            <p><strong>Cancha:</strong> {bookingDetails.cancha_nombre}</p>
            <p><strong>Fecha:</strong> {bookingDetails.fecha}</p>
            <p><strong>Hora:</strong> {bookingDetails.hora}</p>
            <hr style={{ borderColor: 'var(--surface-light)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem' }}>
              <span>Total a pagar:</span>
              <span className="text-gradient" style={{ fontWeight: 'bold' }}>
                ${bookingDetails.precio_total.toLocaleString('es-CO')}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'right' }}>
              Estado: <span style={{ color: 'var(--accent-color)' }}>{bookingDetails.estado.toUpperCase()}</span>
            </p>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Para asegurar tu cupo, debes realizar el pago a continuación.
          </p>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', fontSize: '1.125rem' }}
            onClick={() => alert('¡Preparado para el Incremento 4: Pago!')}
          >
            Ir a Pagar
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
            <img src={court.image_url} alt={court.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{court.name}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.25rem 0' }}>📅 Fecha: <strong>{date}</strong></p>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>⏰ Hora: <strong>{hour}</strong></p>
            </div>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>Valor por hora:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
              ${court.price_per_hour.toLocaleString('es-CO')}
            </span>
          </div>

          {bookingStatus === 'error' && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--danger-color)', marginBottom: '1.5rem', textAlign: 'center' }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-outline" 
              style={{ flex: 1 }}
              onClick={() => navigate(-1)}
              disabled={bookingStatus === 'loading'}
            >
              Volver
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 2, justifyContent: 'center' }}
              onClick={handleConfirmBooking}
              disabled={bookingStatus === 'loading'}
            >
              {bookingStatus === 'loading' ? (
                <div className="spinner" style={{ width: '20px', height: '20px', margin: 0, borderWidth: '2px' }}></div>
              ) : 'Confirmar Reserva'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingSummary;
