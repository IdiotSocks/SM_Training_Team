export default function FlagBadge({ flags, showInhalerStatus = false, inhalerStatus = null }) {
  if (!flags || Object.keys(flags).length === 0) {
    return null;
  }

  const badges = [];

  if (flags.illness) {
    badges.push(
      <span key="illness" className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium mr-1 mb-1">
        🤒 Illness
      </span>
    );
  }

  if (flags.alcohol && flags.alcohol > 0) {
    badges.push(
      <span key="alcohol" className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mr-1 mb-1">
        🍺 Alcohol ({flags.alcohol}u)
      </span>
    );
  }

  if (flags.travel) {
    badges.push(
      <span key="travel" className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mr-1 mb-1">
        ✈️ Travel
      </span>
    );
  }

  if (flags.high_stress) {
    badges.push(
      <span key="stress" className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium mr-1 mb-1">
        😰 High Stress
      </span>
    );
  }

  if (flags.late_night) {
    badges.push(
      <span key="late" className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium mr-1 mb-1">
        🌙 Late Night
      </span>
    );
  }

  if (showInhalerStatus && inhalerStatus === 'missed') {
    badges.push(
      <span key="inhaler" className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium mr-1 mb-1">
        💊 Missed Inhaler
      </span>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return <div className="flex flex-wrap gap-1">{badges}</div>;
}
