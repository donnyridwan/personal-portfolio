// Static replacement for Framer appear / scroll-reveal animations and link hover effects.
// Final states mirror what the Framer runtime leaves inline: opacity:1; transform:none; will-change:transform.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = Array.prototype.filter.call(document.querySelectorAll('[style*="transform"]'), function (el) {
    var s = el.getAttribute('style');
    return /opacity:0(\.001)?;transform:translate/.test(s) ||   // fade-up blocks and per-character text
           /opacity:1;transform:scale\(1\.2\)/.test(s);           // image zoom-out on enter
  });
  var groups = new Map();
  nodes.forEach(function (el) {
    el.classList.add('rc-appear');
    var p = el.closest('h1,h2,h3,p') || el;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  });
  var reveal = function (el) {
    var g = groups.get(el.closest('h1,h2,h3,p') || el) || [el];
    var i = Math.max(g.indexOf(el), 0);
    if (!reduce) el.style.transitionDelay = (i * 0.025) + 's';
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.willChange = 'transform';
  };
  if (reduce || !('IntersectionObserver' in window)) { nodes.forEach(reveal); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -5% 0px' });
    nodes.forEach(function (el) { io.observe(el); });
  }
  // hover-only decorations, e.g. "( Projects )" brackets in the nav
  document.querySelectorAll('a > [style*="opacity:0;transform:none"]').forEach(function (el) { el.classList.add('rc-hover-swap'); el.style.willChange = 'transform'; });
  // Lenis smooth scrolling, as on the original site (anchor links included)
  if (!reduce && window.Lenis) {
    var lenis = new window.Lenis({ autoRaf: true, anchors: true, autoToggle: true });
    window.__lenis = lenis;
  }
})();
