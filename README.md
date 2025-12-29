Government-grade Next.js portal for Woreda 9 with a public hero, leadership roster, QR-driven temporary document access, and a dedicated Supabase-backed admin console.

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to explore the public site. The admin area lives under `/admin`. Use `/request-access` and `/documents?token=...` to test the QR flow locally once the backend is seeded.

## Key Features

- Clean, motion-led hero and leader sections built with TailwindCSS and Framer Motion.
- QR access capture page that records IP, request code, and timestamp through Supabase.
- `/documents` gate that validates temporary tokens before listing Cloudflare R2-hosted files grouped by year.
- Supabase-authenticated admin login, request approvals, and document upload flow (with metadata logging and R2 storage) under `/admin`.
- Strict TypeScript + modular structure (`src/components`, `src/lib`, `src/data`, `src/types`) to satisfy audit expectations.

## Environment Variables

Set the following variables in `.env.local` or your deployment platform. The values below represent the Woreda 9 default, but modifying them lets each Woreda reuse the same codebase.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_WOREDA_ID` | Identifier used in Supabase records and R2 folders. |
| `NEXT_PUBLIC_WOREDA_NAME` | Display name shown in hero, footer, and admin header. |
| `NEXT_PUBLIC_WOREDA_LOGO_PATH` | Public path (e.g. `/assets/branding/logo.svg`) for the woreda logo. |
| `NEXT_PUBLIC_WOREDA_IMAGES_PREFIX` | Base folder for gallery/branding assets (defaults to `/assets`). |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL used by the browser (required for admin login). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for the client-side auth flow. |
| `SUPABASE_URL` | Supabase URL used by server helpers (duplicate of the public URL). |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key required to insert requests, temporary access tokens, and upload metadata securely. |

Ensure the `.env.local` file is never committed. Each Woreda simply swaps the `NEXT_PUBLIC_*` values while keeping the shared logic untouched.

## Supabase / Data Model

The following tables are created automatically via migrations:

1. `qr_requests` &mdash; stores `code`, `ip_address`, `woreda_id`, `status`, `temporary_access_token`, `created_at`.
2. `temporary_access` &mdash; holds `request_id`, `woreda_id`, `token`, `expires_at`, `created_at`.
3. `uploads` &mdash; logs `woreda_id`, `category_id`, `subcategory_code`, `year`, `file_name`, `storage_url`, `uploader_id`, `created_at`.
4. `news` &mdash; stores news articles with `title`, `content`, `summary`, `cover_image_url`, `youtube_url`, `published`, etc.
5. `leaders` &mdash; stores leader information with multilingual support (`name`, `title`, `speech`, etc.).
6. `appointments` &mdash; stores appointment requests with Ethiopian calendar support.

Supabase auth handles administrators. The login page hits `supabase.auth.signInWithPassword` and redirects to `/admin/dashboard` once validated.

## Supabase Storage

- Uploads are sent to Supabase Storage bucket `documents` via the `/api/admin/upload` route.
- Metadata and download URLs are stored in Supabase by `saveDocumentMetadata`.
- Documents shown to approved users come from Supabase Storage public URLs.
- Folder structure: `<woreda-id>/<category-id>/<subcategory-code>/<year>/<file-name>`.
- The `documents` bucket must be set to public for file access.
- News images are stored in the `news` bucket.

## Folder Layout Highlights

- `app/` &mdash; App Router pages (public home, admin, request flow, documents view).
- `src/components/sections` &mdash; Hero and leader UI composites.
- `src/components/admin` &mdash; Upload form and reusable widgets.
- `src/data` &mdash; Static leadership and category definitions.
- `src/lib` &mdash; Supabase clients, access helpers, R2 upload logic.
- `src/types` &mdash; Shared interfaces for records and document metadata.
- `src/assets` &mdash; All SVG assets; mirrored under `public/assets` for env-driven paths.

## Testing the Flow

1. Launch dev server and visit `/request-access?code=XYZ`.
2. Confirm an entry lands in Supabase `qr_requests`.
3. Sign in at `/admin/login`, review `/admin/dashboard`, then approve the request.
4. Use `/documents?token=<approved-token>` to verify the grouped document list (uploads must exist in R2 and Supabase).

## Deployment

Deploy on Vercel (one project per woreda). Each deployment reuses the same repo but overrides the `NEXT_PUBLIC_WOREDA_*` variables, Supabase keys, and R2 endpoints for the specific woreda.
