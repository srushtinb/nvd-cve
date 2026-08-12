# NVD CVE Data Management System

A Node.js and Express-based vulnerability management dashboard that integrates the National Vulnerability Database (NVD) API to collect, process, store, and retrieve CVE data using MongoDB.

## Architecture

```text
NVD API
   |
   v
CVE Sync Service ---> MongoDB
   |                    |
   +--------------------+
            |
            v
      Express REST API
            |
            v
        Web Dashboard
```

## Tech Stack

- Node.js
- Express.js
- MongoDB / Mongoose
- NVD API
- Docker
- Docker Compose
- GitHub Actions
- Node.js built-in test runner

## API

- `GET /health` - application health check
- `GET /api/cves/list` - paginated CVE listing with filtering
- `GET /api/cves/:id` - retrieve a CVE by ID
- `GET /cve/:id` - CVE detail page
- `GET /sync` - trigger CVE synchronization

## Run locally

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/cvedb
PORT=3000
```

Install dependencies and start the application:

```bash
npm ci
npm start
```

The application is available at `http://localhost:3000`.

## Run with Docker Compose

```bash
docker compose up --build
```

The Compose setup runs the application and MongoDB as separate services with a persistent MongoDB volume.

## Testing

Run the automated tests with:

```bash
npm test
```

The GitHub Actions workflow runs the test suite and builds the Docker image on pushes and pull requests targeting `main`.
