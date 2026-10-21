# FORME — everyday, in your own form.

An editorial clothing and footwear store. The supplied poster establishes oversized typography, off-center photography, small edition markers, and flat areas of warm color. The result must remain a usable, minimalist shop.

## Tokens

- Pumpkin: #FE7F2D. Charcoal / all text: #233D4D.
- Paper: #F5F1E9. Warm image surface: #EAE2D5. Rules: #D5D2C9.
- Geist Sans for headings and reading; Geist Mono for small collection labels and numbering.
- Base spacing 4px. Layout gutter 40px desktop / 20px mobile. Maximum width 1440px.
- Square product surfaces and buttons. Pills only for small filters and color choices.
- No UI shadows, gradients, glass, bevels, grain effects, or decorative 3D.

## Composition

Flat orange announcement bar; paper navigation; asymmetric two-column campaign hero. Headline left, supplied model photograph right. Giant decorative collection numerals are hidden from assistive technology. Use a four-column product gallery on desktop and two columns on mobile. Descriptions live below images, never boxed into generic cards. Strong charcoal footer with orange wordmark.

## Interactions

44px touch controls, visible focus rings, semantic links, labeled forms, keyboard-usable native dialogs with focus restoration. Filters/search persist in query strings. Cart and currency persist locally. Price formatting uses Intl.NumberFormat. Never imply that configured NGN/USD prices are a live FX conversion.

Use React Bits AnimatedContent for staggered section entrances and ScrollVelocity for a flat typographic band. The user requested more movement: include headline entrances, small decorative drifts, and photographic hover transitions. Static content remains visible without JS. Honor reduced motion and the global pause control; no scroll hijacking. Mobile maintains the visual hierarchy with scaled typography and natural page scroll.

## Sources applied

- https://vercel.com/design/guidelines — interaction, focus, forms, accessibility, performance.
- https://github.com/VoltAgent/awesome-design-md — explicit tokens, spacing rhythm, typography hierarchy, adaptation via local DESIGN.md.
- https://github.com/tasteskill/tasteskill — asymmetric composition, isolated interactivity, intentional typography and all shopping states. User flat/minimal requirements override effects suggested by the reference.
- https://reactbits.dev — locally vendored AnimatedContent, adapted for reduced motion.
