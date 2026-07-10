## Problem
The keyboard shortcut hint in the Brain Dump capsule currently renders the literal text `\n`, which looks like a stray letter "n" with a backslash. The user wants it simple and clear.

## Proposed Change
In `src/components/quest-app.tsx`, update the `<kbd>` element at line ~269 to display a clean **return arrow** (`↵`) instead of `\n`. This is a single-character, universally understood "Enter/Return" symbol that avoids any confusion with the letter "n".

```text
Before: <kbd>\n</kbd>
After:  <kbd>↵</kbd>
```

## Alternative
If you prefer no shortcut hint at all, I can remove the `<kbd>` element entirely and keep the capsule cleaner.

## Scope
- One-line text change in `src/components/quest-app.tsx`.
- No logic, state, or backend changes.

Which direction would you like: the return arrow (`↵`) or remove the hint completely?