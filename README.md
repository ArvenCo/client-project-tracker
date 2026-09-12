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

- I chose not to use Inertia’s built-in useForm hook because it was not necessary for this implementation. The backend does not require an Inertia response for every form submission, and I assumed the backend could potentially be consumed externally. Instead, I created a custom useForm hook to better fit the flow of this app.
- I also added a dedicated pagination endpoint because fetching all projects at once would make the frontend heavier and less efficient as the dataset grows.
- I did not create a separate Client table at this stage because the current scope focuses on a simple project tracker, and additional normalization would require more time and a more structured data model. The current design would need refinement if the system were scaled to support multiple projects per client more formally. If time allows after submission, I would implement a dedicated Client model and relationship structure to improve data organization and long-term maintainability.
- I kept the backend REST endpoints for GET /projects and GET /projects/:id in place to support the API layer, although the frontend does not rely on those endpoints for every interaction. The API remains available as a proper backend service. For the current implementation, I used React’s useContext hook to pass project data to the relevant components, which keeps the code simpler and more maintainable.
- I added a confirmation step before deleting a project to reduce the risk of accidental removal.
- I also use shadcn to add reusable UI components for consistent UI look
