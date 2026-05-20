type Tone = "success" | "warning" | "danger" | "neutral";

export function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`pill ${tone}`}>{label}</span>;
}
