# PrintFlow Navigation Guide

This guide matches the routes in `src/app/routes.tsx`.

## Public

These pages do not require a user session.

- `/login` opens the sign-in screen.
- `/signup` opens account creation.
- `/poster` shows the static PrintFlow poster page.

## Student App

These routes are protected and are meant for students.

- `/` is the student home dashboard.
- `/settings` is where students choose print options.
- `/status/:orderId` shows the status for one order.
- `/profile` edits the student's profile.
- `/shops/:shopSlug` opens a shop profile page.
- `/shops/:shopSlug/contact` opens the shop chat assistant.

## Shop Dashboard

These routes are protected and are meant for shop owners.

- `/shop` is the owner home dashboard.
- `/shop/order/:orderId` shows a single order.
- `/shop/profile` edits shop details.
- `/shop/analytics` shows analytics.
- `/shop/notifications` shows alerts and updates.

## Fallback

- `*` redirects unknown routes back to `/`.

## How the app is structured

`RootLayout` wraps the app shell, `ProtectedRoute` decides whether a user can enter student or shop areas, and the nested child routes define the individual pages.

If you want a quick terminal view of the same structure, run `node scripts/navigation-map.mjs`.
