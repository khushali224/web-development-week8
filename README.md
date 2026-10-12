# DG Interns Hub — Week 8 Backend

A structured REST API for the Week 7 Job & Internship Portal, built with Node.js, Express, and MongoDB/Mongoose.

## Features

- Candidate, recruiter, and admin roles; public registration always creates a candidate.
- JWT authentication, bcrypt password hashing, role checks, and logout/account deactivation token revocation.
- Jobs with text search, type/location/skill filters, sorting, and bounded pagination.
- Candidate applications with duplicate prevention and recruiter ownership checks.
- Request validation, MongoDB operator sanitization, centralized error responses, Helmet, CORS allowlisting, and authentication rate limiting.
- Mongoose references, timestamps, unique constraints, and indexes for common lookups.

## Requirements and setup

- Node.js 18+
- MongoDB 6+ (local or hosted)

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` and set a MongoDB URI, a random `JWT_SECRET` of at least 32 characters, and the frontend origin(s) in `CORS_ORIGIN`. Never commit `.env`.

```powershell
npm run dev
```

The API listens on port `5000` by default. Check `GET /health` for process readiness. The server only starts after MongoDB connects. `npm start` runs the production entry point; `npm test` runs the unit tests.

## Roles

`POST /api/auth/register` creates candidate accounts only; clients cannot assign their own roles. For development, create a recruiter account through registration and promote it using a trusted MongoDB administration tool:

```javascript
db.users.updateOne(
  { email: "recruiter@example.com" },
  { $set: { role: "recruiter" } }
);
```

Never expose role promotion through a public endpoint. For a production admin account, use a protected operational bootstrap process rather than public registration.

## API and Postman

- Full route, body, authentication, response, and error reference: [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)
- Importable collection: [postman/DG-Interns-Hub-API.json](./postman/DG-Interns-Hub-API.json)

In Postman, set `baseUrl` to `http://localhost:5000`, run the candidate registration/login requests first, and supply a `recruiterToken` from an account promoted as above to exercise recruiter-only job and application operations. The collection stores candidate, job, and application identifiers from successful responses.

## Project structure

```text
server/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  validators/
postman/
API-DOCUMENTATION.md
```

## Security notes

- Set a strong, unique JWT secret and keep it outside source control.
- CORS allows only origins in `CORS_ORIGIN`; requests without an Origin header (for example, server-to-server/Postman requests) remain usable.
- Authentication routes are limited to 100 requests per 15 minutes per IP. Tune limits and use a shared rate-limit store for multi-instance production deployments.
- JSON and URL-encoded request bodies are capped at 1 MB.
- Logout invalidates existing access tokens by advancing a per-user token version. Account deletion deactivates the profile and invalidates its tokens.
- User deletion intentionally deactivates the account so historical applications remain attributable; deleting a job removes its applications.

## LinkedIn post draft

I completed Week 8 of my DG Interns Hub internship by improving a Job & Internship Portal backend with a structured REST API built using Node.js, Express, and MongoDB.

The API supports authentication, candidate/recruiter/admin authorization, job CRUD with text search, filters, sorting and pagination, and job applications with recruiter-controlled status updates. I added request validation, password hashing, JWT protection, Helmet, CORS configuration, rate limiting, MongoDB query sanitization, centralized errors, and database indexes. I also documented the endpoints and prepared a Postman collection for API testing.

This week helped me practice designing secure, maintainable backend services and testing API behavior end to end.

#DGInternsHub #BackendDevelopment #RESTAPI #NodeJS #ExpressJS #MongoDB
