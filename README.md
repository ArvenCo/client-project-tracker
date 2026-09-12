# Client Project Tracker

A Laravel + React/Inertia application for managing client projects, tracking dates, filtering records, and creating or updating project information from a dashboard UI.

## Setup Instructions

### Option 1: Run with Docker

1. Clone the repository and open the project folder.
2. Start the app and database containers:

   ```bash
   docker compose up -d --build
   ```

3. The app should be available at:

   ```text
   http://localhost:8000
   ```

4. If needed, check the database container and app logs:

   ```bash
   docker compose logs -f app
   ```

5. To stop the environment:

   ```bash
   docker compose down
   ```

### Option 2: Run locally without Docker

1. Install PHP dependencies:

   ```bash
   composer install
   ```

2. Copy the environment file and generate an application key:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. Configure your database connection in `.env`.

4. Install frontend dependencies:

   ```bash
   npm install
   ```

5. Run database migrations:

   ```bash
   php artisan migrate
   ```

6. Build the frontend assets:

   ```bash
   npm run build
   ```

7. Start the app:

   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

8. Open the app in a browser at:

   ```text
   http://localhost:8000
   ```

## Features Implemented

- Project dashboard with a table listing client and project data
- Create new project records from the UI
- Edit existing project details
- Delete projects with confirmation
- Search projects by client or project name
- Filter projects by status and priority
- Track project start and due dates
- Laravel API endpoints for project CRUD operations
- Inertia + React frontend with responsive UI components
- Dockerized PostgreSQL setup for local development
- Seeded sample project data for quick testing

## Assumptions and Technical Reflections

