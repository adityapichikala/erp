# Polish Pass Punch List (Out of Scope for Demo)

The following items were noted during the final visual and UX polish pass. While the application is presentation-ready and structurally sound, these items should be prioritized in the next sprint for production readiness:

## Architecture & Data Fetching
- **Client-side Fetching Cascades:** Many of the dashboard list views (like Student Assignments or Teacher Assignments) are Client Components using `useEffect` to fetch data. This creates a waterfall loading effect where the global Next.js `loading.tsx` skeleton finishes, only for the component to display a secondary text-based "Loading..." state.
  - *Recommendation:* Refactor these to Server Components. Pass the fetched initial data down to the Client Component as props, keeping the Client Component strictly for interactive state (modals, forms, optimistic UI).

## Mobile Responsiveness
- **Mobile Sidebar Toggle:** The sidebar is currently hidden on mobile (`hidden md:flex`). The top bar contains a placeholder for a hamburger menu, but it lacks the React state to toggle a mobile slide-out drawer.
  - *Recommendation:* Implement a `Sheet` or `Drawer` component (e.g., from Radix UI) to capture the Sidebar content on smaller breakpoints.

## Theming & Contrast
- **Link Hover States:** The `a:hover` state in `globals.css` uses `var(--color-gold)`. While the gold accent looks great as a solid badge background with navy text, `#C9A24B` against `#FAF8F3` (off-white) has a low contrast ratio.
  - *Recommendation:* Use an underline animation or switch to a darker shade of gold/navy for text hover states to meet WCAG AA contrast guidelines.

## Forms & Validation
- **Basic Error Handling:** Forms currently rely on standard HTML5 validation (e.g., `required`) and basic `fetch` error catching mapped to a single red banner.
  - *Recommendation:* Introduce `zod` for strict schema validation and `react-hook-form` to provide granular, per-field error messages.

## Data Tables
- **Pagination & Sorting:** Tables (like the Admin Users list) render all items at once.
  - *Recommendation:* Implement cursor-based or offset pagination, and add sortable column headers before scaling beyond a few hundred records.
