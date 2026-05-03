import React, { useState, useEffect } from 'react';
import { 
  Calendar, Download, BarChart2, DollarSign, 
  Activity, FileSpreadsheet, Clock, MapPin,
  TrendingUp, CalendarRange, Filter, Loader2,
  FileText
} from 'lucide-react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = 'http://localhost:3001';

const AdminReports = () => {
  const getFirstDayOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  };
  const getLastDayOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const [fechaInicio, setFechaInicio] = useState(getFirstDayOfMonth());
  const [fechaFin, setFechaFin] = useState(getLastDayOfMonth());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalIngresos: 0,
    ocupacionPorCancha: {},
    horasMasDemandadas: {},
  });

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      calculateStats(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const calculateStats = (data) => {
    let totalIngresos = 0;
    const ocupacion = {};
    const horas = {};
    data.forEach(b => {
      if (['pagado', 'confirmado', 'completada'].includes(b.estado)) totalIngresos += b.precio_total;
      if (!['cancelada'].includes(b.estado)) {
        const cancha = b.canchas?.nombre || `Cancha ${b.cancha_id}`;
        ocupacion[cancha] = (ocupacion[cancha] || 0) + 1;
        const hora = b.hora.substring(0, 5);
        horas[hora] = (horas[hora] || 0) + 1;
      }
    });
    setStats({ totalIngresos, ocupacionPorCancha: ocupacion, horasMasDemandadas: horas });
  };

  useEffect(() => { fetchReportData(); }, []);

  const handleExportCSV = () => {
    if (bookings.length === 0) { alert("No hay datos para exportar."); return; }
    const headers = ['ID', 'Cliente', 'Cancha', 'Fecha', 'Hora', 'Estado', 'Monto'];
    const rows = bookings.map(b => [b.id.split('-')[0], b.profiles?.nombre || 'User', b.canchas?.nombre || b.cancha_id, b.fecha, b.hora, b.estado, b.precio_total]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_${fechaInicio}.csv`);
    link.click();
  };

  const getTopHoras = () => Object.entries(stats.horasMasDemandadas).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '1.4rem' }}>Reportes</h1>
          <p className="admin-page-subtitle" style={{ fontSize: '0.8rem' }}>Rendimiento y ocupación</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV} disabled={loading || bookings.length === 0} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      <div className="reports-filter-card admin-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <div className="filter-inner">
          <div className="filter-group" style={{ gap: '1rem' }}>
            <CalendarRange size={18} className="filter-icon" />
            <div className="date-inputs" style={{ gap: '0.75rem' }}>
              <div className="input-with-label">
                <label style={{ fontSize: '0.65rem' }}>Desde</label>
                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
              </div>
              <div className="date-divider" style={{ marginTop: '0.8rem' }}></div>
              <div className="input-with-label">
                <label style={{ fontSize: '0.65rem' }}>Hasta</label>
                <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>
          <button className="btn btn-secondary filter-apply-btn" onClick={fetchReportData} disabled={loading} style={{ height: '40px', minWidth: '150px', fontSize: '0.85rem' }}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <>Aplicar <TrendingUp size={16} /></>}
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card report-stat-card" style={{ padding: '1.25rem' }}>
          <div className="stat-icon-box pink" style={{ width: '40px', height: '40px' }}><DollarSign size={20} /></div>
          <div className="stat-info">
            <span className="stat-label" style={{ fontSize: '0.75rem' }}>Ingresos</span>
            <span className="stat-value text-gradient-pink" style={{ fontSize: '1.25rem' }}>${stats.totalIngresos.toLocaleString('es-CO')}</span>
          </div>
        </div>
        <div className="stat-card report-stat-card" style={{ padding: '1.25rem' }}>
          <div className="stat-icon-box blue" style={{ width: '40px', height: '40px' }}><Activity size={20} /></div>
          <div className="stat-info">
            <span className="stat-label" style={{ fontSize: '0.75rem' }}>Reservas</span>
            <span className="stat-value" style={{ fontSize: '1.25rem' }}>{bookings.filter(b => !['cancelada'].includes(b.estado)).length}</span>
          </div>
        </div>
        <div className="stat-card report-stat-card" style={{ padding: '1.25rem' }}>
          <div className="stat-icon-box amber" style={{ width: '40px', height: '40px' }}><Clock size={20} /></div>
          <div className="stat-info">
            <span className="stat-label" style={{ fontSize: '0.75rem' }}>Horas Top</span>
            <div className="top-hours-pills" style={{ marginTop: '0.25rem' }}>
              {getTopHoras().map(([hora]) => <div key={hora} className="hour-pill" style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem' }}>{hora}</div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="reports-details-grid" style={{ gap: '1.5rem' }}>
        <div className="admin-card occupation-card">
          <div className="card-header-minimal" style={{ padding: '1rem 1.5rem' }}>
            <BarChart2 size={18} /> <h3 style={{ fontSize: '0.95rem' }}>Ocupación</h3>
          </div>
          <div className="occupation-list" style={{ padding: '1rem', gap: '0.75rem' }}>
            {Object.entries(stats.ocupacionPorCancha).map(([cancha, cantidad]) => (
              <div key={cancha} className="occupation-row" style={{ padding: '0.75rem' }}>
                <div className="cancha-name-box" style={{ fontSize: '0.8rem' }}><MapPin size={14} /> {cancha}</div>
                <div className="cancha-progress-box" style={{ gap: '0.75rem' }}>
                  <div className="progress-bar-bg" style={{ height: '6px' }}><div className="progress-bar-fill" style={{ width: `${Math.min((cantidad / 20) * 100, 100)}%` }}></div></div>
                  <span className="progress-value" style={{ fontSize: '0.7rem' }}><strong>{cantidad}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card history-card">
          <div className="card-header-minimal" style={{ padding: '1rem 1.5rem' }}>
            <FileText size={18} /> <h3 style={{ fontSize: '0.95rem' }}>Detalle</h3>
          </div>
          <div className="admin-table-container">
            <table className="admin-table mini-table">
              <thead><tr><th>Fecha</th><th>Cancha</th><th>Total</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td><div className="row-date" style={{ fontSize: '0.85rem' }}>{b.fecha}</div><div className="row-time" style={{ fontSize: '0.7rem' }}>{b.hora.substring(0, 5)}</div></td>
                    <td style={{ fontSize: '0.85rem' }}>{b.canchas?.nombre}</td>
                    <td style={{ textAlign: 'right', fontSize: '0.85rem' }} className="font-700">${b.precio_total?.toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .reports-filter-card { border-bottom: 3px solid var(--admin-primary); }
        .filter-inner { display: flex; justify-content: space-between; align-items: center; }
        .filter-group { display: flex; align-items: center; }
        .date-inputs { display: flex; align-items: center; }
        .input-with-label label { display: block; color: var(--admin-text-secondary); font-weight: 800; }
        .input-with-label input { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; }
        .date-divider { width: 10px; height: 1.5px; background: #cbd5e1; }
        .filter-apply-btn { border-radius: 10px; font-weight: 700; }
        .stat-icon-box { border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .stat-icon-box.pink { background: #fdf2f8; color: #db2777; }
        .stat-icon-box.blue { background: #eff6ff; color: #2563eb; }
        .stat-icon-box.amber { background: #fffbeb; color: #d97706; }
        .text-gradient-pink { background: linear-gradient(135deg, #db2777 0%, #7c3aed 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .top-hours-pills { display: flex; gap: 0.4rem; }
        .hour-pill { background: #f1f5f9; border-radius: 6px; font-weight: 600; color: #d97706; }
        .reports-details-grid { display: grid; grid-template-columns: 1fr 1.5fr; }
        .card-header-minimal { display: flex; align-items: center; border-bottom: 1px solid #f1f5f9; }
        .card-header-minimal h3 { font-weight: 700; }
        .occupation-row { display: flex; flex-direction: column; background: #f8fafc; border-radius: 10px; }
        .cancha-name-box { display: flex; align-items: center; font-weight: 600; }
        .cancha-progress-box { display: flex; align-items: center; }
        .progress-bar-bg { flex: 1; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: var(--admin-primary); }
        @media (max-width: 900px) { .reports-details-grid { grid-template-columns: 1fr; } .filter-inner { flex-direction: column; gap: 1rem; } }
      `}</style>
    </AdminLayout>
  );
};

export default AdminReports;
