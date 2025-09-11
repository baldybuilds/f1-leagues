# QualiPal - F1 League Manager PRD

## Core Purpose & Success
- **Mission Statement**: Provide F1 gaming communities with a simple, elegant league management platform that tracks race results and league participation.
- **Success Indicators**: Active league creation, consistent invite system usage, clean team management, and positive user experience.
- **Experience Qualities**: Simple, Professional, Community-Focused

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state, invite system)
- **Primary User Activity**: Creating and managing F1 racing leagues with friends

## Essential Features

### League Management
- Create F1 leagues with track selection
- Game version selection (F1 24, F1 25)
- Date range configuration
- Clean league overview and management

### Team Invitation System
- Send invites via email
- Accept/reject invitations
- Role-based access (Owner, Member)
- Real-time invite management

### Track Selection
- Full 2025 F1 calendar available
- Multi-track selection for leagues
- Track information display
- Season-based track organization

### Authentication & Authorization
- Supabase-based authentication
- User profile management
- Secure data access controls
- Row Level Security implementation

## Current Implementation Status
- ✅ Authentication system working
- ✅ League creation with track selection  
- ✅ Invitation system functional
- ✅ Clean database structure with no circular dependencies
- ✅ Responsive UI components
- ✅ Complete database rebuild with proper constraints
- ✅ Fixed all column naming inconsistencies
- ✅ Working team management features
- ✅ Proper Row Level Security policies
- 🔄 Ready for future feature expansion

## Recent Fixes Applied
- Fixed infinite recursion in database policies
- Corrected column naming (game_version, invitee_email, inviter_id)
- Removed circular dependencies in RLS policies
- Added proper unique constraints for ON CONFLICT handling
- Cleaned up unused database files and documentation
- Standardized type definitions across components

## Future Expansion Areas
- Race result tracking
- Driver standings
- Performance analytics
- Scoring system configuration
- Calendar integration

### Color Strategy
- **Color Scheme Type**: Racing-inspired with professional tones
- **Primary Color**: Deep magenta/purple for F1 branding inspiration
- **Secondary Colors**: Complementary gold/yellow for accent elements
- **Accent Color**: Teal/cyan for highlights and success states
- **Color Psychology**: Professional racing aesthetic with modern appeal

### Typography System
- **Font Pairing Strategy**: Modern sans-serif for clarity and speed
- **Primary Font**: Quicksand for headings (clean, racing-inspired)
- **Body Font**: Quicksand for consistency
- **Monospace Font**: JetBrains Mono for data/results

### UI Elements & Component Selection
- **Component Library**: shadcn/ui for consistent, modern components
- **Cards**: For league display and management
- **Forms**: For league creation and invitations
- **Tables**: Future use for standings and results
- **Modals**: For data entry and team management
- **Navigation**: Tab-based interface for feature organization

## Implementation Notes

### Database Architecture
- Clean, normalized schema with proper relationships
- Row-level security for team-based access control
- UUID primary keys for security
- Enum types for constrained values
- Proper indexing and constraints

### Authentication & Security
- Supabase Auth integration
- Row Level Security policies
- Role-based access control
- Email-based invitations

### Performance Considerations
- Efficient queries with proper joins
- Real-time subscriptions for live updates
- Optimistic UI updates
- Proper error handling and loading states