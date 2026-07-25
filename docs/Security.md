# Security Policy & Guidelines

This document outlines the security architecture, data handling practices, and vulnerability disclosure policies of MetaPilot.

---

## 1. Security Architecture

MetaPilot is designed with a defense-in-depth approach, safeguarding metadata integrity and user privacy at every tier:

```
[Vite UI Client]  --> HTTPS (SSL/TLS 1.3)
      │
      ▼
[Render API Gateway / Proxy] --> JWT Signature Verification
      │
      ▼
[FastAPI Backend Core] 
      ├── Rate Limiting (Redis token-buckets)
      ├── SQL Injection Sanitization Engine
      └── Cryptographic Passwords (bcrypt)
```

---

## 2. Authentication & Cryptography

### User Security
* **Password Hashing**: User passwords are encrypted before database persistence using the **bcrypt** algorithm with a work factor of 12. Plaintext passwords are never logged or stored.
* **Token Auth**: API routes are protected using JSON Web Tokens (JWT). Upon authentication, users receive a signed token with a 60-minute expiration.
* **Cryptographic Signatures**: JWTs are signed using HMAC-SHA256 with a high-entropy secret key defined by `SECRET_KEY`.

### Session Safety
* JWT tokens are passed via the standard `Authorization: Bearer <token>` HTTP header.
* API sessions automatically terminate when token expiration is reached, prompting re-authentication.

---

## 3. Data Protection & Privacy

* **Metadata Isolation**: MetaPilot only reads schema definitions, metadata attributes, tags, and lineages. It does **not** ingest, cache, or transmit actual transactional business data from Snowflake, Postgres, or other databases.
* **Least Privilege Access**: DataHub connection keys and LLM service provider credentials must follow the Principle of Least Privilege (PoLP), limiting read/write scopes to catalog components.

---

## 4. Input Validation & Injection Prevention

Because MetaPilot compiles SQL code and config configurations from AI responses, it runs checks to prevent prompt injections and compilation risks:

1. **SQL Sanitization**: Generated SQL models run through format checkers (Regex parser validation checks) to strip malicious command injection characters (e.g., `; DROP TABLE`, `; UPDATE`).
2. **Strict Schema Constraints**: The validator verifies that all compiled tables and columns match the active fields retrieved from DataHub.
3. **Pydantic Validation**: Every API payload is validated against Pydantic schemas before controller logic executes, preventing buffer overflows and parameter mismatches.

---

## 5. Rate Limiting & Abuse Prevention

* MetaPilot integrates a Redis-backed **Token Bucket Rate Limiter** middleware.
* By default, each remote IP address is limited to a maximum of 100 requests per 60 seconds.
* Exceeding this rate returns an `HTTP 429 Too Many Requests` status, protecting the server against DDoS attempts.

---

## 6. Vulnerability Disclosure

If you discover a security vulnerability in MetaPilot, please do not open a public GitHub issue. Instead, report it privately:

1. Email the vulnerability details to **security@metapilot.io**.
2. Include steps to reproduce the issue, along with any proof-of-concept scripts.
3. The security team will acknowledge receipt of the report within 24 hours and coordinate a fix release within 10 days.
