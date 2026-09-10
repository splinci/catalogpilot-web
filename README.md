# 🚀 Project Atlas

> AI-powered Product Catalog & Inventory Management Platform

![Version](https://img.shields.io/badge/version-v0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Status](https://img.shields.io/badge/status-Active-success)

---

# 📖 Overview

Project Atlas is an AI-powered ERP platform focused on **product catalog management, inventory control, and business operations**.

The goal of Atlas is to provide a modern ERP solution that combines Artificial Intelligence with inventory management, enabling businesses to manage products faster, automate repetitive work, and scale efficiently.

Atlas is currently under active development and follows modern software engineering practices including layered architecture, domain-driven organization, semantic versioning, and GitHub release management.

---

# 🎯 Vision

Project Atlas aims to become a modern AI-powered ERP platform for small and medium businesses.

The long-term goal is to provide a complete business operating system covering:

- Inventory
- Purchasing
- Sales
- Warehouse
- Manufacturing
- CRM
- Analytics
- Artificial Intelligence

---

# ✨ Current Modules

| Module | Status |
|---------|--------|
| 🏠 Dashboard | 🟡 UI Complete |
| 📦 Products | ✅ Complete |
| ➕ AI Product Creation | ✅ Complete |
| 📥 Bulk Product Generator | ✅ Complete |
| 📊 Inventory | ✅ Complete |
| 📜 Inventory History | ✅ Complete |
| 🏷 Brands | ✅ Complete |
| 📂 Categories | ✅ Complete |
| 🚚 Suppliers | ✅ Complete |
| 🛒 Sales Channels | ✅ Complete |
| ⚙ Settings | ⏳ Planned |

---

# 🚀 Features

## 📦 Product Management

- Product CRUD
- Product Search
- Archive Products
- Product Statistics
- Barcode Support
- SKU Management

---

## 📊 Inventory Management

- Inventory Dashboard
- Stock Adjustments
- Inventory History
- Low Stock Monitoring
- Inventory Statistics

---

## 🤖 AI Features

- AI Product Creation
- AI Bulk Product Generation
- Excel Import Support

---

## 🗂 Master Data

- Brands
- Categories
- Suppliers
- Sales Channels

---

# 🏗 System Architecture

Atlas follows a layered architecture that separates business logic from infrastructure.

```
Repository
      │
      ▼
Service Layer
      │
      ▼
API Routes
      │
      ▼
Frontend Services
      │
      ▼
React Query
      │
      ▼
UI Components
```

This architecture improves:

- Maintainability
- Testability
- Scalability
- Separation of Concerns

---

# 📂 Project Structure

```
src/
│
├── app/
│
├── domains/
│   ├── product/
│   ├── inventory/
│   ├── brand/
│   ├── category/
│   ├── supplier/
│   └── sales-channel/
│
├── features/
│
├── hooks/
│
├── services/
│
├── generated/
│
└── lib/
```

---

# 🛠 Technology Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS

## Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL

## State Management

- React Query

## Development Tools

- Git
- GitHub
- GitHub Releases
- Prisma Migrations

---

# 🧩 Design Patterns

Atlas uses modern software architecture patterns.

- Repository Pattern
- Service Layer
- DTO Pattern
- Mapper Pattern
- Domain-based Folder Structure
- React Query Data Fetching

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/G-Mohankumar/catalogpilot-web.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create an `.env` file.

Example:

```env
DATABASE_URL="postgresql://..."
```

---

## Run Development Server

```bash
npm run dev
```

---

## Build Production

```bash
npm run build
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Run Database Migration

```bash
npx prisma migrate dev
```

---

# 📦 Current Release

| Version | Status |
|---------|--------|
| **v0.1.0** | ✅ Released |

Released: **July 2026**

Release Name:

> **Atlas v0.1.0 – Product & Inventory Foundation**

---

# 🗺 Development Roadmap

| Version | Status | Features |
|---------|--------|----------|
| ✅ v0.1.0 | Released | Product & Inventory Foundation |
| 🔄 v0.2.0 | Planned | Purchase Orders, Goods Receipt |
| 🔄 v0.3.0 | Planned | Customers, Sales Orders, Invoices |
| 🔄 v0.4.0 | Planned | Warehouse Management |
| 🔄 v0.5.0 | Planned | Reports & Analytics |
| 🚀 v1.0.0 | Future | Production ERP Release |

---

# 📸 Screenshots

Coming Soon

- Dashboard
- Product Management
- Inventory
- Inventory History
- Brand Management
- Category Management
- Supplier Management

---

# 📈 Development Workflow

Atlas follows a Git Flow inspired workflow.

```
main
    │
    ├── develop
    │
    ├── feature/products
    ├── feature/inventory
    ├── feature/categories
    ├── feature/suppliers
    └── feature/...
```

Each feature is developed on its own branch and merged using Pull Requests.

---

# 🧪 Build Status

Current Status

✅ Production Build Passing

```bash
npm run build
```

---

# 🤝 Contributing

Atlas is currently maintained by the project owner.

Development follows:

- Feature Branches
- Pull Requests
- Code Reviews
- Semantic Versioning
- GitHub Releases

---

# 👨‍💻 Author

**Mohankumar G**

Creator of **Project Atlas**

AI-powered ERP Platform

---

# 📄 License

Copyright © 2026 Mohankumar G.

All Rights Reserved.

This repository is private.
Unauthorized copying, modification, distribution, or commercial use is prohibited without permission.
