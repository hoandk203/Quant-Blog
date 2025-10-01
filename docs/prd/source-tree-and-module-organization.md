# Source Tree and Module Organization

## Project Structure (Actual)

```text
Quant-Blog-main/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # Next.js 14 App Router
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── Layout/        # Layout components (Header, Footer)
│   │   │   ├── Home/          # Homepage components
│   │   │   ├── Posts/         # Blog post components
│   │   │   ├── Editor/        # TipTap editor components
│   │   │   ├── Auth/          # Authentication forms
│   │   │   ├── Admin/         # Admin dashboard
│   │   │   └── Common/        # Shared components
│   │   ├── services/          # API service layer
│   │   ├── store/             # Redux store & slices
│   │   ├── styles/            # CSS files
│   │   └── types/             # TypeScript type definitions
│   ├── public/                # Static assets & screenshots
│   └── tailwind.config.js     # Tailwind configuration
├── backend/                    # NestJS application
│   └── src/
│       ├── modules/           # Feature modules
│       │   ├── auth/         # Authentication module
│       │   ├── posts/        # Blog posts module
│       │   ├── users/        # User management
│       │   ├── categories/   # Post categories
│       │   ├── tags/         # Post tags
│       │   ├── comments/     # Comments system
│       │   ├── qa/           # Q&A community feature
│       │   └── dashboard/    # Admin analytics
│       ├── entities/         # TypeORM entities
│       ├── dto/              # Data transfer objects
│       └── common/           # Shared utilities
├── docs/                      # Documentation (NEW)
├── db.sql                     # Database schema
└── docker-compose.yml         # Development services
```

## Key Modules and Their Purpose

**Frontend Components (UI Focus)**:
- **Layout/Header.tsx**: Navigation bar - modern glass-morphism design với scroll effects
- **Home/HomePage.tsx**: Landing page - gradient backgrounds, hero section
- **ui/ folder**: shadcn/ui components - consistent design system
- **Posts/PostCard.tsx**: Blog post cards - cần cải thiện visual hierarchy
- **Editor/TipTap**: Rich text editor với toolbar - cần UI polish

**Backend Modules**:
- **auth**: JWT authentication với Google OAuth
- **posts**: Core blog functionality với categories/tags
- **qa**: Community Q&A feature
- **dashboard**: Admin analytics với Chart.js
