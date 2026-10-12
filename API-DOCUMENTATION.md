# DG Interns Hub API Documentation

Base URL: `http://localhost:5000`

All endpoints use JSON. Protected routes require `Authorization: Bearer <token>`. Responses use `{ "success": true, ... }` or `{ "success": false, "message": "..." }`. Public registration always creates a `candidate`; role changes are an administrative operation and never accepted from the request body.

## Authentication

### `POST /api/auth/register`

Purpose: Create a candidate account. Authentication: None.

Request:

```json
{ "name": "Asha Rao", "email": "asha@example.com", "password": "securePass123" }
```

Success (`201`): `{ "success": true, "message": "Registration successful", "data": { "user": { "id": "...", "name": "Asha Rao", "email": "asha@example.com", "role": "candidate", "bio": "", "skills": [] }, "token": "JWT" } }`

Errors: `400` invalid/missing fields; `409` email already registered.

### `POST /api/auth/login`

Purpose: Authenticate an active account. Authentication: None.

Request: `{ "email": "asha@example.com", "password": "securePass123" }`

Success (`200`): `{ "success": true, "message": "Login successful", "data": { "user": { "id": "...", "name": "Asha Rao", "email": "asha@example.com", "role": "candidate", "bio": "", "skills": [] }, "token": "JWT" } }`

Errors: `400` invalid request; `401` invalid email or password.

### `GET /api/auth/me`

Purpose: Return the authenticated user. Authentication: Any active user.

Success (`200`): `{ "success": true, "data": { "user": { "id": "...", "name": "...", "email": "...", "role": "candidate", "bio": "", "skills": [] } } }`

Errors: `401` missing, invalid, expired, revoked, or inactive-user token.

### `POST /api/auth/logout`

Purpose: Revoke the account's existing access tokens. Authentication: Any active user.

Success (`200`): `{ "success": true, "message": "Logged out successfully" }`

Errors: `401` missing or invalid token. Send the token being revoked.

## Users

### `GET /api/users/profile`

Purpose: Read the current user's profile. Authentication: Any active user.

Success (`200`): `{ "success": true, "data": { "user": { "id": "...", "name": "...", "email": "...", "role": "candidate", "bio": "", "skills": [] } } }`

Errors: `401` missing or invalid token.

### `PUT /api/users/profile`

Purpose: Update the current user's name, bio, and/or skills. Authentication: Any active user.

Request (all fields optional): `{ "name": "Asha Rao", "bio": "Computer science student", "skills": ["JavaScript", "React"] }`

Success (`200`): `{ "success": true, "message": "Profile updated successfully", "data": { "user": { "id": "...", "name": "Asha Rao", "email": "...", "role": "candidate", "bio": "Computer science student", "skills": ["JavaScript", "React"] } } }`

Errors: `400` invalid fields; `401` missing or invalid token. Email, role, and password are not editable here.

### `DELETE /api/users/profile`

Purpose: Deactivate the current account and revoke its access tokens. Authentication: Any active user.

Success (`200`): `{ "success": true, "message": "Profile deactivated successfully" }`

Errors: `401` missing or invalid token.

## Jobs

### `GET /api/jobs`

Purpose: Search and browse jobs. Authentication: None.

Query parameters: `search` searches indexed title/company/skills/location/description terms; `type` is `internship`, `full-time`, `part-time`, or `contract`; `location` is a case-insensitive substring; `skill` is a case-insensitive skill substring; `page` defaults to 1; `limit` defaults to 10 and is capped at 100; `sort` is `newest` (default), `oldest`, or `deadline`.

Example: `/api/jobs?search=react&type=internship&location=remote&skill=javascript&page=1&limit=10&sort=newest`

Success (`200`): `{ "success": true, "page": 1, "limit": 10, "total": 45, "totalPages": 5, "data": [{ "_id": "...", "title": "Frontend Intern", "company": "Example Co", "location": "Remote", "type": "internship", "skills": ["React"], "createdBy": { "_id": "...", "name": "Recruiter" } }] }`

Errors: `400` invalid type, sort, page, or limit.

### `GET /api/jobs/:id`

Purpose: Return a single job. Authentication: None. Parameters: MongoDB job ID.

Success (`200`): `{ "success": true, "data": { "job": { "_id": "...", "title": "...", "company": "...", "description": "...", "location": "...", "type": "internship", "skills": [], "deadline": "...", "createdBy": { "_id": "...", "name": "Recruiter" } } } }`

Errors: `400` malformed ID; `404` job not found.

### `POST /api/jobs`

Purpose: Publish a job. Authentication: Recruiter or admin. Body: required `title`, `company`, `description`, `location`, `type`, and ISO-8601 `deadline`; optional `skills` string array.

Example: `{ "title": "Frontend Intern", "company": "Example Co", "description": "Build UI features.", "location": "Remote", "type": "internship", "skills": ["React", "JavaScript"], "deadline": "2027-01-31T23:59:00.000Z" }`

Success (`201`): `{ "success": true, "message": "Job created successfully", "data": { "job": { "_id": "...", "title": "Frontend Intern", "company": "Example Co", "createdBy": "..." } } }`

Errors: `400` invalid/missing fields; `401` unauthenticated; `403` wrong role.

### `PUT /api/jobs/:id`

Purpose: Replace the editable fields of a job. Authentication: Owning recruiter or admin. Parameters: job ID. Body: same required fields as job creation.

Success (`200`): `{ "success": true, "message": "Job updated successfully", "data": { "job": { "_id": "...", "title": "...", "company": "..." } } }`

Errors: `400` invalid ID/body; `401` unauthenticated; `403` wrong role or not owner; `404` job not found.

### `DELETE /api/jobs/:id`

Purpose: Delete a job and its applications. Authentication: Owning recruiter or admin. Parameters: job ID.

Success (`200`): `{ "success": true, "message": "Job deleted successfully" }`

Errors: `400` invalid ID; `401` unauthenticated; `403` wrong role or not owner; `404` job not found.

## Applications

### `POST /api/applications`

Purpose: Apply to an open job. Authentication: Candidate.

Request: `{ "jobId": "65a000000000000000000001", "coverLetter": "I am interested in this internship." }`

Success (`201`): `{ "success": true, "message": "Application submitted successfully", "data": { "application": { "_id": "...", "job": "...", "applicant": "...", "status": "applied" } } }`

Errors: `400` invalid body, expired deadline, or duplicate application; `401` unauthenticated; `403` wrong role; `404` job not found.

### `GET /api/applications/my`

Purpose: List the current candidate's applications and basic job details. Authentication: Candidate.

Success (`200`): `{ "success": true, "data": { "applications": [{ "_id": "...", "status": "applied", "job": { "_id": "...", "title": "...", "company": "..." } }] } }`

Errors: `401` unauthenticated; `403` wrong role.

### `GET /api/applications/:id`

Purpose: Read an application. Authentication: Owning candidate, recruiter who owns the associated job, or admin. Parameters: application ID.

Success (`200`): `{ "success": true, "data": { "application": { "_id": "...", "status": "applied", "job": { "_id": "...", "title": "...", "createdBy": "..." }, "applicant": { "_id": "...", "name": "...", "email": "..." } } } }`

Errors: `400` invalid ID; `401` unauthenticated; `403` not authorized; `404` application not found.

### `PUT /api/applications/:id/status`

Purpose: Update application status. Authentication: Recruiter who owns the job or admin. Body: `{ "status": "shortlisted" }`; status may be `shortlisted`, `selected`, or `rejected`.

Success (`200`): `{ "success": true, "message": "Application status updated successfully", "data": { "application": { "_id": "...", "status": "shortlisted" } } }`

Errors: `400` invalid ID/status; `401` unauthenticated; `403` wrong role or not owner; `404` application not found.

### `DELETE /api/applications/:id`

Purpose: Withdraw an application or remove it as its job's recruiter/admin. Authentication: Owning candidate, recruiter who owns the job, or admin. Parameters: application ID.

Success (`200`): `{ "success": true, "message": "Application deleted successfully" }`

Errors: `400` invalid ID; `401` unauthenticated; `403` not authorized; `404` application not found.

## Standard errors and security behavior

Examples:

```json
{ "success": false, "message": "Authentication required" }
```

```json
{ "success": false, "message": "Job not found" }
```

```json
{ "success": false, "message": "Email is required" }
```

Errors do not return stack traces or database internals. Authentication routes have a per-IP limit of 100 requests per 15 minutes. JSON requests are limited to 1 MB.
