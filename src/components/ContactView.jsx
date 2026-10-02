import React, { useEffect } from 'react';

export default function ContactView() {
  useEffect(() => {
    // Cal inline embed initialization
    (function (C, A, L) {
      let p = function (a, ar) {
        a.q.push(ar);
      };
      let d = C.document;
      C.Cal =
        C.Cal ||
        function () {
          let cal = C.Cal;
          let ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement('script')).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () {
              p(api, arguments);
            };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === 'string') {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ['initNamespace', namespace]);
            } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');

    if (window.Cal) {
      window.Cal('init', '30min', { origin: 'https://app.cal.com' });
      window.Cal.config = window.Cal.config || {};
      window.Cal.config.forwardQueryParams = true;

      window.Cal.ns['30min']('inline', {
        elementOrSelector: '#my-cal-inline-30min',
        config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true' },
        calLink: 'donnyrs/30min',
      });

      window.Cal.ns['30min']('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    }
  }, []);

  return (
    <div className="w-full flex-1 h-[calc(100vh-120px)] min-h-[560px] font-sans animate-fade-in flex flex-col">
      {/* Kuning-kuning Container - Sesuai layar penuh tanpa scroll */}
      <div className="w-full h-full bg-[#fbf9f6] border border-[#ede9e2] rounded-none p-2 sm:p-4 lg:p-6 flex flex-col justify-center items-center shadow-sm overflow-hidden">
        {/* Cal inline embed code begins */}
        <div
          id="my-cal-inline-30min"
          style={{ width: '100%', height: '100%', overflow: 'hidden' }}
          className="w-full h-full"
        />
        {/* Cal inline embed code ends */}
      </div>
    </div>
  );
}
