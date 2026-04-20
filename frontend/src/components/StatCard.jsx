export default function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`stat-card accent-${accent || 'blue'}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
