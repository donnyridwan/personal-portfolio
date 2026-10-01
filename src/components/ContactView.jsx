import React, { useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';

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
    <div className="flex-1 max-w-[960px] pb-24 font-sans animate-fade-in">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <span className="text-[12px] uppercase tracking-wider text-[#b7b2aa] font-medium">
            Contact
          </span>
          <h2 className="font-serif text-[40px] leading-[1.15] text-[#1e1e1e]">
            Let's discuss your next project.
          </h2>
          <p className="text-[15px] text-[#6b665e] leading-relaxed font-light max-w-2xl">
            Choose a suitable slot on the calendar below for a 30-minute discovery call, or email directly at{' '}
            <a
              href={`mailto:${portfolioData.email}`}
              className="text-black font-normal underline underline-offset-4 decoration-1 hover:opacity-75 transition-opacity"
            >
              {portfolioData.email}
            </a>
            .
          </p>
        </div>
      </div>

      {/* Cal.com Inline Embed Container */}
      <div className="w-full bg-[#fbf9f6] border border-[#ede9e2] rounded-none p-2 sm:p-5 min-h-[700px] shadow-sm">
        {/* Cal inline embed code begins */}
        <div
          id="my-cal-inline-30min"
          style={{ width: '100%', height: '100%', minHeight: '660px', overflow: 'scroll' }}
        />
        {/* Cal inline embed code ends */}
      </div>
    </div>
  );
}
