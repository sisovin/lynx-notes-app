# Notes Taking App

This project is a notes taking application built using Bun, Lynx Js, TypeScript, Tailwind CSS, and SQLite. It includes user authentication (JWT-based login & signup, Argon2, soft-delete design), Redis caching client, and CRUD functionality for notes.

## Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/githubnext/workspace-blank.git
   cd workspace-blank
   ```

2. Install dependencies:
   ```sh
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret
   REDIS_URL=your_redis_url
   ```

4. Initialize the SQLite database:
   ```sh
   bun run src/utils/initDatabase.ts
   ```

## Running the Project

1. Start the Bun server:
   ```sh
   bun run src/index.ts
   ```

2. Open your browser and navigate to `http://localhost:3000` to access the application.
