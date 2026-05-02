import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  MapPin,
  CalendarDays,
  Clock,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

const CourtSelection = () => {
  const navigate = useNavigate();

  const [courts, setCourts] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState(null);

  const [date, setDate] = useState('');

  const [availableHours, setAvailableHours] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);

  // Incremento 2: validation state
  const [validationStatus, setValidationStatus] = useState(null); // null | 'loading' | 'available' | 'unavailable'
  const [validationMessage, setValidationMessage] = useState('');

  // Fetch courts on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/fields`)
      .then(res => res.json())
      .then(data => {
        setCourts(data);
        setLoadingCourts(false);
      })
      .catch(err => {
        console.error('Error fetching courts:', err);
        setLoadingCourts(false);
      });
  }, []);

  // Fetch availability when court and date change
  useEffect(() => {
    if (selectedCourt && date) {
      setLoadingHours(true);
      setSelectedHour(null);
      setValidationStatus(null);
      fetch(`${API_BASE_URL}/availability?cancha_id=${selectedCourt.id}&fecha=${date}`)
        .then(res => res.json())
        .then(data => {
          setAvailableHours(data.available_hours || []);
          setLoadingHours(false);
        })
        .catch(err => {
          console.error('Error fetching availability:', err);
          setLoadingHours(false);
        });
    } else {
      setAvailableHours([]);
    }
  }, [selectedCourt, date]);

  const handleCourtSelect = (court) => {
    setSelectedCourt(court);
    setSelectedHour(null);
    setValidationStatus(null);
  };

  const handleHourSelect = (hour) => {
    setSelectedHour(hour);
    setValidationStatus(null);
  };

  // ── Incremento 2: Validate the selected slot ──────────────────
  const handleConfirm = async () => {
    if (!selectedCourt || !date || !selectedHour) return;

    setValidationStatus('loading');
    setValidationMessage('');

    try {
      const res = await fetch(
        `${API_BASE_URL}/availability/validate?cancha_id=${selectedCourt.id}&fecha=${date}&hora=${selectedHour}`
      );
      const data = await res.json();

      if (data.available) {
        setValidationStatus('available');
        setValidationMessage(data.message);

        setTimeout(() => {
          navigate('/checkout', {
            state: { court: selectedCourt, date, hour: selectedHour },
          });
        }, 1200);
      } else {
        setValidationStatus('unavailable');
        setValidationMessage(data.message || 'Este horario ya está reservado.');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setValidationStatus('unavailable');
      setValidationMessage('Error al validar disponibilidad. Intenta de nuevo.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Reserva tu Cancha</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Selecciona la cancha, fecha y hora en la que deseas jugar.
      </p>

      {/* Courts Selection */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-light)', paddingBottom: '0.5rem' }}>
          1. Selecciona una cancha
        </h3>

        {loadingCourts ? (
          <div className="spinner"></div>
        ) : (
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {courts.map(court => (
              <div
                key={court.id}
                className={`court-card glass-panel ${selectedCourt?.id === court.id ? 'selected' : ''}`}
                onClick={() => handleCourtSelect(court)}
              >
                <img src={court.imagen_url} alt={court.nombre} className="court-image" />
                <div className="court-content">
                  <h4 className="court-title">{court.nombre}</h4>
                  <p className="court-desc">{court.descripcion}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="court-price">${court.precio_hora.toLocaleString('es-CO')} / hr</span>
                    <button
                      className={`btn ${selectedCourt?.id === court.id ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      {selectedCourt?.id === court.id ? (
                        <><CheckCircle size={14} /> Seleccionada</>
                      ) : (
                        <>Elegir <ChevronRight size={14} /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date & Time Selection */}
      {selectedCourt && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-light)', paddingBottom: '0.5rem' }}>
            2. Elige fecha y hora
          </h3>

          <div className="grid sm:grid-cols-2 grid-cols-1" style={{ gap: '2rem' }}>
            <div className="input-group">
              <label htmlFor="date-picker" className="input-label">
                <CalendarDays size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                Fecha de reserva
              </label>
              <input
                id="date-picker"
                type="date"
                className="form-control"
                min={today}
                value={date}
                onChange={(e) => { setDate(e.target.value); setValidationStatus(null); }}
              />
            </div>
          </div>

          {date && (
            <div style={{ marginTop: '1.5rem' }}>
              <label className="input-label">
                <Clock size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                Horarios disponibles
              </label>

              {loadingHours ? (
                <div className="spinner" style={{ width: '30px', height: '30px', margin: '1rem 0' }}></div>
              ) : availableHours.length > 0 ? (
                <div className="time-slot-grid">
                  {availableHours.map(hour => (
                    <button
                      key={hour}
                      className={`time-slot ${selectedHour === hour ? 'selected' : ''}`}
                      onClick={() => handleHourSelect(hour)}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--danger-color)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <XCircle size={16} /> No hay horarios disponibles para esta fecha.
                </div>
              )}
            </div>
          )}

          {/* ── Incremento 2: Validation status banner ──────────── */}
          {validationStatus === 'loading' && (
            <div className="status-banner status-banner-loading">
              <Loader2 size={18} style={{ flexShrink: 0, animation: 'spin 0.8s linear infinite' }} />
              <span>Validando disponibilidad del horario...</span>
            </div>
          )}

          {validationStatus === 'available' && (
            <div className="status-banner status-banner-success">
              <CheckCircle size={20} style={{ flexShrink: 0 }} />
              <span>{validationMessage}</span>
            </div>
          )}

          {validationStatus === 'unavailable' && (
            <div className="status-banner status-banner-error">
              <XCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600 }}>Horario no disponible</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.2rem' }}>{validationMessage}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--surface-light)', paddingTop: '1.5rem', gap: '1rem' }}>
        {validationStatus === 'unavailable' && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', alignSelf: 'center', marginRight: 'auto' }}>
            Selecciona otro horario para continuar.
          </p>
        )}
        <button
          className="btn btn-primary"
          disabled={!selectedCourt || !date || !selectedHour || validationStatus === 'loading' || validationStatus === 'available'}
          onClick={handleConfirm}
          style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
        >
          {validationStatus === 'loading' ? (
            <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Validando...</>
          ) : (
            <>Confirmar Selección <ChevronRight size={18} /></>
          )}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CourtSelection;
