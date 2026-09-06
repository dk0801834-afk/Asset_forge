# ⚡ AssetForge — B2B Creative Asset E-Commerce Platform

A complete, production-ready B2B e-commerce platform for selling digital creative asset bundles (3D icons, textures, UI kits, illustrations, fonts, and more). Built with **FastAPI** (Python) backend + **React + Tailwind** frontend.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure HTTP-only cookies
- Role-based access control (Customer / Administrator)
- Password hashing with bcrypt
- Signup & login with strict input validation

### 🛍️ Storefront
- Modern, responsive dark-themed UI with gradient accents
- Categorized B2B creative asset bundles (3D Icons, Textures, Illustrations, UI Kits, Typography, Photography)
- Dynamic filtering (category, price range, tags, search)
- Featured bundles section
- Detailed bundle pages with previews, features, and specs
- Shopping cart with local persistence
- Smooth animations and micro-interactions

### 💳 Payments & File Delivery
- Stripe Checkout integration (auto-fulfillment via webhooks)
- **Signature-verified webhook listener** for secure payment confirmation
- Automatic ZIP packaging of purchased bundles
- **Time-limited (24h) signed download links** via itsdangerous
- HTML email delivery with download links (SMTP-configurable; mock mode prints to console)
- Admin controls: refund, resend download emails

### 🤖 AI Asset Generation
- Integrated AI image generation API (Stability AI compatible)
- Multi-sentence detailed text prompts
- Style presets, negative prompts, resolution controls (up to 2048×2048)
- Batch generation (1–4 images per request)
- Graceful mock mode (creates SVG placeholders when AI API key not configured)

### 🗄️ Backend
- **Multi-tenant ready** with a `tenants` table (scoped to default tenant out of the box)
- SQLAlchemy ORM (SQLite for zero-infra dev, PostgreSQL for production)
- Strict Pydantic v2 input validation on every endpoint
- CORS hardening, security headers
- Download logging (IP + user agent)
- Seeded demo data: admin user, demo customer, 6 categories, 6 premium bundles

### 🐳 Containerization
- Full Docker support (backend + frontend + optional Postgres)
- One-command deployment via `docker-compose up`
- Works with zero infrastructure cost using SQLite (no external DB needed)

---

## 🚀 Quick Start (Docker — Zero Infrastructure)

```bash
cd assetforge
docker-compose up --build
```

Then visit:
- **Frontend:** http://localhost:3000
- **Backend API / Docs:** http://localhost:8000/docs

### Demo Credentials
| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@assetforge.io      | Admin@12345  |
| Customer | demo@assetforge.io       | Demo@12345   |

> Out of the box, Stripe runs in **mock mode** — clicking "Complete order" automatically marks payment successful, packages the ZIP, and dispatches the download email (logged to console). To enable real Stripe, edit `backend/.env` with your Stripe keys.

---

## 🛠️ Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # edit values if needed
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/static` to port 8000 automatically.

---

## 🔧 Configuration (backend/.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | `sqlite:///./assetforge.db` (default) or `postgresql://user:pass@db:5432/assetforge` |
| `SECRET_KEY` | Long random string for JWT/signing — **change in production!** |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_...`) — exposed to frontend |
| `SMTP_HOST/PORT/USER/PASSWORD` | SMTP settings for transactional emails |
| `EMAIL_FROM` | From address for emails |
| `AI_API_KEY` | API key for AI generation (Stability AI compatible) |
| `AI_API_URL` | Text-to-image endpoint URL |
| `DOWNLOAD_LINK_EXPIRE_HOURS` | Validity window for download links (default: 24) |

### Stripe Webhook Setup
For production/local testing, point Stripe webhooks to:
```
https://your-domain.com/api/v1/payments/webhook
```
Listen for the `checkout.session.completed` event.

---

## 📁 Project Structure
```
assetforge/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py              # FastAPI app entry
│       ├── core/                # Config, security, database
│       ├── models/              # SQLAlchemy models (User, Bundle, Order, etc.)
│       ├── schemas/             # Pydantic validation schemas
│       ├── services/            # Payment, email, packaging, AI, seeding
│       └── api/                 # Route handlers
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── context/             # Auth, Cart
        ├── components/          # Navbar, Footer, BundleCard, etc.
        ├── pages/               # Home, Bundles, Checkout, Orders, AI, Admin
        └── utils/api.js
```

## 🧪 API Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/signup` | – | Register a customer account |
| POST | `/api/v1/auth/login` | – | Obtain JWT token |
| GET | `/api/v1/auth/me` | ✓ | Current user profile |
| GET | `/api/v1/categories` | – | List categories |
| GET | `/api/v1/bundles` | – | List bundles (filter/search/sort) |
| GET | `/api/v1/bundles/featured` | – | Featured bundles |
| GET | `/api/v1/bundles/by-slug/{slug}` | – | Bundle details |
| POST | `/api/v1/orders/checkout` | ✓ | Create order + Stripe session |
| GET | `/api/v1/orders` | ✓ | My orders |
| GET | `/api/v1/orders/{id}` | ✓ | Order details (auto-refresh) |
| POST | `/api/v1/payments/webhook` | – | Stripe webhook (signature verified) |
| GET | `/api/v1/downloads/{token}` | – | Time-limited secure file download |
| POST | `/api/v1/ai/generate` | ✓ | Submit AI generation request |
| GET | `/api/v1/ai/requests` | ✓ | My generation history |
| GET | `/api/v1/admin/stats` | Admin | Dashboard metrics |
| GET | `/api/v1/admin/orders` | Admin | All orders (filterable) |
| POST | `/api/v1/admin/orders/{id}/refund` | Admin | Refund an order |
| POST | `/api/v1/admin/orders/{id}/resend-download` | Admin | Resend download email |
| GET/PATCH | `/api/v1/admin/users` | Admin | Manage users |

## 🔒 Security Notes
- JWT tokens signed with HS256; expires after 60 min (configurable)
- Passwords hashed via bcrypt (passlib)
- Download links are signed (itsdangerous) and time-limited
- Stripe webhook signatures are verified before processing
- Strict Pydantic validation with field-length constraints on all inputs
- CORS restricted to configured origins
- SQLAlchemy ORM prevents SQL injection
- Multi-tenant structure allows future tenant data isolation
- Admin endpoints gated by role check at dependency level

## 📝 License
MIT — feel free to use this as a starting point for your own B2B digital goods platform.

---

**Build something amazing. ⚡**
