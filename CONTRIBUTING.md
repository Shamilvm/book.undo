# Contributing to Book Undo

Book Undo is a single Next.js app (pages + API routes + MongoDB) for community book circulation: **donate**, **borrow**, **textbook exchange**, **school sponsorship**, a **virtual library**, and a **library map**, with an **admin dashboard** for moderation.

If you want to improve the software your community runs — or the reference deployment everyone forks — you are in the right place.

## Ways to contribute

| Kind | Examples |
| ---- | -------- |
| **Product** | Clearer donate/borrow flows, map UX, sponsorship progress, mobile layout |
| **Backend** | API routes under `app/api/`, Mongoose models in `lib/models/`, serialization in `lib/*-serialize.ts` |
| **Admin** | Pages under `app/admin/`, dialogs in `components/admin/`, approval actions |
| **Data & types** | Shared types in `lib/types/`, form options in `lib/form-options.ts` and `lib/select-fields.ts` |
| **Docs** | README, setup steps, comments only where behaviour is non-obvious |
| **Issues** | Reproducible bugs, feature ideas tied to real book-sharing workflows |

You do not need to touch every layer. A focused fix to borrow status emails or library approval is as valuable as a large feature.

## Local setup

```bash
git clone https://github.com/Shamilvm/book.undo.git
cd book.undo
npm install
cp .env.example .env          # Windows: copy .env.example .env
```

Requirements: **Node.js 18+**, **MongoDB** (local or Atlas). Edit `MONGODB_URI` in `.env` if needed.

```bash
npm run seed    # optional — sample Kerala libraries, books, digital titles, admin users
npm run dev     # http://localhost:3000
```

After seeding, sign in at **`/admin/login`** with user `admin` or `superadmin` and password `admin` (development only).

## Know the system before you change it

### Public flows

| Feature | Page | API / notes |
| ------- | ---- | ----------- |
| Donate books | `/donate` | `POST /api/books` — donor gets a **manage token** URL (`/manage/[token]`) |
| Borrow | `/borrow` | `GET /api/books/nearby`, `POST /api/borrows` — borrower gets **request token** (`/request/[token]`) |
| Textbook exchange | `/exchange` | `POST /api/textbook-exchange` — manage at `/exchange/manage/[token]` |
| Sponsor schools | `/sponsor` | `POST /api/sponsorships/submit`, contributions via sponsorship APIs |
| Virtual library | `/read` | `GET /api/digital-books` — admin-approved titles only |
| Library map | `/map` | `GET /api/libraries/nearby`, OSM helpers under `app/api/map/` |
| Feedback | `/feedback` | `POST /api/feedback` |

### Admin moderation

Routes under **`/admin`** are cookie-protected (`middleware.ts`). Admins approve or reject:

- Donated **books** and **digital books**
- **Libraries** (including reported ones)
- **Sponsorships** and **sponsor requests**
- **Borrow requests** (pending → approved / cancelled / returned)

When you change listing visibility, test both the public page and the matching admin screen.

### Code layout

```
app/
  api/           # REST handlers (public + admin)
  admin/         # Dashboard pages
  donate|borrow|exchange|map|read|sponsor|feedback/  # Public routes
components/
  pages/         # Public page UI
  admin/         # Admin dialogs and tables
lib/
  models/        # Mongoose schemas (Book, Library, BorrowRequest, …)
  types/         # Shared TypeScript types
  api.ts         # Browser client for public API
  admin-api.ts   # Browser client for admin API
  auth.ts        # Admin session (not end-user accounts for donors/borrowers)
styles/          # global.css, components.css, pages/*.css
scripts/seed.ts  # Dev sample data
```

**Conventions**

- Keep route handlers thin; reuse logic from `lib/`.
- Add or update types in `lib/types/` when API shape changes.
- New env vars go in **`.env.example`** with a short comment — never commit `.env`.
- Page-specific styles live in `styles/pages/<name>.css`, imported from the page component.
- Admin tables often use `lib/admin-table-actions.ts` and dialog components — follow existing pages like `app/admin/books/page.tsx`.

## Development workflow

1. Branch from `main`: `git checkout -b fix/borrow-email` or `feature/map-cluster`.
2. Make one logical change per pull request when you can.
3. Run **`npm run lint`** before opening the PR.
4. Manually test affected flows in the browser (see checklist below).
5. Open a PR with **what** changed, **why**, and **how you tested**.

### Testing checklist

Use this for the areas you touched:

- [ ] **Donate** — submit listing, open manage link, update status
- [ ] **Borrow** — search/nearby, request borrow, donor sees request on manage page
- [ ] **Exchange** — create listing, open exchange manage link
- [ ] **Sponsor** — submit or contribute (if your change touches sponsorships)
- [ ] **Read** — only approved digital books appear
- [ ] **Map** — libraries load; location picker works if you changed geolocation
- [ ] **Admin** — login, list/filter, approve or reject the resource type you modified
- [ ] **API** — wrong input returns sensible errors; no secrets in JSON responses

If you change **`AUTO_APPROVE_BOOKS`** behaviour, test with it both enabled and set to `false` in `.env`.

### Pull request content

Include:

- Linked issue (if any)
- Screenshots or short screen recording for UI changes
- Note if seed data or admin approval is required to see the effect
- Migration note if existing MongoDB documents need a one-off update (rare — call it out clearly)

## What we are careful about

- **Manage and request tokens** are secrets for listing owners. Do not log them, paste them in issues, or weaken token generation in `lib/tokens.ts` without discussion.
- **Contact fields** (`donorContact`, borrower contact, etc.) are sensitive. Avoid sending them to analytics or exposing them in client bundles unnecessarily.
- **Sample data** in `scripts/seed.ts` uses fictional Kerala schools and libraries. Keep it obviously synthetic if you add more.
- **Default admin password** is for local dev only. Documentation and setup must keep telling deployers to change it.

## Issues and security

- **Bugs** — [bug report template](https://github.com/Shamilvm/book.undo/issues/new?template=bug_report.yml): steps, expected vs actual, OS, Node version, seeded or empty DB.
- **Features** — [feature request template](https://github.com/Shamilvm/book.undo/issues/new?template=feature_request.yml): which user (donor, borrower, school, admin) benefits and how.
- **Security** — see [SECURITY.md](SECURITY.md). No public issues for vulnerabilities.

## Community standards

Collaboration on this repo follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

Questions before you start? Open an issue with the **question** label or describe your idea in a feature request. Small fixes and docs improvements are always appreciated.
