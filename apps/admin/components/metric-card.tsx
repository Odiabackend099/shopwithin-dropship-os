export function MetricCard({ icon, label, value, sublabel }: { icon: React.ReactNode; label: string; value: string; sublabel: string }) {
  return (
    <article className="metric">
      <div className="metricIcon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{sublabel}</span>
      </div>
    </article>
  );
}
