/**
 * Math Things. — canonical denominator palette, revision 1.
 *
 * The denominator (size of ONE part) determines color, not the numerator
 * (number of parts present). Shared by fraction number lines, bars and circles.
 * All pieces use fully opaque, Volume Space-style physical enamel.
 *
 * Invariants:
 *   1 whole = canonical red (#DC143C).
 *   1/10 = canonical light blue/cyan tenth (#64D2FF).
 *   1/100 = canonical orange hundredth (#FF9F0A).
 *
 * This is the single source of truth. Future fraction tools should import
 * these mappings instead of inventing per-tool palettes.
 */
export const FRACTION_DENOMINATORS = Object.freeze([
  2, 3, 4, 5, 6, 8, 10, 12, 16, 100
]);

export const FRACTION_COLORS = Object.freeze({
  1: "#DC143C",    // canonical whole (one cube)
  2: "#F06D6B",    // coral
  3: "#E4A646",    // golden ochre
  4: "#C5AD30",    // yellow
  5: "#58AC61",    // green
  6: "#3B9E90",    // teal
  8: "#7186D9",    // periwinkle
  10: "#64D2FF",   // canonical tenths
  12: "#9B6ACA",   // violet
  16: "#D16DAA",   // magenta
  100: "#FF9F0A"   // canonical hundredths
});

export function fractionColor(denominator) {
  const color = FRACTION_COLORS[Number(denominator)];
  if (!color) throw new RangeError("Unsupported fraction denominator: " + denominator);
  return color;
}
