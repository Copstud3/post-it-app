# Post-it App

A simple social media API built with Node.js, TypeScript, Express, and Prisma. Features include user management, posts, and comments with soft-delete functionality.

## Features

- CRUD operations for Users, Posts, and Comments
- Soft-delete support with `onlyDeleted` and `includeDeleted` query params
- Swagger API documentation at `/api-docs`

## Setup

1. Clone the repo: `git clone https://github.com/copstud3/post-it-app.git`
2. Install dependencies: `npm install`
3. Set up environment: Setup `.env` and configure your PostgreSQL database.
4. Run migrations: `npx prisma migrate dev`
5. Start the server: `npm start`

## Branches
- `main`: Production-ready code (merged from `develop` via PR).
- `develop`: Development integration (merged from feature branches via PR).

## API Documentation

Explore the API at `http://localhost:3000/api-docs` after starting the server.

## Workflow
- New features/fixes: Create a `feature/<name>` branch from `develop`.
- PR to `develop`, then `develop` to `main` after review.

## Tech Stack

- Node.js
- TypeScript
- Express
- Prisma (PostgreSQL)
- Swagger (OpenAPI)
