# High Level Architecture

## Technical Summary

**Kiến trúc**: Full-stack application với frontend và backend riêng biệt
**Pattern**: Monorepo structure với 2 ứng dụng độc lập

## Actual Tech Stack (from package.json)

| Category  | Technology | Version | Notes                      |
| --------- | ---------- | ------- | -------------------------- |
| **Frontend** |
| Framework | Next.js    | 14.0.3  | App Router, SSR/SSG        |
| Language  | TypeScript | ^5      | Strong typing              |
| Styling   | Tailwind CSS | ^3.3.0 | Utility-first CSS          |
| UI Library | shadcn/ui + Radix UI | Latest | Modern component library |
| State Management | Redux Toolkit | ^1.9.7 | Global state management |
| Rich Editor | TipTap | ^2.14.1 | WYSIWYG editor |
| Charts    | Chart.js + React-Chartjs-2 | ^4.4.0 + ^5.2.0 | Analytics dashboard |
| **Backend** |
| Framework | NestJS     | ^11.0.1 | Node.js framework          |
| Language  | TypeScript | ^5.7.3  | Strong typing              |
| Database  | PostgreSQL | 16      | Primary database           |
| ORM       | TypeORM    | ^0.3.24 | Database abstraction       |
| Cache     | Redis      | ^4.7.1  | Session & caching          |
| Auth      | JWT + Passport | ^11.0.0 | Authentication system |
| **DevOps** |
| Containerization | Docker + Compose | Latest | Local development |
| Build     | SWC        | ^1.10.7 | Fast compilation           |

## Repository Structure Reality Check

- **Type**: Monorepo với 2 applications
- **Package Manager**: npm
- **Notable**: Frontend và backend hoàn toàn tách biệt
