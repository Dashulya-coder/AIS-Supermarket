# AIS-Supermarket

A full-stack automated information system for managing a grocery mini-supermarket.
The system supports role-based access for managers and cashiers, product and inventory management, customer cards, receipt creation, and sales reports.
 
---

## Overview

Users log in with a role-based account and interact with the system according to their permissions.

### Manager can:
- Manage employees (create, view, update, delete)
- Manage customer cards
- Manage product categories
- Manage products and store products
- View and delete receipts across all cashiers
- Generate reports: total sales by cashier, sales totals by period, quantity sold by product
### Cashier can:
- View products, store products, and customer cards
- Create and update customer cards
- Create receipts and view their own receipt history
- View individual receipt details
---

## Tech Stack

### Backend
- **Go** (Golang)
- **Gin** — HTTP framework
- **PostgreSQL** — relational database
- **JWT** — authentication
- **Docker / Docker Compose**
### Frontend
- **React 19** + **TypeScript**
- **Vite** — build tool
- **Axios** — HTTP client
- **React Router** — client-side routing
---

## Architecture

The backend follows a layered architecture:

| Layer | Responsibility |
|---|---|
| HTTP Layer | Request handling, routing, response codes |
| Service Layer | Business logic and validation |
| Repository Layer | SQL queries and database access |
| Middleware | JWT authentication and role-based authorization |
| Migrations | Database schema, indexes, seed data |

Frontend structure is modular:

| Part | Responsibility |
|---|---|
| Pages | UI screens for each module |
| API Layer | HTTP requests to the backend |
| Context | Authentication state management |
| Components | Shared UI elements (`Navbar`, `ProtectedRoute`, `Layout`) |
 
---

## Authentication and Roles

The system supports two roles: **Manager** and **Cashier**.

Authentication uses **JWT**:
- The token is returned by the backend on login
- Stored on the frontend and automatically attached to protected API requests
- Role-based middleware restricts access at the route level
---

## API Endpoints

### Auth

#### Login
```
POST /auth/login
```

**Request:**
```json
{
  "username": "john_doe",
  "password": "secret"
}
```

**Response:**
```json
{
  "token": "<jwt_token>",
  "role": "Manager"
}
```
 
---

### Categories

| Method | Endpoint | Role |
|---|---|---|
| `GET` | `/categories` | Manager, Cashier |
| `GET` | `/categories/:id` | Manager, Cashier |
| `POST` | `/categories` | Manager |
| `PUT` | `/categories/:id` | Manager |
| `DELETE` | `/categories/:id` | Manager |
 
---

### Products

| Method | Endpoint | Role |
|---|---|---|
| `GET` | `/products` | Manager, Cashier |
| `GET` | `/products/:id` | Manager, Cashier |
| `POST` | `/products` | Manager |
| `PUT` | `/products/:id` | Manager |
| `DELETE` | `/products/:id` | Manager |
 
---

### Store Products

| Method | Endpoint | Role |
|---|---|---|
| `GET` | `/store-products` | Manager, Cashier |
| `GET` | `/store-products/:upc` | Manager, Cashier |
| `POST` | `/store-products` | Manager |
| `PUT` | `/store-products/:upc` | Manager |
| `DELETE` | `/store-products/:upc` | Manager |
 
---

### Employees

| Method | Endpoint | Role |
|---|---|---|
| `GET` | `/employees` | Manager |
| `GET` | `/employees/:id` | Manager |
| `POST` | `/employees` | Manager |
| `PUT` | `/employees/:id` | Manager |
| `DELETE` | `/employees/:id` | Manager |
 
---

### Customer Cards

| Method | Endpoint | Role |
|---|---|---|
| `GET` | `/customer-cards` | Manager, Cashier |
| `GET` | `/customer-cards/:card_number` | Manager, Cashier |
| `POST` | `/customer-cards` | Manager, Cashier |
| `PUT` | `/customer-cards/:card_number` | Manager, Cashier |
| `DELETE` | `/customer-cards/:card_number` | Manager |
 
---

### Receipts

| Method | Endpoint | Role |
|---|---|---|
| `GET` | `/receipts/all` | Manager |
| `GET` | `/receipts` | Manager |
| `GET` | `/receipts/my` | Cashier |
| `GET` | `/receipts/:receipt_number` | Manager, Cashier |
| `POST` | `/receipts` | Cashier |
| `DELETE` | `/receipts/:receipt_number` | Manager |
 
---

### Reports

| Method | Endpoint | Description | Role |
|---|---|---|---|
| `GET` | `/reports/sales-by-cashier` | Total sales grouped by cashier for a period | Manager |
| `GET` | `/reports/sales-total` | Total sales for a period | Manager |
| `GET` | `/reports/product-quantity` | Total quantity sold by UPC | Manager |
 
---

## Environment Variables

Create a `.env` file in the `backend/` directory:

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `APP_PORT` | HTTP server port (default: `8080`) |

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=zlagoda
JWT_SECRET=your-secret-key
APP_PORT=8080
```
 
---

## Running Locally

### 1. Start dependencies

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on port `5432`
- **Backend** on port `8080`
- **Frontend** on port `5173`
### 2. Or run services manually

**Backend:**

```bash
cd backend
go run cmd/server/main.go
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173)
 
---

## Database

Migrations are located in `backend/migrations/` and are applied automatically on startup.

Three migration files:

| File | Content |
|---|---|
| `001_init.sql` | Schema — all tables (categories, products, employees, users, customer cards, store products, receipts, receipt items) |
| `002_indexes.sql` | Performance indexes |
| `003_seed.sql` | Initial seed data for development |

### Main Tables

**`employees`** — stores employee records with position, contact info, and salary

**`users`** — login credentials linked to employees, with role and active status

**`categories`** — product categories

**`products`** — products linked to categories, with producer and characteristics

**`store_products`** — inventory items with UPC, price, stock count, and promotional flag

**`customer_cards`** — customer loyalty cards with discount percentage

**`receipts`** — sales receipts linked to a cashier and optionally to a customer card

**`receipt_items`** — individual line items of a receipt (product, quantity, price)
 
---

## Docker

**Start all services:**
```bash
docker-compose up -d
```

**Stop all services:**
```bash
docker-compose down
```

The `docker-compose.yml` defines three services: `db` (PostgreSQL 15), `backend` (Go app), and `frontend` (React/Vite).
 
---

## Author

**Daria Ukshe**