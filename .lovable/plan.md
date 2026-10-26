# Swap button emphasis on the sign-in page

## What changes
- **Empty form (default):** "Try Demo Mode" is the filled green/teal button. "Sign in" is the plain outlined button.
- **As soon as the user types in the email or password box:** the colors swap. "Sign in" turns filled green/teal and "Try Demo Mode" becomes the plain outlined button.
- If both boxes are cleared again, the colors go back to the default.
- The colors fade smoothly when they swap, so the change isn't jarring.
- Works the same on the "Create account" form.

## Technical details
- File: `src/components/auth-screen.tsx` only.
- `const hasInput = email.length > 0 || password.length > 0`.
- Two shared class strings (primary: neon fill + `--color-neon-foreground` + glow; secondary: neon border, transparent bg, `--color-neon-text`), picked per button based on `hasInput`. Both keep the existing focus ring, 44px height, and `transition-colors`.
- Uses existing contrast-safe tokens, so WCAG AA holds in light and dark mode.
