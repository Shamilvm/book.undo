# Book Undo

**A community book circulation and donation network — donate, borrow, exchange, and sponsor access to books.**

Book Undo is an open source web application that helps communities keep books in circulation instead of on shelves. List books to give away, borrow from neighbours, swap textbooks, sponsor school libraries, read public-domain titles online, and discover libraries on a map.

**[Live demo](https://example.com)** — replace this URL with your deployed instance.

## Features

### Public web app

| Area | What it does |
| ---- | ------------ |
| **Donate** | List books you want to pass on; manage listings via a private link |
| **Borrow** | Find books shared near you and request to borrow |
| **Textbook exchange** | Post textbooks to give or textbooks you need; manage listings by token |
| **Sponsor schools** | Fund book boxes for schools and track sponsorship progress |
| **Virtual library** | Read approved public-domain and digital books in the browser |
| **Library map** | Discover community and OpenStreetMap libraries around you |
| **Feedback** | Send suggestions and reports to the team |

### Admin dashboard

Protected `/admin` area for moderators:

- Approve or reject donated books, digital books, libraries, and sponsorships
- Manage borrow requests, textbook exchange listings, and sponsor requests
- User management and platform statistics

## Tech stack

| Layer | Stack |
| ----- | ----- |
| Web app | Next.js 16, React 19, TypeScript |
| Database | MongoDB (Mongoose) |
| Maps | Leaflet, OpenStreetMap |

The frontend and REST API live in one Next.js project — no separate backend server.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### Setup

```bash
git clone https://github.com/YOUR_ORG/bookundo.git
cd bookundo
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/bookundo
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
ADMIN_SECRET=change-this-to-a-long-random-string
```

Seed sample data and start the dev server:

```bash
npm run seed    # optional — sample Kerala data + admin users
npm run dev     # http://localhost:3000
```

After seeding, admin users (`admin`, `superadmin`) use password `admin`. Sign in at `/admin/login`.

### Production

```bash
npm run build
npm start
```

## Environment variables

| Variable | Description |
| -------- | ----------- |
| `MONGODB_URI` | MongoDB connection string |
| `ADMIN_USERNAME` | Break-glass super-admin username (default: `admin`) |
| `ADMIN_PASSWORD` | Break-glass super-admin password (default: `admin`) |
| `ADMIN_SECRET` | Session cookie signing secret — use a long random string in production |

## Project structure

```
├── app/              # Pages + API route handlers
│   ├── api/          # REST API
│   ├── admin/        # Admin dashboard
│   └── ...           # Public pages (donate, borrow, map, etc.)
├── components/       # React components
├── lib/              # Models, auth, API client, helpers
├── scripts/          # Database seed
└── styles/           # Global + page CSS
```

## Contributing

Contributions are welcome. This project is intended to be useful for any community that wants to run its own book-sharing network.

1. Fork the repository
2. Create a branch (`git checkout -b feature/your-feature`)
3. Make your changes and run `npm run lint`
4. Open a pull request with a clear description of what changed and why

Please avoid committing secrets — keep `.env` local only.

## License

MIT
