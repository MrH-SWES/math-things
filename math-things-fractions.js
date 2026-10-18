/**
 * Math Things. — canonical denominator palette, revision 2.
 *
 * The denominator (size of ONE part) determines color, not the numerator
 * (number of parts present). Shared by fraction number lines, bars and circles.
 * All pieces use fully opaque, Volume Space-style physical enamel.
 *
 * Invariants:
 *   1 whole = canonical red ones (#DC143C).
 *   1/10 = canonical tenths cyan (#64D2FF).
 *   1/100 = canonical hundredths orange (#FF9F0A).
 * Those three are the ONLY place-value colors a fraction may wear, because
 * those three really are place values: 1/10 = 0.1 and 1/100 = 0.01.
 *
 * Every other denominator is drawn from a muted "fraction family" so it never
 * reads as a place value. Place-value enamel is fully saturated; fraction
 * enamel is dusty. A family is one hue for one chain of splitting:
 *   halving  (2 → 4 → 8 → 16)  mauve
 *   thirding (3 → 6 → 12)      sage
 *   fifths   (5)               sand
 * Within a family, a smaller piece is a deeper shade of the same hue, so
 * "a sixth is half of a third" shows up as "same color, cut smaller".
 *
 * This is the single source of truth. Future fraction tools should import
 * these mappings instead of inventing per-tool palettes.
 */
export const FRACTION_DENOMINATORS = Object.freeze([
  2, 3, 4, 5, 6, 8, 10, 12, 16, 100
]);

export const FRACTION_FAMILIES = Object.freeze({
  halving: Object.freeze([2, 4, 8, 16]),
  thirding: Object.freeze([3, 6, 12]),
  fifths: Object.freeze([5]),
  placeValue: Object.freeze([10, 100])
});

export const FRACTION_COLORS = Object.freeze({
  1: "#DC143C",    // canonical whole (one cube) — place-value ones
  2: "#D2A9C6",    // mauve, lightest
  4: "#B783A8",    // mauve
  8: "#96608A",    // mauve
  16: "#74426B",   // mauve, deepest
  3: "#A9C9B2",    // sage, lightest
  6: "#7CA68A",    // sage
  12: "#5E8A72",   // sage, deepest
  5: "#C8A47E",    // sand
  10: "#64D2FF",   // canonical tenths — place value
  100: "#FF9F0A"   // canonical hundredths — place value
});

export function fractionColor(denominator) {
  const color = FRACTION_COLORS[Number(denominator)];
  if (!color) throw new RangeError("Unsupported fraction denominator: " + denominator);
  return color;
}
