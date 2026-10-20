// ---------------------------------------------------------------------------
// Medal icon. Pass a tier object from data/medals.js to colour it,
// or tier={null} to show the grey "locked / unranked" version.
// ---------------------------------------------------------------------------
export default function MedalBadge({ tier, size = 36 }) {
  const color = tier ? tier.color : "#3a404c";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label={tier ? tier.name : "Unranked"}>
      <circle cx="20" cy="20" r="17" fill={color} fillOpacity={tier ? 0.16 : 0.25} stroke={color} strokeWidth="2.5" />
      <path d="M20 10l2.9 6 6.6.9-4.8 4.6 1.2 6.5L20 24.9 14.1 28l1.2-6.5-4.8-4.6 6.6-.9z" fill={color} />
    </svg>
  );
}
