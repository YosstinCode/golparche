import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001';

const CourtSelection = () => {
  const [courts, setCourts] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState(null);
  
  const [date, setDate] = useState('');
  
  const [availableHours, setAvailableHours] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);

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
    // Reset hour selection when changing court
    setSelectedHour(null);
  };

  const handleContinue = () => {
    if (selectedCourt && date && selectedHour) {
      alert(`¡Selección completada (Incremento 1)!\nCancha: ${selectedCourt.name}\nFecha: ${date}\nHora: ${selectedHour}\n\nListo para el Incremento 2.`);
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
                <img src={court.image_url} alt={court.name} className="court-image" />
                <div className="court-content">
                  <h4 className="court-title">{court.name}</h4>
                  <p className="court-desc">{court.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="court-price">${court.price_per_hour.toLocaleString('es-CO')} / hr</span>
                    <button className={`btn ${selectedCourt?.id === court.id ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                      {selectedCourt?.id === court.id ? 'Seleccionada' : 'Elegir'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date & Time Selection (only show if court selected) */}
      {selectedCourt && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-light)', paddingBottom: '0.5rem' }}>
            2. Elige fecha y hora
          </h3>
          
          <div className="grid sm:grid-cols-2 grid-cols-1" style={{ gap: '2rem' }}>
            <div className="input-group">
              <label htmlFor="date-picker" className="input-label">Fecha de reserva</label>
              <input 
                id="date-picker"
                type="date" 
                className="form-control"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {date && (
            <div style={{ marginTop: '1.5rem' }}>
              <label className="input-label">Horarios disponibles</label>
              
              {loadingHours ? (
                <div className="spinner" style={{ width: '30px', height: '30px', margin: '1rem 0' }}></div>
              ) : availableHours.length > 0 ? (
                <div className="time-slot-grid">
                  {availableHours.map(hour => (
                    <button
                      key={hour}
                      className={`time-slot ${selectedHour === hour ? 'selected' : ''}`}
                      onClick={() => setSelectedHour(hour)}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--danger-color)', marginTop: '0.5rem' }}>
                  No hay horarios disponibles para esta fecha.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--surface-light)', paddingTop: '1.5rem' }}>
        <button 
          className="btn btn-primary"
          disabled={!selectedCourt || !date || !selectedHour}
          onClick={handleContinue}
          style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
        >
          Confirmar Selección
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
