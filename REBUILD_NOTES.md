# Parallax premium rebuild preview

## Status and attribution
Preview only. Production has not been changed. Base: 5f987ce; isolated branch design/premium-parallax-2026-11-15.
Claude Code Fable 5.2 High implemented the redesign and ran the automated QA. It reached its five-hour usage limit after the successful QA rerun, before its final summary/commit. Dot independently reviewed the desktop and 390px mobile preview, checked the calculator zero-input and mobile menu/Escape behavior, preserved the QA report, added bundled font licenses, and prepared the preview delivery. No substitute model wrote the redesign.

## Design and functionality
- Static HTML/CSS/JS; no framework migration or build dependency.
- Dark/cream editorial visual system, Instrument Serif and Geist typography, custom animated parallax diagram, warm gradient accents.
- Real MTS and DSR desktop/mobile screenshots, service-page galleries and accessible annotation-reveal sliders. These are explicitly design commentary, not fabricated before/after evidence.
- Missed-call opportunity estimator: weekly calls × 52/12 × missed-call fraction × unrecovered fraction × booking rate × average job value. Inputs stay local. Presets are examples, not benchmarks. Assumptions and non-guarantee are visible.
- Existing Web3Forms endpoint and form retained, with clear validation/failure/success behavior. No actual form submitted in tests.
- GA4 G-HY8X91YYYF, Search Console verification, canonical URLs, legacy anchor destinations, privacy and terms body text retained.
- Responsive mobile navigation, focus management, Escape close, reduced motion, no-JS readable fallback; redesigned legal pages/404.

## Verification
Claude QA report: tools/qa-results.txt, 114 passed, 0 failed after fixes. Covers layout widths 320/360/390/768/1024/1440/1920 across home/privacy/terms/404, calculator edge cases, nav, slider, mocked form response paths, reduced motion, no-JS, assets/links and axe automated checks. Axe still flags manual contrast review on layered backgrounds; automated zero violations is not a full accessibility certification.
Dot separately visually inspected desktop and 390px mobile hero, verified zero calls produces $0 and contextual explanation, and menu opens/closes with Escape. git diff --check passes. Real production form delivery, browser/device matrix, screen-reader audit and field performance are not verified.

## Review before release
- Owner should review copy, particularly service scope, response-time promise and client-project descriptions.
- No private client performance numbers or invented results are displayed; current result sections explain that metrics are not published.
- No genuine historical before screenshots were available; annotation comparison is used honestly instead.
- Preview must be reviewed before production publishing. Keep existing domain/production aliases unchanged.
- .vercelignore excludes this report, tools and review screenshots.

## Local preview
From this directory: python3 tools/preview.py (http://localhost:4173). Server binds to localhost only. Unknown routes return branded 404 with HTTP 404.

## Independent follow-up QA (Dot)
- Added a keyboard-operable Pause/Resume animation control for continuous decorative motion and pointer tilt; the existing OS reduced-motion behavior remains. Verified pause freezes SVG motion and resume works by keyboard.
- Fixed spacing in the footer logo's visible accessible name on home/legal/404 pages.
- Repeated the functional/axe suite: 114 passed, 0 failed (tools/qa-followup-results.txt). The mobile anchor test now waits for its existing position assertion, bounded to five seconds, instead of assuming long smooth scrolling finishes in 1.2 seconds. Manual 390px browser verification settled at 88px below the viewport top, with menu closed and heading visible. No navigation code changed for this timing issue.
- Local mobile Lighthouse 12.8.2: Performance 96, Accessibility 100, Best Practices 100, SEO 100; LCP 2.6s, TBT 0ms, CLS 0. This is localhost lab data with analytics blocked, not production field performance or a score guarantee.
- Sampled contrast tokens: muted text on dark surfaces 5.25–5.88:1, muted text on light 4.99:1; gradient display text minimum 4.34:1 meets large-text criterion. Layered backgrounds still require human review; not exhaustive pixel-level certification.
- Keyboard/ARIA structures, focus trapping/Escape, sliders and estimator live regions covered. No native screen-reader session or production form submission performed. Real-device coverage, actual inquiry delivery, field Core Web Vitals and full manual accessibility certification remain release follow-ups.
- All changes remain preview-only. Claude authored the redesign; these scoped accessibility additions and follow-up checks are Dot's independent work.
