// Splits a metric value into characters for the number pop-in; the last two ride in
// 1× and 2× --digit-stagger behind the rest (transitions.dev "Number pop-in")
export function splitDigits(value) {
  const chars = Array.from(String(value || ''));
  return chars.map((char, idx) => {
    const fromEnd = chars.length - idx;
    return { char, stagger: fromEnd === 1 ? 2 : fromEnd === 2 ? 1 : null };
  });
}
