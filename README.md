# AJS Vritti Vision Marketing (ajsvision.shop)

Rebuild of the owners' original Next.js/MongoDB storefront on our standard stack
(Supabase shared `E-Comm` project, Razorpay, Resend, Vercel). The customer-facing
UI files are byte-identical copies of the original; only the backend layer changed.

- `CLIENT_SLUG`: `ajsvritti` (row in `public.clients`); storage folder `product-images/ajsvritti/products/`.
- Catalog: 288 IT-hardware products copied from the original site's public API (data + real product photos,
  re-hosted as WebP in `product-images/ajsvritti/products/<SKU>.webp`). Specs are stored as a JSON string in
  `products.set_contents`; category hierarchy in `group_name` / `sub_category` / `category_label`.
- Auth: Supabase Auth, but with the original's email + 6-digit OTP verification screens
  (OTP kept in `user_metadata`, mailed via Resend).
- Payments: COD + Razorpay (test keys). Order status is `pending_payment` until the signature check / webhook.

## Deliberate exceptions to fleet rules
- **Pricing**: prices are exactly those of the original live site (they already sit on the rulebook tiers).
- **Content**: all copy, brand name and contact details are kept as in the original codebase.
- **Images**: the original photos, converted to WebP at their native aspect ratio (max 1200px), not cropped to 1:1.
- **Framework**: Next 14 / Tailwind 3 / MUI kept (instead of our newer template versions) to preserve the UI exactly.

## Not ported
- The original admin panel (`/admin`, product/user/size CRUD, import/export). Manage data in Supabase.
- SprintNxt / Paytm / Cashfree / x-payout gateways.
