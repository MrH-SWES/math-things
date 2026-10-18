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
 * Every other part size has its own distinct color, so halves, fourths and
 * eighths side by side in a fraction wall or circle set are told apart at a
 * glance. These colors are dusty: place-value enamel is fully saturated,
 * fraction enamel is muted, so a fraction piece never reads as a place value.
 *
 * This is the single source of truth. Future fraction tools should import
 * these mappings instead of inventing per-tool palettes.
 */
export const FRACTION_DENOMINATORS = Object.freeze([
  2, 3, 4, 5, 6, 8, 10, 12, 16, 100
]);

export const FRACTION_COLORS = Object.freeze({
  1: "#DC143C",    // canonical whole (one cube) — place-value ones
  2: "#B47AA3",    // mauve
  3: "#8DB596",    // sage
  4: "#D1AE6C",    // sand
  5: "#7E93C2",    // slate
  6: "#CF8E70",    // clay
  8: "#A898D3",    // lavender
  10: "#64D2FF",   // canonical tenths — place value
  12: "#8C9A4E",   // moss
  16: "#4F8A8B",   // deep teal
  100: "#FF9F0A"   // canonical hundredths — place value
});

export function fractionColor(denominator) {
  const color = FRACTION_COLORS[Number(denominator)];
  if (!color) throw new RangeError("Unsupported fraction denominator: " + denominator);
  return color;
}
