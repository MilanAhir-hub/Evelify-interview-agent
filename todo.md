# AI Interview Platform - Resume Upgrade TODO

**Target: 9/10+ resume readiness**

---

## Critical Security Fixes

- [x] **Verify Firebase ID tokens on backend**
  *Install `firebase-admin`, verify ID token server-side in `auth.controller.ts` instead of accepting untrusted `{ name, email }` from client. Update frontend to send `getIdToken()` after Google sign-in.*
  **Why:** The current backend trusts whatever name/email the client sends — any user can impersonate anyone. This is the #1 dealbreaker for technical interviews.
  **Impact:** Closes unauthorized access vector. Demonstrates security awareness.

- [x] **Remove secrets from Git history and rotate all keys**
  *Add `server/.env` and `client/.env` to `.gitignore`. Rotate MongoDB password, JWT secret, OpenRouter API key, Razorpay keys, Firebase API key. Use `git filter-branch` or BFG to purge secrets from history.*
  **Why:** Live database credentials and API keys are currently visible in the committed `.env` files. Any recruiter who sees `mongodb+srv://user:pass@cluster` on GitHub will reject the project immediately.
  **Impact:** Stops credential exposure. Required for any public repo.

- [x] **Add Zod input validation to all API routes**
  *Create validation schemas for: interview generation, answer submission, resume upload, aptitude submission, payment order/verify. Apply via Express middleware.*
  **Why:** User input is passed directly to MongoDB queries and AI prompts with zero validation. This enables prompt injection and data corruption.
  **Impact:** Closes injection vectors. Shows production security practices.

- [x] **Add rate limiting and security headers**
  *Configure `express-rate-limit` on auth, resume analysis, and AI generation endpoints. Add `helmet` for CSP, X-Frame-Options, etc.*
  **Why:** Unprotected endpoints can be abused to exhaust AI API credits or scrape user data.
  **Impact:** Prevents abuse. Required for production deployment.

- [x] **Replace fake tone analysis with genuine audio metrics**
  *Remove `Math.random()` tone selection in `Interview.tsx`. Replace with word count, speech rate, pause detection, or delete the feature entirely.*
  **Why:** The current implementation randomly picks a tone — this is deceptive and if discovered by a reviewer, destroys all credibility.
  **Impact:** Eliminates a credibility-destroying bug. Honest > fake.

---

## Core Reliability Improvements

- [x] **Add centralized error handling middleware**
  *Create `server/middlewares/errorHandler.ts` with consistent JSON error responses. Handle: AI timeout, DB errors, Multer errors, payment failures. Suppress stack traces in production.*
  **Why:** Every controller duplicates `try/catch` with inconsistent error formats.
  **Impact:** Reduces boilerplate, ensures consistent API responses.

- [x] **Add AI output schema validation with retry logic**
  *Validate AI JSON responses against Zod schemas before use. Add single retry with stricter prompt on parse failure. Validate: score ranges (0-10, 0-100), recommendation enum, array lengths.*
  **Why:** GPT can return malformed JSON, out-of-range scores, or invalid enums. Currently crashes or stores garbage data.
  **Impact:** Prevents corrupted reports. Makes AI integration robust.

- [x] **Add payment order persistence with replay protection**
  *Create `Payment` model tracking order lifecycle (`created` → `paid` → `failed`). Verify order ownership and amount before crediting. Block duplicate payment ID processing.*
  **Why:** No record of payment orders exists. Duplicate verification of the same payment ID could credit the user twice.
  **Impact:** Financial integrity. Real payment systems need this.

- [x] **Fix credit deduction to be atomic at session start**
  *Use `findOneAndUpdate` with `$inc: { credits: -10 }` and `$gte` filter to atomically check-and-deduct credits when generating questions. Remove deduction from report generation. Add refund if report generation fails.*
  **Why:** Credits are deducted on report generation, but the AI cost is incurred on question generation. If user never completes the interview, credits are never deducted.
  **Impact:** Correct billing. Prevents race conditions on credit balance.

- [x] **Add health check endpoint**
  *Create `GET /api/health` returning `{ status, dbStatus, uptime, timestamp }`.*
  **Why:** No way to verify server/database health. Required for deployment monitoring.
  **Impact:** Production monitoring capability.

- [x] **Add `.env.example` files and env-based configuration**
  *Create `server/.env.example` and `client/.env.example` with placeholder values. Read CORS origin, port, and other configs from environment variables.*
  **Why:** CORS is hardcoded to `localhost:5173`. Configuration is not environment-aware.
  **Impact:** Enables deployment to different environments without code changes.

- [x] **Add structured logging (Winston)**
  *Replace `console.log`/`console.error` with a logger supporting log levels, request IDs, and JSON output. Strip sensitive data from logs.*
  **Why:** Console logging is not searchable, filterable, or production-appropriate.
  **Impact:** Debugging, monitoring, and audit trail.

---

## AI Improvements

- [x] **Implement adaptive follow-up questions**
  *Instead of generating 5 static questions upfront, generate question N+1 based on the user's answer to question N. Include previous Q&A context in each AI call. Cap at 5 questions total.*
  **Why:** This is the single biggest differentiator. Fixed questions = basic quiz. Adaptive = realistic interview simulation.
  **Impact:** Massively increases interview prep value and AI credibility.

- [x] **Add structured evaluation rubric to AI prompts**
  *Define explicit scoring criteria in the system prompt: Communication (clarity, structure), Technical (accuracy, depth), Problem-solving (approach, reasoning), Confidence (specificity, ownership), Behavioral (STAR method).*
  **Why:** Without a rubric, AI scores are arbitrary and non-reproducible.
  **Impact:** Consistent, defensible scoring. Better user trust.

- [x] **Add personalized improvement plan to reports**
  *Instruct AI to generate a study roadmap (specific topics, resources, practice areas) based on weaknesses. Store in `InterviewReport` model. Display in report UI.*
  **Why:** Scores alone don't help users improve. A concrete "study these topics" plan adds real utility.
  **Impact:** Turns the report from a scorecard into a coaching tool.

---

## Testing

- [x] **Add authentication and authorization tests**
  *Test: Firebase token verification, cookie setting, token expiration, session restoration, cross-user session/report access blocked.*
  **Why:** Zero tests exist. Auth is the most security-critical path.
  **Impact:** Verifies the most critical security fix.

- [x] **Add AI evaluation and report generation tests**
  *Mock `openRouter.service.ts`. Test: parsing valid/invalid AI responses, retry behavior, score bounds, recommendation validation.*
  **Why:** AI outputs are the core product value. They must be reliable.
  **Impact:** Prevents corrupted reports from reaching users.

- [x] **Add payment verification tests**
  *Test: signature HMAC verification, duplicate payment ID rejection, order ownership validation, amount consistency.*
  **Why:** Payment bugs cost real money.
  **Impact:** Financial correctness guarantee.

- [x] **Add complete interview workflow integration test**
  *Test: resume upload → question generation → answer submission (all 5) → report generation → history fetch.*
  **Why:** The core user flow has no automated verification.
  **Impact:** Prevents regressions on the primary user journey.

---

## UI / UX Improvements

- [x] **Add AI failure recovery UI**
  *Show clear error states with retry buttons when AI calls fail in `Interview.tsx` (question gen, answer eval). Show loading progress steps ("Analyzing...", "Generating feedback...").*
  **Why:** Currently, AI failures result in silent errors or white screens.
  **Impact:** Users can recover from transient AI failures instead of losing their interview.

- [x] **Add interview exit protection**
  *Warn users with a confirmation dialog when leaving an active interview or aptitude test. Use `beforeunload` and React Router prompts.*
  **Why:** Users can accidentally lose an entire interview session with no warning.
  **Impact:** Prevents data loss. Professional UX pattern.

- [x] **Fix mobile interview layout**
  *Ensure timer, question text, voice/text controls, and submit button fit on mobile screens without overlap or clipping.*
  **Why:** The interview page is unusable on mobile. Many users practice on phones.
  **Impact:** Broader device support.

- [x] **Align upload limits between frontend and backend**
  *Change backend Multer limit from 10MB to 5MB to match the UI text "Max 5MB".*
  **Why:** Inconsistency between what the UI promises and what the server accepts.
  **Impact:** Eliminates confusing UX mismatch.

---

## Production Readiness

- [x] **Add database indexes for common queries**
  *Add indexes on: `InterviewSession.{userId, status}`, `InterviewReport.{interviewId, userId}`, `AptitudeAttempt.{userId}`, `Payment.{userId, razorpayOrderId}`.*
  **Why:** No indexes exist beyond Mongoose defaults. History queries will slow down as data grows.
  **Impact:** Query performance at scale.

---

## Final Verification

- [x] **Run lint, typecheck, and full test suite**
  *Ensure `tsc` compiles without errors, lint passes, and all tests pass.*
  **Why:** Final quality gate before considering the project resume-ready.
  **Impact:** Confirms all changes work together correctly.

---

# Completion Rules

1. TODO.md is the single source of truth.
2. Do not add new features outside this file.
3. Do not redesign the UI.
4. Do not perform unnecessary refactoring.
5. Do not create additional TODO items.
6. Mark tasks [x] only after implementation and verification.

# Stop Condition

When all tasks are completed:

- STOP immediately.
- Do not suggest new features.
- Do not perform extra optimizations.
- Do not perform additional refactors.
- Do not create new TODOs.

Generate a final report containing:

- Completed tasks
- Modified files
- Tests performed
- Final resume readiness score

Then stop all work.

# Target Score

Current: 5/10
Goal: 9/10+
