# Secure Appointment Booking & Scheduling System

A full-stack production-ready appointment booking system built with **Node.js + Express** (backend) and **React + Material UI** (frontend).

---

## Features

- JWT authentication with refresh tokens
- Role-based access control (ADMIN / PROVIDER / CUSTOMER)
- Double-booking prevention via DB unique constraints + transactions
- Provider availability slot management
- Appointment booking, rescheduling, cancellation
- Event-driven notifications (mock via Node EventEmitter)
- Swagger API documentation
- Rate limiting, Helmet security, CORS
- 80%+ test coverage with Jest + Supertest

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Sequelize ORM |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | Joi |
| Frontend | React 18, Material UI v5 |
| HTTP Client | Axios |
| Logging | Winston |
| Testing | Jest, Supertest |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

---

## Quick Start

### 1. Database Setup

```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE appointment_db;"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment (edit .env with your DB credentials)
cp .env .env.local
# Edit .env: set DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET

# Start the server (auto-creates tables via Sequelize sync)
npm run dev

# Seed demo data (in a new terminal)
node scripts/seed.js
```

Backend runs at: `http://localhost:5000`
API Docs at: `http://localhost:5000/api-docs`
Health check: `http://localhost:5000/health`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the React dev server
npm start
```

Frontend runs at: `http://localhost:3000`

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@clinic.com | Admin@123 |
| Provider | sarah@clinic.com | Provider@123 |
| Provider | raj@clinic.com | Provider@123 |
| Provider | emily@clinic.com | Provider@123 |
| Customer | alice@example.com | Customer@123 |
| Customer | bob@example.com | Customer@123 |

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/refresh | Public |
| POST | /api/auth/logout | Authenticated |
| GET | /api/auth/me | Authenticated |

### Users
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/users/profile | Authenticated |
| PUT | /api/users/profile | Authenticated |
| GET | /api/users | ADMIN |
| PATCH | /api/users/:id/status | ADMIN |

### Providers
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/providers | Public |
| GET | /api/providers/:id | Public |
| GET | /api/providers/:id/slots | Public |
| GET | /api/providers/me/profile | PROVIDER |
| PUT | /api/providers/me/profile | PROVIDER |
| POST | /api/providers/me/slots | PROVIDER |
| PATCH | /api/providers/me/slots/:slotId | PROVIDER |

### Appointments
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/appointments | CUSTOMER |
| GET | /api/appointments/my | Authenticated |
| GET | /api/appointments/all | ADMIN |
| GET | /api/appointments/:id | Authenticated |
| PATCH | /api/appointments/:id/status | Authenticated |
| PUT | /api/appointments/:id/reschedule | CUSTOMER |

---

## Architecture

```
Controller → Service → Repository → Database
```

- **Controllers**: Route handling only, no business logic
- **Services**: All business logic, validations, transactions
- **Repositories**: DB queries only, DTO output
- **Models**: Sequelize model definitions and associations

### Double-Booking Prevention

Three layers of protection:
1. **Service layer**: `checkConflict()` query with row lock inside transaction
2. **Database constraint**: `UNIQUE(provider_id, appointment_date, time_slot)` where status is BOOKED/CONFIRMED
3. **Error middleware**: Catches `SequelizeUniqueConstraintError` and returns 409

### Appointment Status Flow

```
BOOKED → CONFIRMED → COMPLETED
       ↘            ↘
        CANCELLED    CANCELLED
```

---

## Running Tests

```bash
cd backend
npm test                  # run all tests
npm run test:coverage     # with coverage report
```

---

## Project Structure

```
appointment-system/
├── backend/
│   ├── src/
│   │   ├── config/       → db, jwt, swagger
│   │   ├── controllers/  → auth, user, provider, appointment
│   │   ├── services/     → business logic
│   │   ├── repositories/ → DB queries
│   │   ├── models/       → Sequelize models + associations
│   │   ├── dto/          → Joi validation schemas
│   │   ├── middlewares/  → auth, role, validate, error
│   │   ├── routes/       → Express routers
│   │   ├── utils/        → logger, constants, notifier
│   │   └── tests/        → Jest unit tests
│   ├── scripts/          → seed.js
│   └── .env
└── frontend/
    └── src/
        ├── components/   → Navbar, AppointmentCard, StatusChip, PrivateRoute
        ├── pages/        → Login, Register, Dashboard, Booking, Profile, etc.
        ├── services/     → api.js, auth/appointment/provider/user services
        ├── context/      → AuthContext
        └── App.jsx       → Routes + Theme
```

---

## Security Notes

- JWT stored in `sessionStorage` (cleared on tab close)
- Passwords hashed with bcrypt (12 rounds)
- All inputs validated with Joi before reaching services
- No raw DB model exposure — all output through DTOs
- Helmet sets secure HTTP headers
- CORS restricted to `ALLOWED_ORIGIN`
- Rate limiting on all API routes
