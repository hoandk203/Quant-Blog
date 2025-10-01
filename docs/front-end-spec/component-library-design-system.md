# Component Library / Design System

### Design System Approach

**Strategy:** Extend shadcn/ui with custom finance-themed components rather than building from scratch. This approach maintains consistency with modern React ecosystem while adding specialized components for financial content.

### Core Components

#### Enhanced Button System

**Purpose:** Comprehensive button system with finance-appropriate styling

**Variants:**
- `primary`: Gradient blue-to-purple for main CTAs
- `secondary`: Outlined with finance colors
- `success`: Green gradient for positive actions (buy, profit)
- `warning`: Gold/amber for caution actions
- `danger`: Red for destructive actions (sell, delete)
- `ghost`: Subtle hover effects for navigation

**States:** Default, hover, active, disabled, loading

**Usage Guidelines:**
- Primary buttons: Max 1 per screen section
- Success/danger: Only for financial or destructive actions
- Loading state: Show spinner for async operations
- Disabled state: Clear visual feedback with tooltip explanation

#### Financial PostCard Component

**Purpose:** Enhanced content cards with finance-specific metadata

**Variants:**
- `featured`: Gradient border and enhanced typography
- `standard`: Default card with improved styling
- `compact`: Smaller version for lists
- `trending`: Special styling for hot content

**States:** Default, hover, loading, bookmarked

**Usage Guidelines:**
- Featured variant: Max 3 on homepage
- Category colors: Consistent throughout application
- Hover effects: Subtle lift and shadow enhancement

#### Community Q&A Components

**Purpose:** Specialized components for knowledge sharing

**Components:**
- `QuestionCard`: Question display with voting
- `AnswerItem`: Answer with threading support
- `VoteButton`: Animated voting interface
- `UserBadge`: Reputation and expertise display
- `TagPill`: Topic categorization

**Usage Guidelines:**
- Voting: Clear visual feedback for user actions
- Threading: Maximum 3 levels deep
- User badges: Consistent across all community features

#### Data Visualization Components

**Purpose:** Financial charts and statistics display

**Components:**
- `StatsCard`: Key metrics with trend indicators
- `MiniChart`: Small charts for cards
- `ProgressRing`: Circular progress for goals
- `TrendIndicator`: Up/down arrows with colors
- `DataTable`: Enhanced tables for financial data

**Usage Guidelines:**
- Color consistency: Green=up, Red=down, Blue=neutral
- Loading states: Skeleton screens for data fetching
- Responsive: Charts scale appropriately

#### Navigation & Layout Components

**Purpose:** Enhanced navigation with finance branding

**Components:**
- `Header`: Sticky header with glass morphism
- `Sidebar`: Collapsible navigation
- `Breadcrumb`: Path navigation with icons
- `SearchBar`: Enhanced search with suggestions
- `NotificationDropdown`: Real-time notifications

**Usage Guidelines:**
- Header transparency: Based on scroll position
- Search: Show recent searches and suggestions
- Notifications: Group by type and time
