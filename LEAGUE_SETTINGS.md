# League Settings & Configuration

The League Settings feature allows team owners and administrators to customize scoring systems and configure detailed race rules for their F1 leagues.

## Features

### Scoring System Configuration
- **Preset Systems**: Choose from F1 2024 Standard, F1 Classic, Extended Points, or Sprint Weekend formats
- **Custom Points**: Configure points for any finishing position
- **Bonus Points**: Set fastest lap, pole position, and sprint race bonuses
- **Flexible Requirements**: Define minimum finishing position for bonus points

### League Rules Configuration
- **Race Format**: Configure qualifying format, race distance, and session structure
- **Penalty System**: Enable/disable different types of penalties and enforcement
- **Driver Aids**: Set allowed assistance systems (ABS, traction control, racing line, etc.)
- **Weather & Environment**: Configure dynamic weather and environmental conditions
- **Session Settings**: Control damage model, safety car deployment, and technical regulations

## Usage

### Accessing Settings
1. Navigate to your team dashboard
2. Find your team card and hover to reveal the settings icon (sliders)
3. Click the settings icon to open the League Settings page

### Configuring Scoring
1. **Choose a Preset**: Select from predefined scoring systems
2. **Customize Points**: Modify position points, add bonus points, configure sprint races
3. **Save Changes**: Click "Save Changes" to apply your configuration

### Setting Race Rules
1. **Race Format**: Set qualifying format, race distance, and session count
2. **Penalties**: Configure which penalty types are active
3. **Driver Aids**: Choose whether aids are disabled, enabled, or player choice
4. **Environment**: Set weather and damage model preferences
5. **Save Changes**: Apply your rule configuration

## Database Schema

The settings are stored in the `league_settings` table with JSONB fields for flexible configuration:

```sql
CREATE TABLE league_settings (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  scoring_system JSONB,
  rules JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Permissions

- **Team Owners**: Full access to view and modify all settings
- **Team Admins**: Full access to view and modify all settings  
- **Team Members**: Read-only access to view current settings
- **Non-members**: No access to league settings

## Points Calculation

The system uses the configured scoring system when calculating race result points:

```typescript
calculatePoints(position, fastestLap, dnf, scoringSystem)
```

This ensures all race results respect the league's custom scoring configuration.

## Default Configuration

New teams automatically receive F1 2024 Standard scoring with balanced rule settings that work well for most leagues. All settings can be customized as needed.