export default function ThoughtTimestamps({ thought }) {
  return <div className="thought-timestamps">
    {[["Created", thought.createdAt], ["Updated", thought.updatedAt], ["Completed", thought.completedAt], ["Resolved", thought.resolvedAt], ["Dismissed", thought.dismissedAt]]
      .filter(([, value]) => value && Number.isFinite(Date.parse(value)))
      .map(([label, value]) => <small key={label}>{label}: <time dateTime={value}>{new Date(value).toLocaleString()}</time></small>)}
  </div>;
}
