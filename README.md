# Children's Event Platform

A React TypeScript platform connecting parents with children's event organizers, featuring intuitive event discovery, registration management, and organizer profiles.

## Features

- **User Authentication** - Separate registration and login flows for parents and event organizers with profile management
- **Event Dashboard** - Organizers can create, edit, and manage events with participant tracking
- **Event Discovery** - Parents can browse events with filters for date, category, age group, and location
- **Registration System** - Simple flow for parents to register children for events with confirmation
- **Organizer Profiles** - Detailed profiles showing contact information, past events, and ratings

## Backend Architecture

This application uses Supabase as the backend service, providing:

- **Authentication** - Email/password authentication with role-based access
- **Database** - PostgreSQL database with tables for users, events, registrations, etc.
- **Storage** - File storage for event images and other assets
- **Row-Level Security** - Fine-grained access control for database tables

## Database Schema

- **parents** - Parent user profiles
- **organizers** - Event organizer profiles
- **children** - Children profiles linked to parents
- **events** - Event listings created by organizers
- **registrations** - Event registrations linking children to events
- **reviews** - Event reviews from parents

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/childrens-event-platform.git
   cd childrens-event-platform
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a Supabase project and set up the database
   - Create a new project in Supabase
   - Run the SQL migrations in `supabase/migrations/`

4. Set up environment variables
   ```
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials

5. Start the development server
   ```
   npm run dev
   ```

## API Structure

The application uses a set of API modules to interact with the Supabase backend:

- **authAPI** - Authentication and user management
- **parentAPI** - Parent-specific operations (children management)
- **eventAPI** - Event CRUD operations and queries
- **registrationAPI** - Event registration management
- **reviewAPI** - Event reviews and ratings

## React Hooks

Custom React hooks provide an interface to the API modules:

- **useAuth** - Authentication state and operations
- **useEvents** - Event management and queries
- **useRegistrations** - Registration operations
- **useProfile** - User profile management
- **useReviews** - Review creation and queries

## Deployment

The application can be deployed to any static hosting service:

1. Build the application
   ```
   npm run build
   ```

2. Deploy the `dist` directory to your hosting service

## License

This project is licensed under the MIT License - see the LICENSE file for details.
