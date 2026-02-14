# AGENTS.md

## Purpose
- This file is the operating contract for coding agents in `/home/joypark/WORK5/lounge_fw`.
- It documents verified commands and coding conventions for this repository.
- If a rule here conflicts with explicit user instructions, follow the user.

## Repository Status (Verified)
- Workspace path: `/home/joypark/WORK5/lounge_fw`.
- Current state: no source files yet; documentation and Cursor rule files exist.
- No build/lint/test manifests discovered in this path.
- No `.git` repository detected in this path.
- No local style configs discovered (ESLint, Prettier, tsconfig, etc.).

## Agent Behavior in This Repo
- Treat this project as greenfield until real project files exist.
- Do not invent existing commands; only run commands backed by local files.
- Before implementing, scan for manifests and configs again.
- Prefer minimal, reversible changes.
- Never add broad refactors during bug fixes.

## Command Discovery Order (Run Before Any Build/Test Work)
- Check for Node manifests: `package.json`, lockfiles, workspace files.
- Check for Python manifests: `pyproject.toml`, `requirements*.txt`, `pytest.ini`.
- Check for Go manifests: `go.mod`, `go.work`, Make targets.
- Check for Rust manifests: `Cargo.toml` and workspace members.
- Check for general task runners: `Makefile`, `justfile`, `Taskfile.yml`.
- Check CI definitions in `.github/workflows/*.yml` for canonical commands.

## Build / Lint / Test Commands

### Current Verified Commands
- Build: not configured yet.
- Lint: not configured yet.
- Test: not configured yet.
- Single test execution: not configured yet.

### Command Policy
- Only execute commands that are present in local config/scripts.
- Prefer package-manager scripts over ad-hoc shell commands.
- If multiple command sources disagree, prefer CI workflow definitions.
- If no command source exists, ask user before scaffolding tooling.

### Single-Test Patterns (Templates, Not Yet Repo Commands)
- Jest/Vitest: `npm test -- <path-or-test-name>`.
- Pytest: `pytest path/to/test_file.py::test_name`.
- Go: `go test ./path/to/pkg -run TestName`.
- Rust: `cargo test test_name`.
- Playwright: `npx playwright test path/to/spec.ts -g "test name"`.
- Use these only after confirming the tool exists in this repo.

## Code Style Baseline (Until Repo-Specific Rules Exist)

### Imports
- Group imports by standard library, third-party, then internal.
- Keep imports explicit; avoid wildcard imports unless ecosystem requires it.
- Remove unused imports.
- Prefer absolute/aliased imports only when alias config exists.

### Formatting
- Use the repository formatter if configured; do not hand-format large files.
- Keep lines readable; aim around 100 chars unless formatter enforces otherwise.
- Keep diffs small and focused.
- Do not reformat unrelated files in the same change.

### Types and Interfaces
- Prefer strict typing over implicit `any`.
- Do not bypass type safety (`as any`, `@ts-ignore`, `@ts-expect-error`).
- Add explicit types on exported functions and public interfaces.
- Model domain concepts with named types/interfaces, not loose maps.

### Naming
- `camelCase` for variables and functions.
- `PascalCase` for classes, types, and UI components.
- `UPPER_SNAKE_CASE` for constants and env keys.
- Use descriptive names; avoid opaque abbreviations.

### Functions and Modules
- Keep functions small and single-purpose.
- Keep modules cohesive; avoid circular dependencies.
- Prefer pure functions for transform logic.
- Keep side effects at clear boundaries (I/O, network, DB).

### Error Handling
- Fail fast with actionable errors.
- Never leave empty `catch` blocks.
- Preserve root cause when wrapping/rethrowing errors.
- Return structured errors at API boundaries.

### Logging and Observability
- Log context needed for debugging (input IDs, operation, failure reason).
- Never log secrets or sensitive tokens.
- Use consistent log levels (`debug`, `info`, `warn`, `error`).

### Tests
- Add or update tests with behavioral code changes.
- Keep tests deterministic and isolated.
- Prefer testing behavior over implementation details.
- For bug fixes, add a regression test when practical.

### Dependency Management
- Prefer existing dependencies already used by the project.
- Add new dependencies only with clear justification.
- Pin versions according to repo conventions once established.

### Security
- Validate all untrusted inputs at boundaries.
- Do not commit secrets, keys, or `.env` values.
- Use least-privilege defaults for auth/config.
- Prefer safe defaults over permissive behavior.

### Performance
- Optimize only after identifying a real bottleneck.
- Avoid premature micro-optimizations.
- Keep algorithmic complexity in mind for loops and data access.

### Git Practices
- Do not commit unless the user explicitly asks.
- Avoid destructive git commands unless explicitly requested.
- Keep commits focused and atomic when committing is requested.

## Cursor / Copilot Rules (Verified)
- `.cursor/rules/karpathy-guidelines.mdc`: found (`alwaysApply: true`).
- `.cursorrules`: not found in this repo.
- `.github/copilot-instructions.md`: not found in this repo.

### Active Cursor Rule Summary
- Rule file: `.cursor/rules/karpathy-guidelines.mdc`.
- Core behavior: think before coding, state assumptions, and ask when ambiguous.
- Simplicity policy: implement only requested scope; avoid speculative abstractions.
- Change policy: make surgical edits only; avoid unrelated refactors/cleanup.
- Execution policy: define verifiable success criteria and verify each step.

### Cursor Rule Self-Check (Before Final Answer)
- Did I explicitly note assumptions that materially affect the outcome?
- If ambiguity existed, did I ask early or record the chosen assumption clearly?
- Did I keep scope to the user request (no speculative features or abstractions)?
- Does every changed line trace directly to the request?
- Did I avoid unrelated refactors/formatting outside the touched scope?
- Did I define and run concrete verification steps for what I changed?

### Action for Agents
- Treat active Cursor rules as mandatory constraints alongside this AGENTS.md.
- If additional Cursor/Copilot rule files are added later, re-scan and update this section immediately.

## Additional Architecture Rules (User-Mandated)
- Treat this checklist as mandatory for every prompt and review it last before finalizing work.
- Follow clean architecture.
- Use separation of concerns.
- Avoid inline logic in components.
- Extract Supabase queries into a repository layer.
- Make components reusable.
- Use TypeScript properly.

## How Agents Should Update This File
- Re-scan manifests and style configs after major repo changes.
- Replace "not configured yet" entries with verified commands immediately.
- Add exact single-test command examples once test framework exists.
- Keep statements evidence-based; avoid assumptions.

## Verification Checklist for Agents
- Did you cite only commands proven by local files?
- Did you follow import and naming conventions above?
- Did you avoid type suppression shortcuts?
- Did you run the narrowest test scope available?
- Did you avoid unrelated formatting or refactors?

## Fast Start for New Contributors
- Step 1: Inspect root for manifests and lockfiles.
- Step 2: Inspect CI workflows for canonical commands.
- Step 3: Run install only after confirming package manager.
- Step 4: Run lint/test/build from configured scripts.
- Step 5: Use single-test command pattern for fast iteration.

## Future Tightening (When Project Matures)
- Add concrete command matrix with exact command strings.
- Add language-specific style sections (TS, Python, Go, etc.).
- Add architecture boundaries and module ownership.
- Add testing pyramid and coverage expectations.
- Add release, versioning, and deployment conventions.

---

Last updated: 2026-02-14 (Asia/Seoul)
Evidence basis: local scan of `/home/joypark/WORK5/lounge_fw` only.
