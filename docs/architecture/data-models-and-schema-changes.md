# Data Models and Schema Changes

### New Data Models

#### UserPreferences (Optional Enhancement)
**Purpose:** Store user-specific UI preferences for enhanced personalization
**Integration:** Extends existing User entity without breaking changes

**Key Attributes:**
- `id`: UUID (Primary Key) - Unique identifier for preferences
- `userId`: UUID (Foreign Key) - References existing User entity
- `themePreference`: ENUM('system', 'light', 'dark', 'auto') - Enhanced theme options
- `dashboardLayout`: JSON - Customizable dashboard widget arrangement
- `editorPreferences`: JSON - TipTap editor UI customizations (toolbar layout, etc.)
- `accessibilitySettings`: JSON - Font size, contrast preferences, etc.
- `createdAt`: TIMESTAMP - Creation timestamp
- `updatedAt`: TIMESTAMP - Last modification timestamp

**Relationships:**
- **With Existing:** One-to-One relationship with User entity
- **With New:** Standalone entity, no relationships with other new entities

### Schema Integration Strategy
**Database Changes Required:**
- **New Tables:** `user_preferences` (optional)
- **Modified Tables:** None - all existing tables remain unchanged
- **New Indexes:** `idx_user_preferences_user_id` for performance
- **Migration Strategy:** Additive-only migrations with default values

**Backward Compatibility:**
- All existing functionality works without user_preferences table
- Default UI behavior maintained for users without preferences
- New features gracefully degrade if preferences unavailable
- No breaking changes to existing API contracts
