# FORME project instructions

- Commit and push project changes to GitHub after making changes. Never commit credentials.
- Use Next.js App Router and TypeScript for the storefront, Go for the API, and Neon Postgres for persistence.
- Read DESIGN.md before UI changes. Flat and minimalist design is a user requirement.
- Apply the skills installed in .agents/skills: taste-skill, awesome-design-md, web-design-guidelines.
- The user's pumpkin #FE7F2D and charcoal #233D4D palette overrides reference brand colors. Do not add gradients, glass, ornamental shadows, or 3D treatments.
- Keep React Bits components isolated, locally vendored, and attributed in THIRD_PARTY_NOTICES.md. Respect reduced motion.
- Keep NGN and USD prices as independent integer minor-unit amounts. Never invent live conversion rates.
- Run frontend typecheck/build and Go tests before pushing. Verify the shopping flow in a browser.
