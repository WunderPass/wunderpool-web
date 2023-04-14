export function sortByStartTime(
  a: { startTime: number | Date | string },
  b: { startTime: number | Date | string }
) {
  return Number(new Date(a.startTime)) - Number(new Date(b.startTime));
}
