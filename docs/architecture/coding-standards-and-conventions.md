# Coding Standards and Conventions

### Existing Standards Compliance
**Code Style:** TypeScript functional components with hooks pattern
- Consistent use of arrow functions for components
- Props interfaces defined with TypeScript
- Consistent import ordering (React, Next.js, internal, types)
- ESLint configuration with Next.js rules

**Linting Rules:** Next.js ESLint configuration with TypeScript
- `eslint-config-next` for Next.js best practices
- TypeScript strict mode enabled
- Consistent formatting through ESLint rules
- Import/export linting for proper module structure

**Testing Patterns:** Jest configuration available (from backend analysis)
- Test files following `*.spec.ts` pattern
- Component testing likely using React Testing Library
- Unit test coverage for utility functions

**Documentation Style:** JSDoc comments for complex functions
- Inline comments for complex logic
- Component prop documentation through TypeScript interfaces
- README files for major features

### Enhancement-Specific Standards
- **Design Token Usage:** All new components must use design tokens from `useDesignSystem()` hook instead of hardcoded values
- **Animation Guidelines:** Use consistent easing functions and durations defined in design system
- **Accessibility Standards:** Maintain existing WCAG compliance, enhance with proper ARIA labels
- **Component Composition:** Follow shadcn/ui composition patterns with forwardRef and variant props
- **Theme Integration:** All enhanced components must support both dark/light modes through existing Redux theme state

### Critical Integration Rules
- **Existing API Compatibility:** All enhanced components maintain identical prop interfaces to ensure drop-in replacement capability
- **Database Integration:** No direct database calls from UI components - maintain existing service layer pattern
- **Error Handling:** Use existing error boundary patterns and toast notification system (react-toastify)
- **Logging Consistency:** Frontend logging through existing client-side error tracking (no console.log in production)
