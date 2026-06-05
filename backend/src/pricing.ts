export function roundUpTo10Minutes(minutes: number): number {
  return Math.ceil(minutes / 10) * 10;
}

export function calculateParkingCost(start: Date, end: Date) {
  const durationMs = end.getTime() - start.getTime();
  const totalMinutes = Math.max(0, Math.ceil(durationMs / 60000));

  const firstSegment = Math.min(totalMinutes, 180);
  const remainingMinutes = Math.max(totalMinutes - 180, 0);

  const firstBlocks = roundUpTo10Minutes(firstSegment) / 10;
  const remainingBlocks = roundUpTo10Minutes(remainingMinutes) / 10;

  const priceCents = Math.round((firstBlocks * 50) + (remainingBlocks * 30));
  return {
    totalMinutes,
    priceCents,
  };
}
