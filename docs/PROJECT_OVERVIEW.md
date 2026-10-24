# Project Overview - Skribl

## Goal
Skribl is a multiplayer drawing and guessing game. For this milestone, the scope is **authentication only** (registration, login, current user, logout behavior).

## Scope
In scope:
- User registration (username, email, password) with validation and uniqueness
- Login returning signed JWT access token + user details
- `GET /api/auth/me` protected by Bearer token
- Stateless JWT auth, BCrypt password hashing
- Frontend auth pages (register/login), auth state, protected routes, logout (client-side removal)
- Tests for auth flows

Out of scope (do not implement now):
- Rooms, lobbies, drawing, gameplay, WebSockets, scoring
- Token revocation/refresh tokens
- Redis/Kafka/microservices/distributed infra

## Milestones
1. [Current] Auth baseline (simple, secure, tested)
2. [Future] Improve auth based on measured limitations (revocation, refresh, rate limiting, etc.)

## Philosophy
Naive-to-optimized: simple working first, measure, identify bottlenecks, optimize one change at a time with evidence.
