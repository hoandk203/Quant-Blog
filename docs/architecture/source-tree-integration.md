# Source Tree Integration

### Existing Project Structure
```plaintext
Quant-Blog-UI/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # Next.js 14 App Router
│   │   ├── components/         # React components (well organized)
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── Layout/        # Header, Footer, MainLayout
│   │   │   ├── Home/          # Homepage components
│   │   │   ├── Posts/         # Blog post components
│   │   │   ├── Editor/        # TipTap editor components
│   │   │   ├── Auth/          # Authentication forms
│   │   │   ├── Admin/         # Admin dashboard
│   │   │   └── Common/        # Shared components
│   │   ├── services/          # API service layer
│   │   ├── store/             # Redux store & slices
│   │   ├── styles/            # CSS files
│   │   └── types/             # TypeScript definitions
│   └── tailwind.config.js     # Tailwind configuration
├── backend/                    # NestJS application (unchanged)
└── docs/                      # Documentation
```

### New File Organization
```plaintext
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                        # Existing shadcn/ui components
│   │   │   ├── button.tsx             # Enhanced with new variants
│   │   │   ├── card.tsx               # Enhanced styling
│   │   │   └── theme-provider.tsx     # NEW: Enhanced theme management
│   │   ├── design-system/             # NEW: Design system components
│   │   │   ├── ColorPalette.tsx       # Color token components
│   │   │   ├── Typography.tsx         # Typography system
│   │   │   └── DesignTokens.tsx       # Token provider
│   │   ├── Layout/                    # Existing folder with enhancements
│   │   │   ├── Header.tsx             # Enhanced with new design
│   │   │   ├── Footer.tsx             # Enhanced styling
│   │   │   └── Navigation.tsx         # NEW: Extracted nav logic
│   │   ├── Posts/                     # Enhanced post components
│   │   │   ├── PostCard.tsx           # Enhanced visual design
│   │   │   ├── PostGrid.tsx           # NEW: Improved grid layout
│   │   │   └── PostCardSkeleton.tsx   # NEW: Loading states
│   │   ├── Editor/                    # Enhanced editor components
│   │   │   ├── TiptapEditor.tsx       # Enhanced with better UI
│   │   │   ├── toolbar/               # Existing folder
│   │   │   │   └── EnhancedToolbar.tsx # NEW: Modern toolbar
│   │   │   └── EditorTheme.tsx        # NEW: Editor-specific theming
│   │   └── Admin/                     # Enhanced admin components
│   │       └── dashboard/             # Existing folder
│   │           ├── ModernCharts.tsx   # NEW: Enhanced chart components
│   │           └── DataTable.tsx      # NEW: Modern table design
│   ├── styles/
│   │   ├── globals.css                # Enhanced with new design tokens
│   │   ├── components.css             # NEW: Component-specific styles
│   │   └── animations.css             # NEW: Micro-interaction animations
│   ├── hooks/                         # NEW: Custom hooks for UI
│   │   ├── useDesignSystem.ts         # Design system hook
│   │   ├── useTheme.ts                # Enhanced theme hook
│   │   └── useAnimations.ts           # Animation utilities
│   └── utils/
│       ├── cn.ts                      # Existing class name utility
│       └── design-tokens.ts           # NEW: Design token utilities
├── tailwind.config.js                 # Enhanced with design system
└── components.json                    # Updated shadcn/ui config
```

### Integration Guidelines
- **File Naming:** Maintain existing PascalCase for components, maintain existing patterns
- **Folder Organization:** Follow established feature-based organization, add design-system folder for new tokens
- **Import/Export Patterns:** Use existing barrel exports pattern, maintain consistent import structure from '@/components'
