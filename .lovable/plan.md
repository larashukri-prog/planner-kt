## Fix high-severity dependency vulnerabilities

Update `@tanstack/react-start` to the latest patched version to pull in a fixed `undici` transitive dependency.

### Steps

1. Run `bun add @tanstack/react-start@latest` to upgrade past 1.167.50.
2. If the advisory persists (undici still pinned upstream), add a `resolutions`/`overrides` entry in `package.json` forcing `undici` to a patched version (≥6.21.2 / ≥7.x as required by the advisories).
3. Verify the dev server still boots and `/auth` + `/` render correctly.
4. Re-run the security scan to confirm the finding clears, then mark it fixed.

### Notes
- `undici` is only used server-side by TanStack Start's Worker runtime; no app code change needed.
- No functional/UI changes.