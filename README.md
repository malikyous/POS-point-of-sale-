# POS System - Point of Sale Software

A complete Point of Sale (POS) application with React frontend, Flask backend, and MySQL database.

## Features

- **Dashboard** - Today's revenue, orders, product stats, low stock alerts
- **New Sale (POS)** - Product grid, cart, tax, discount, checkout with receipt
- **Products** - Add, edit, delete products with SKU, price, stock, categories
- **Sales History** - View all past transactions with invoice details
- **Auto Inventory** - Stock automatically decreases on each sale

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React + Vite            |
| Backend  | Flask + SQLAlchemy      |
| Database | MySQL                   |

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL Server (XAMPP, WAMP, or standalone MySQL)

## Setup

### 1. MySQL Database

Open MySQL and run:

```sql
CREATE DATABASE IF NOT EXISTS pos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the provided script:

```bash
mysql -u root -p < backend/init_db.sql
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
```

Edit `backend/.env` with your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pos_db
SECRET_KEY=your-secret-key
```

Start the Flask server:

```bash
python app.py
```

Backend runs at: http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## API Endpoints

| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/products             | List products        |
| POST   | /api/products             | Create product       |
| PUT    | /api/products/:id         | Update product       |
| DELETE | /api/products/:id         | Deactivate product   |
| GET    | /api/categories           | List categories      |
| POST   | /api/categories           | Create category      |
| GET    | /api/sales                | List sales           |
| POST   | /api/sales                | Create sale/checkout |
| GET    | /api/dashboard/stats      | Dashboard statistics |
| GET    | /api/dashboard/low-stock  | Low stock products   |

## Sample Data

On first run, the backend automatically seeds:
- 5 categories (Beverages, Snacks, Groceries, Electronics, Clothing)
- 14 sample products with stock

## Project Structure

```
POS/
├── backend/
│   ├── app.py              # Flask app entry point
│   ├── config.py           # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── routes/             # API route handlers
│   ├── requirements.txt
│   └── init_db.sql
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, POS, Products, Sales
│   │   ├── api.js          # API client
│   │   └── App.jsx         # Main app with sidebar
│   └── package.json
└── README.md
```
