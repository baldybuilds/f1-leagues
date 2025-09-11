# QualiPal - F1 League Manager PRD

## Core Purpose & Success
- **Mission Statement**: Provide F1 gaming communities with a comprehensive league management platform that tracks race results, standings, and performance analytics.
- **Success Indicators**: Active league creation, consistent race result tracking, user engagement with analytics features, and positive community feedback.
- **Experience Qualities**: Professional, Racing-Inspired, Data-Rich

## Project Classification & Approach
- **Complexity Level**: Complex Application (advanced functionality, user accounts, team management)
- **Primary User Activity**: Creating and Managing F1 racing leagues

## Essential Features

### Team/League Management
- Create and configure F1 teams/leagues
- Invite system for team membership
- Role-based permissions (Owner, Admin, Member)
- Team editing and deletion capabilities

### Race Result Tracking
- Add race results for selected tracks
- Support for position, points, fastest lap, and DNF tracking
- Race calendar with track selection
- Automated points calculation

### Driver Performance Analytics
- Driver standings and leaderboards
- Individual performance metrics
- Season statistics and trends
- Performance comparison tools

### **League Settings & Configuration** ⭐ New Feature
- **Scoring System Configuration**: Custom points systems, preset formats (F1 2024, Classic, Extended, Sprint)
- **League Rules Management**: Race format, penalty systems, driver aids, weather settings
- **Flexible Configuration**: Support for different league styles and preferences
- **Settings Inheritance**: Apply scoring and rules across all league races

### Authentication & Authorization
- Supabase-based authentication
- User profile management
- Secure data access controls

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Excitement, precision, professionalism
- **Design Personality**: Modern, racing-inspired, data-focused
- **Visual Metaphors**: F1 racing elements, trophies, checkered flags
- **Simplicity Spectrum**: Clean interface with rich data presentation

### Color Strategy
- **Color Scheme Type**: Racing-inspired with accent colors
- **Primary Color**: Deep racing red/purple for branding
- **Secondary Colors**: Complementary blues and golds for data
- **Accent Color**: Bright racing yellow for CTAs and highlights
- **Color Psychology**: Professional trust with exciting racing energy

### Typography System
- **Font Pairing Strategy**: Modern sans-serif for clarity and speed
- **Primary Font**: Quicksand for headings (clean, racing-inspired)
- **Body Font**: Quicksand for consistency
- **Monospace Font**: JetBrains Mono for data/results

### UI Elements & Component Selection
- **Component Library**: shadcn/ui for consistent, modern components
- **Cards**: For team display, results, and analytics
- **Tables**: For standings and detailed race results
- **Charts**: For performance analytics and trends
- **Modals**: For data entry and team management
- **Navigation**: Tab-based interface for feature organization

### League Settings UI Design
- **Settings Icon**: Sliders icon in team cards for quick access
- **Page Structure**: Tabbed interface (Scoring System, League Rules)
- **Preset Selection**: Visual cards showing different scoring systems
- **Custom Configuration**: Form-based editing with live preview
- **Rule Categories**: Organized sections for different rule types
- **Summary View**: Overview of current configuration

## Implementation Considerations

### Database Schema Updates
- New `league_settings` table with JSONB fields for flexibility
- Row-level security policies for team-based access
- Foreign key relationships to teams table

### State Management
- React hooks for settings management
- Real-time updates via Supabase subscriptions
- Optimistic UI updates for better UX

### Scoring System Integration
- Updated points calculation to use league settings
- Backward compatibility with existing race results
- Migration support for teams without settings

### Permissions & Access Control
- Team owners: Full configuration access
- Team admins: Full configuration access
- Team members: Read-only access
- Non-members: No access

## New Feature Integration

The League Settings feature seamlessly integrates with existing functionality:

1. **Team Cards**: Settings icon appears on hover for owners/admins
2. **Race Results**: Points calculated using custom scoring systems
3. **Driver Standings**: Reflects custom scoring configurations
4. **Analytics**: Adapts to different scoring systems for accurate insights

This enhancement transforms QualiPal from a basic tracking tool into a comprehensive league management platform that adapts to different community preferences and racing formats.