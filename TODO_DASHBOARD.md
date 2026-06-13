# Dashboard fix plan

## Step 1 — Gather info
- [x] Read `client/social-media/src/pages/Dashboard.tsx`
- [ ] (Optional) read other components if dashboard depends on shared UI

## Step 2 — Fix compile-time issues
- [ ] Fix broken/incorrect JSX structure in the Activity Feed section.
- [ ] Remove or import missing icon(s): `SendIcon` is used but not imported.
- [ ] Fix invalid `key` syntax: `key= {activity._id}` → `key={...}`.
- [ ] Fix malformed map rendering block: several `<div/>` and braces are mismatched.

## Step 3 — Make TypeScript happy
- [ ] Decide a proper `activities` item shape; replace `Array<Record<string, unknown>>` with a typed interface, or cast safely.
- [ ] Ensure `activity.description` access is type-safe.

## Step 4 — Validate
- [ ] Run TypeScript check / build in `client/social-media`.

