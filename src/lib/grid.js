// Deals items left-to-right into n masonry columns; each keeps its original index so the
// flattened mobile layout can restore the real order
export function distributeColumns(items, n) {
  const columns = Array.from({ length: n }, () => []);
  items.forEach((item, index) => columns[index % n].push({ item, index }));
  return columns;
}
