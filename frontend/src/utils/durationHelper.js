export const parseDurationToMinutes = (text) => {
  if (!text) return 0;

  const segments = text.split("+").map((t) => t.trim());
  let totalMinutes = 0;

  segments.forEach((seg) => {
    const hrMatch = seg.match(/(\d+)\s*hour/i);
    const minMatch = seg.match(/(\d+)\s*min/i);

    if (hrMatch) totalMinutes += parseInt(hrMatch[1], 10) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
  });

  return totalMinutes;
};

export const formatMinutesToHM = (totalMinutes) => {
  const mins = totalMinutes || 0;
  return {
    hours: Math.floor(mins / 60),
    minutes: mins % 60,
  };
};
