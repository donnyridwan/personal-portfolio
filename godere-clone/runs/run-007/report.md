# Replica report

Status: **MEASURED**

Run: ccb2304b-451f-47b0-8ffd-3290cfa36b48

Coverage: 18/18 visual cases; 4/4 required checks.

Minimum exact RGBA pixel match: 78.88745952568478%. Aggregate pixel-weighted match: 94.99619587184053%.

| Route | Viewport | State | Result | Exact match % | Worst 64px tile % |
| --- | --- | --- | --- | ---: | ---: |
| / | 390×900 @1 | default | MEASURED | 94.583044 | 9.008789 |
| / | 1024×900 @1 | default | MEASURED | 99.815369 | 17.187500 |
| / | 1440×900 @1 | default | MEASURED | 96.301707 | 16.064453 |
| /projects/arcveil-brand-identity | 390×900 @1 | default | MEASURED | 78.887460 | 11.840820 |
| /projects/arcveil-brand-identity | 1024×900 @1 | default | MEASURED | 98.113981 | 15.527344 |
| /projects/arcveil-brand-identity | 1440×900 @1 | default | MEASURED | 98.589247 | 17.700195 |
| /projects/lumio-product-design | 390×900 @1 | default | MEASURED | 82.256300 | 9.790039 |
| /projects/lumio-product-design | 1024×900 @1 | default | MEASURED | 85.515694 | 2.734375 |
| /projects/lumio-product-design | 1440×900 @1 | default | MEASURED | 98.787428 | 17.700195 |
| /projects/vela-brand-identity | 390×900 @1 | default | MEASURED | 81.758517 | 1.196289 |
| /projects/vela-brand-identity | 1024×900 @1 | default | MEASURED | 87.656035 | 2.661133 |
| /projects/vela-brand-identity | 1440×900 @1 | default | MEASURED | 92.891325 | 4.638672 |
| /projects/kova-creative-direction | 390×900 @1 | default | MEASURED | 98.442769 | 47.973633 |
| /projects/kova-creative-direction | 1024×900 @1 | default | MEASURED | 90.474843 | 12.011719 |
| /projects/kova-creative-direction | 1440×900 @1 | default | MEASURED | 96.490825 | 15.014648 |
| /projects/haux-web-redesign | 390×900 @1 | default | MEASURED | 97.627353 | 47.973633 |
| /projects/haux-web-redesign | 1024×900 @1 | default | MEASURED | 98.390532 | 17.187500 |
| /projects/haux-web-redesign | 1440×900 @1 | default | MEASURED | 99.128631 | 17.700195 |

## Gaps and failures
None in configured scope.

## Measurement contract
Full-page PNGs, loaded fonts, matched browser/platform/viewport/DPR/theme, foreground visibility, reduced motion, no resizing or masking. Perceptual threshold: 0.1; anti-aliasing included. Acceptance thresholds: {"perceptualThreshold":0.1}. Missing thresholds mean MEASURED, never automatic acceptance. Global scores can conceal small defects: inspect worst tiles, difference bounds and diff images.

Screenshots do not prove interactions or frame-exact animation timing. Required checks need separate, same-run evidence. Reports are local evidence summaries, not cryptographic attestations of browser truth. No claim extends beyond the configured routes/states/viewports.
