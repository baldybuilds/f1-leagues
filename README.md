# F1 League Manager

A modern web application for managing Formula 1 fantasy leagues with friends, featuring global leaderboards, team customization, and real-time updates.

## Features

- 🏎️ **Team Management** - Create and customize F1 teams with unique names and colors
- 🏆 **Global Leaderboards** - Compete with teams worldwide in real-time standings
- 🔐 **Secure Authentication** - Email/password authentication with Supabase
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- ⚡ **Real-time Updates** - Live updates when teams are created or modified
- 🎨 **Modern UI** - F1-inspired design with smooth animations

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication & Database**: Supabase
- **Icons**: Phosphor Icons
- **Animations**: Framer Motion
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd f1-league-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Follow the setup guide in `SUPABASE_SETUP.md`
   - Run the SQL commands to create the database schema

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Usage

1. **Create an Account** - Sign up with your email and verify your account
2. **Create a Team** - Design your F1 team with a custom name and color
3. **View Standings** - Check the global leaderboard to see how you rank
4. **Manage Teams** - Edit or create additional teams as needed

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── league/         # League and standings components
│   ├── team/           # Team management components
│   └── ui/             # Reusable UI components (shadcn)
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── styles/             # CSS and theme files
```

## Database Schema

The application uses two main tables:

- **teams** - Stores team information (name, color, points, owner)
- **leagues** - For future league organization features

Row Level Security (RLS) is enabled to ensure users can only modify their own teams while viewing all teams in the global standings.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub or contact the development team.