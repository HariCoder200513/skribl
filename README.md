# Skribl

Skribl is a multiplayer drawing and guessing game. This milestone implements **authentication only**.

## Prerequisites
- Java 21
- Maven 3.9+
- Node.js 18+ and npm
- PostgreSQL 14+

## PostgreSQL setup (local dev)
```bash
createdb skribl
createuser skribl -P  # set password
```
Or use Docker as needed.

## Environment variables
Copy `.env.example` to `.env` and set values. Backend reads env vars; see `backend/src/main/resources/application.yml`.

Required:
- `APP_JWT_SECRET` - at least 32 chars, random. **Do not commit secrets.**
- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`

## Run backend locally
```bash
cd backend
mvn spring-boot:run
```
Backend runs on http://localhost:8080

## Run frontend locally
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## Example requests
Register:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"password123"}'
```

Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Get current user:
```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## Run tests
Backend:
```bash
cd backend
mvn test
```

Frontend:
```bash
cd frontend
npm test
```

## JWT expiration and logout limitations
- Access token is stateless JWT, configurable via `APP_JWT_EXPIRATION_MS` (default 1 hour).
- **Logout is client-side only** - removing the token from storage. A stateless JWT cannot be revoked server-side without adding token blacklist/revocation store. This is intentional for the initial naive implementation.
- Tokens are not refreshed; refresh tokens out of scope.

## Security decisions and production hardening still required
- Use HTTPS in production (local HTTP is for dev only)
- CORS is narrowly configured via `APP_CORS_ALLOWED_ORIGINS` (no wildcard with credentials)
- JWT secret must be set and >=32 chars; app fails fast if missing/short
- Passwords hashed with BCrypt; never stored/returned in plaintext
- Generic "Invalid credentials" on login to avoid user enumeration
- Global exception handler avoids leaking stack traces/DB details
- All endpoints protected by default except register/login
- Consider rate limiting on auth endpoints in production
- For bearer tokens in browser, XSS is a concern - evaluate HttpOnly cookies + CSRF if moving beyond this simple approach
- Prefer Flyway migrations; `ddl-auto` is validate
- Add token revocation/refresh tokens, stronger secret management, and monitoring as needed
