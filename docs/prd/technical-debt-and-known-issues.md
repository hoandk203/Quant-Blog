# Technical Debt and Known Issues

## UI-Related Technical Debt

1. **Styling Inconsistencies**:
   - Mix của inline styles và CSS classes
   - Không consistent spacing system
   - Some hardcoded colors thay vì design tokens

2. **Component Architecture**:
   - Một số components quá large (Header.tsx ~370 lines)
   - Thiếu reusable micro-components
   - Props drilling trong vài components

3. **Performance**:
   - Không optimized images trong post content
   - Bundle size có thể optimize thêm
   - CSS không được purged properly

## Workarounds cần biết

- **Theme System**: Redux state cho dark/light mode thay vì CSS variables
- **Mobile Menu**: Manual state management thay vì headless UI components
- **Image Handling**: Mix giữa Next/Image và regular img tags
